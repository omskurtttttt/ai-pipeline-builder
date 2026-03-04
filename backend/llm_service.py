"""
LLM Service
────────────
Unified interface for calling OpenAI and Google Gemini models.
Reads API keys from environment variables.
"""

import os
from dotenv import load_dotenv

load_dotenv()


class LLMError(Exception):
    """Raised when an LLM API call fails."""
    pass


async def call_openai(
    prompt: str,
    model: str = "gpt-3.5-turbo",
    system_prompt: str = "",
    temperature: float = 0.7,
    max_tokens: int = 1024,
) -> str:
    """Call OpenAI Chat Completions API."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise LLMError("OPENAI_API_KEY not set — add it to your .env file")

    try:
        from openai import AsyncOpenAI

        client = AsyncOpenAI(api_key=api_key)

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        response = await client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )

        return response.choices[0].message.content

    except ImportError:
        raise LLMError("openai package not installed — run: pip install openai")
    except Exception as e:
        raise LLMError(f"OpenAI API error: {e}")


async def call_gemini(
    prompt: str,
    model: str = "gemini-2.0-flash",
    system_prompt: str = "",
    temperature: float = 0.7,
    max_tokens: int = 1024,
) -> str:
    """Call Google Gemini API using the new google-genai SDK."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise LLMError("GEMINI_API_KEY not set — add it to your .env file")

    try:
        from google import genai

        client = genai.Client(api_key=api_key)

        config = {
            "temperature": temperature,
            "max_output_tokens": max_tokens,
        }
        if system_prompt:
            config["system_instruction"] = system_prompt

        response = client.models.generate_content(
            model=model,
            contents=prompt,
            config=config,
        )

        return response.text

    except ImportError:
        raise LLMError("google-genai package not installed — run: pip install google-genai")
    except Exception as e:
        raise LLMError(f"Gemini API error: {e}")


async def call_llm(
    provider: str = "openai",
    model: str = "gpt-3.5-turbo",
    prompt: str = "",
    system_prompt: str = "",
    temperature: float = 0.7,
    max_tokens: int = 1024,
) -> str:
    """Unified LLM call — dispatches to the correct provider."""
    if provider == "gemini":
        return await call_gemini(
            prompt=prompt,
            model=model,
            system_prompt=system_prompt,
            temperature=temperature,
            max_tokens=max_tokens,
        )
    else:
        return await call_openai(
            prompt=prompt,
            model=model,
            system_prompt=system_prompt,
            temperature=temperature,
            max_tokens=max_tokens,
        )


def get_available_providers() -> dict:
    """Check which LLM providers have API keys configured."""
    return {
        "openai": bool(os.getenv("OPENAI_API_KEY")),
        "gemini": bool(os.getenv("GEMINI_API_KEY")),
    }
