"""
Pipeline Execution Engine
─────────────────────────
Executes a pipeline graph in topological order.
Each node type has a dedicated runner function.
"""

import re
import json
import asyncio
from collections import deque
from datetime import datetime

import httpx
from llm_service import call_llm, LLMError


class ExecutionContext:
    """Holds state for a single pipeline run."""

    def __init__(self, nodes: list[dict], edges: list[dict]):
        self.nodes = {n["id"]: n for n in nodes}
        self.edges = edges
        self.results: dict[str, dict] = {}  # node_id → { output, status, duration_ms }
        self.errors: list[dict] = []
        self.start_time = None
        self.end_time = None

    @property
    def duration_ms(self):
        if self.start_time and self.end_time:
            return round((self.end_time - self.start_time).total_seconds() * 1000)
        return 0


def topological_sort(nodes: dict, edges: list[dict]) -> list[str]:
    """Return node IDs in execution order using Kahn's algorithm."""
    in_degree = {nid: 0 for nid in nodes}
    adjacency = {nid: [] for nid in nodes}

    for edge in edges:
        src = edge["source"]
        tgt = edge["target"]
        if src in nodes and tgt in nodes:
            adjacency[src].append(tgt)
            in_degree[tgt] += 1

    queue = deque(nid for nid, deg in in_degree.items() if deg == 0)
    order = []

    while queue:
        nid = queue.popleft()
        order.append(nid)
        for neighbor in adjacency[nid]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    if len(order) != len(nodes):
        raise ValueError("Pipeline contains a cycle — cannot execute")

    return order


def get_input_values(node_id: str, edges: list[dict], results: dict, nodes: dict) -> list[str]:
    """Gather output values from connected nodes, respecting condition branches."""
    inputs = []
    for edge in edges:
        if edge["target"] == node_id and edge["source"] in results:
            source_result = results[edge["source"]]
            source_node = nodes.get(edge["source"], {})

            # Branch-aware routing for condition nodes
            if source_node.get("type") == "conditionNode":
                branch = source_result.get("branch")
                # Use sourceHandle to match which branch this edge connects from
                source_handle = edge.get("sourceHandle", "")
                if source_handle == "true" and branch != "true":
                    continue  # Skip — condition was false, don't send on true branch
                if source_handle == "false" and branch != "false":
                    continue  # Skip — condition was true, don't send on false branch

            if source_result.get("output") is not None:
                inputs.append(str(source_result["output"]))
    return inputs


# ═══════════════════════════════════════════
#  NODE RUNNERS
# ═══════════════════════════════════════════

def run_input_node(data: dict, inputs: list[str]) -> str:
    """Input node — returns its configured text."""
    return data.get("inputText", "")


def run_text_node(data: dict, inputs: list[str]) -> str:
    """Text node — renders a template with {{variable}} substitution."""
    template = data.get("template", "")
    if not template:
        return ""

    # Simple substitution: replace {{0}}, {{1}}, ... with inputs
    for i, value in enumerate(inputs):
        template = template.replace(f"{{{{{i}}}}}", value)

    # Also replace named variables with first input if available
    if inputs:
        template = re.sub(r"\{\{\w+\}\}", inputs[0], template)

    return template


def run_transform_node(data: dict, inputs: list[str]) -> str:
    """Transform node — applies a text transformation."""
    text = "\n".join(inputs) if inputs else ""
    transform_type = data.get("transformType", "uppercase")

    match transform_type:
        case "uppercase":
            return text.upper()
        case "lowercase":
            return text.lower()
        case "trim":
            return text.strip()
        case "regex_replace":
            pattern = data.get("pattern", "")
            replacement = data.get("replacement", "")
            try:
                return re.sub(pattern, replacement, text)
            except re.error as e:
                raise ValueError(f"Invalid regex: {e}")
        case "json_extract":
            path = data.get("pattern", "")
            try:
                obj = json.loads(text)
                for key in path.split("."):
                    if key.endswith("]"):
                        # Handle array indexing like "items[0]"
                        base, idx = key[:-1].split("[")
                        obj = obj[base][int(idx)]
                    else:
                        obj = obj[key]
                return json.dumps(obj) if isinstance(obj, (dict, list)) else str(obj)
            except (json.JSONDecodeError, KeyError, IndexError, TypeError) as e:
                raise ValueError(f"JSON extract failed: {e}")
        case "split":
            delimiter = data.get("pattern", ",")
            return json.dumps(text.split(delimiter))
        case "join":
            delimiter = data.get("pattern", ",")
            try:
                items = json.loads(text)
                if isinstance(items, list):
                    return delimiter.join(str(x) for x in items)
            except json.JSONDecodeError:
                pass
            return text
        case _:
            return text


def run_condition_node(data: dict, inputs: list[str], edges: list[dict], node_id: str) -> dict:
    """Condition node — evaluates condition and returns result with branch info."""
    text = "\n".join(inputs) if inputs else ""
    condition_type = data.get("conditionType", "contains")
    condition_value = data.get("conditionValue", "")

    match condition_type:
        case "contains":
            result = condition_value in text
        case "equals":
            result = text == condition_value
        case "not_equals":
            result = text != condition_value
        case "starts_with":
            result = text.startswith(condition_value)
        case "ends_with":
            result = text.endswith(condition_value)
        case "regex_match":
            try:
                result = bool(re.search(condition_value, text))
            except re.error:
                result = False
        case "length_gt":
            try:
                result = len(text) > int(condition_value)
            except ValueError:
                result = False
        case "length_lt":
            try:
                result = len(text) < int(condition_value)
            except ValueError:
                result = False
        case "is_empty":
            result = len(text.strip()) == 0
        case "not_empty":
            result = len(text.strip()) > 0
        case _:
            result = False

    return {
        "output": text,
        "condition_result": result,
        "branch": "true" if result else "false",
    }


