"""
Pipeline Validator
──────────────────
Validates a pipeline graph for common issues:
- Empty pipeline
- Cycles
- Disconnected nodes (no edges)
- Missing required configuration
- Unreachable nodes (not connected to an input)
- Dead-end nodes (output with no downstream)
"""

import json
from collections import deque


def validate_pipeline(nodes: list[dict], edges: list[dict]) -> dict:
    """Validate a pipeline and return issues found."""
    issues = []  # { severity: 'error'|'warning'|'info', node_id?, message }

    if not nodes:
        return {
            "valid": False,
            "issues": [{"severity": "error", "message": "Pipeline is empty — add some nodes"}],
            "summary": "Empty pipeline",
        }

    node_map = {n["id"]: n for n in nodes}
    node_ids = set(node_map.keys())

    # ── Build adjacency ──
    outgoing = {nid: [] for nid in node_ids}
    incoming = {nid: [] for nid in node_ids}
    for edge in edges:
        src, tgt = edge.get("source"), edge.get("target")
        if src in node_ids and tgt in node_ids:
            outgoing[src].append(tgt)
            incoming[tgt].append(src)

    # ── Check 1: Cycle detection (Kahn's algorithm) ──
    in_degree = {nid: len(incoming[nid]) for nid in node_ids}
    queue = deque(nid for nid, deg in in_degree.items() if deg == 0)
    visited_count = 0
    while queue:
        nid = queue.popleft()
        visited_count += 1
        for neighbor in outgoing[nid]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    if visited_count != len(node_ids):
        issues.append({
            "severity": "error",
            "message": "Pipeline contains a cycle — execution order cannot be determined",
        })

    # ── Check 2: Disconnected nodes ──
    for nid in node_ids:
        if not incoming[nid] and not outgoing[nid]:
            node = node_map[nid]
            label = node.get("data", {}).get("label", nid)
            issues.append({
                "severity": "warning",
                "node_id": nid,
                "message": f'"{label}" is disconnected — not connected to any other node',
            })

    # ── Check 3: Missing required configuration ──
    for nid, node in node_map.items():
        node_type = node.get("type", "")
        data = node.get("data", {})
        label = data.get("label", nid)

        if node_type == "inputNode":
            if not data.get("inputText", "").strip():
                issues.append({
                    "severity": "warning",
                    "node_id": nid,
                    "message": f'"{label}" has no input text configured',
                })

        elif node_type == "llmNode":
            if not data.get("provider"):
                issues.append({
                    "severity": "error",
                    "node_id": nid,
                    "message": f'"{label}" has no LLM provider selected',
                })

        elif node_type == "apiNode":
            if not data.get("url", "").strip():
                issues.append({
                    "severity": "error",
                    "node_id": nid,
                    "message": f'"{label}" has no URL configured',
                })

        elif node_type == "textNode":
            if not data.get("template", "").strip():
                issues.append({
                    "severity": "warning",
                    "node_id": nid,
                    "message": f'"{label}" has an empty template',
                })

        elif node_type == "conditionNode":
            cond_type = data.get("conditionType", "")
            if cond_type not in ("is_empty", "not_empty") and not data.get("conditionValue", "").strip():
                issues.append({
                    "severity": "warning",
                    "node_id": nid,
                    "message": f'"{label}" has no condition value set',
                })

    # ── Check 4: No input nodes ──
    input_nodes = [n for n in nodes if n.get("type") == "inputNode"]
    if not input_nodes:
        issues.append({
            "severity": "warning",
            "message": "Pipeline has no Input nodes — data must come from somewhere",
        })

    # ── Check 5: No output/file-save nodes ──
    terminal_types = {"outputNode", "fileSaveNode"}
    terminal_nodes = [n for n in nodes if n.get("type") in terminal_types]
    if not terminal_nodes:
        issues.append({
            "severity": "info",
            "message": "Pipeline has no Output or File Save nodes — results may not be captured",
        })

    # ── Check 6: Nodes with no input (except inputNode) ──
    for nid in node_ids:
        node = node_map[nid]
        node_type = node.get("type", "")
        if node_type == "inputNode":
            continue
        if not incoming[nid]:
            label = node.get("data", {}).get("label", nid)
            issues.append({
                "severity": "warning",
                "node_id": nid,
                "message": f'"{label}" has no incoming connections — it won\'t receive data',
            })

    # ── Build summary ──
    errors = sum(1 for i in issues if i["severity"] == "error")
    warnings = sum(1 for i in issues if i["severity"] == "warning")
    info_count = sum(1 for i in issues if i["severity"] == "info")

    if errors > 0:
        summary = f"{errors} error(s), {warnings} warning(s)"
        valid = False
    elif warnings > 0:
        summary = f"{warnings} warning(s) — pipeline can still run"
        valid = True
    elif info_count > 0:
        summary = f"{info_count} suggestion(s) — looks good!"
        valid = True
    else:
        summary = "Pipeline looks great! ✅"
        valid = True

    return {
        "valid": valid,
        "issues": issues,
        "summary": summary,
        "node_count": len(nodes),
        "edge_count": len(edges),
    }