async def run_llm_node(data: dict, inputs: list[str]) -> str:
    """LLM node — calls the configured LLM provider."""
    provider = data.get("provider", "openai")
    model = data.get("model", "gpt-3.5-turbo")
    prompt = "\n".join(inputs) if inputs else ""
    system_prompt = data.get("systemPrompt", "")
    temperature = data.get("temperature", 0.7)
    max_tokens = data.get("maxTokens", 1024)

    if not prompt.strip():
        return "[No input provided to LLM]"

    try:
        return await call_llm(
            provider=provider,
            model=model,
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=temperature,
            max_tokens=max_tokens,
        )
    except LLMError as e:
        raise ValueError(str(e))


def run_output_node(data: dict, inputs: list[str]) -> str:
    """Output node — formats and returns the collected inputs."""
    text = "\n".join(inputs) if inputs else ""
    fmt = data.get("format", "text")

    match fmt:
        case "json":
            try:
                parsed = json.loads(text)
                return json.dumps(parsed, indent=2)
            except json.JSONDecodeError:
                return json.dumps({"output": text}, indent=2)
        case "markdown":
            return text
        case _:
            return text


async def run_api_node(data: dict, inputs: list[str]) -> str:
    """API node — makes an HTTP request using httpx."""
    method = (data.get("method", "GET")).upper()
    url = data.get("url", "")
    if not url:
        raise ValueError("No URL configured for API node")

    # Parse headers
    headers = data.get("headers", {})
    if isinstance(headers, str):
        try:
            headers = json.loads(headers)
        except json.JSONDecodeError:
            headers = {}

    # Build request body from config or connected inputs
    body = data.get("body", "")
    input_text = "\n".join(inputs) if inputs else ""

    if body:
        # Substitute {{input}} placeholder with connected data
        body = body.replace("{{input}}", input_text)
    elif input_text and method in ("POST", "PUT", "PATCH"):
        body = input_text

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            if method == "GET":
                response = await client.get(url, headers=headers)
            elif method == "POST":
                response = await client.post(url, headers=headers, content=body)
            elif method == "PUT":
                response = await client.put(url, headers=headers, content=body)
            elif method == "PATCH":
                response = await client.patch(url, headers=headers, content=body)
            elif method == "DELETE":
                response = await client.delete(url, headers=headers)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")

            response.raise_for_status()
            return response.text

    except httpx.HTTPStatusError as e:
        raise ValueError(f"HTTP {e.response.status_code}: {e.response.text[:200]}")
    except httpx.RequestError as e:
        raise ValueError(f"Request failed: {e}")


# ═══════════════════════════════════════════
#  MAIN EXECUTOR
# ═══════════════════════════════════════════

NODE_RUNNERS = {
    "inputNode": run_input_node,
    "textNode": run_text_node,
    "transformNode": run_transform_node,
    "outputNode": run_output_node,
    # conditionNode and llmNode handled separately (async)
}


async def execute_pipeline(nodes: list[dict], edges: list[dict]) -> dict:
    """Execute an entire pipeline and return results."""
    ctx = ExecutionContext(nodes, edges)
    ctx.start_time = datetime.utcnow()

    try:
        order = topological_sort(ctx.nodes, edges)
    except ValueError as e:
        ctx.end_time = datetime.utcnow()
        return {
            "status": "error",
            "error": str(e),
            "results": {},
            "duration_ms": ctx.duration_ms,
        }

    for node_id in order:
        node = ctx.nodes[node_id]
        node_type = node.get("type", "unknown")
        data = node.get("data", {})
        inputs = get_input_values(node_id, edges, ctx.results, ctx.nodes)

        node_start = datetime.utcnow()

        try:
            if node_type == "conditionNode":
                result = run_condition_node(data, inputs, edges, node_id)
                ctx.results[node_id] = {
                    **result,
                    "status": "completed",
                    "node_type": node_type,
                    "duration_ms": round((datetime.utcnow() - node_start).total_seconds() * 1000),
                }
            elif node_type == "llmNode":
                # LLM nodes are async
                output = await run_llm_node(data, inputs)
                ctx.results[node_id] = {
                    "output": output,
                    "status": "completed",
                    "node_type": node_type,
                    "duration_ms": round((datetime.utcnow() - node_start).total_seconds() * 1000),
                }
            elif node_type == "apiNode":
                # API nodes are async
                output = await run_api_node(data, inputs)
                ctx.results[node_id] = {
                    "output": output,
                    "status": "completed",
                    "node_type": node_type,
                    "duration_ms": round((datetime.utcnow() - node_start).total_seconds() * 1000),
                }
            else:
                runner = NODE_RUNNERS.get(node_type)
                if runner is None:
                    raise ValueError(f"Unknown node type: {node_type}")

                output = runner(data, inputs)
                ctx.results[node_id] = {
                    "output": output,
                    "status": "completed",
                    "node_type": node_type,
                    "duration_ms": round((datetime.utcnow() - node_start).total_seconds() * 1000),
                }

        except Exception as e:
            ctx.results[node_id] = {
                "output": None,
                "status": "error",
                "error": str(e),
                "node_type": node_type,
                "duration_ms": round((datetime.utcnow() - node_start).total_seconds() * 1000),
            }
            ctx.errors.append({"node_id": node_id, "error": str(e)})

    ctx.end_time = datetime.utcnow()

    has_errors = len(ctx.errors) > 0
    return {
        "status": "completed_with_errors" if has_errors else "completed",
        "results": ctx.results,
        "errors": ctx.errors,
        "duration_ms": ctx.duration_ms,
        "node_count": len(nodes),
        "executed_count": len(ctx.results),
    }
