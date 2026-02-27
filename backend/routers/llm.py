from fastapi import APIRouter
from llm_service import get_available_providers

router = APIRouter(prefix="/api/llm", tags=["llm"])


@router.get("/providers")
def list_providers():
    """Return which LLM providers have API keys configured."""
    providers = get_available_providers()
    return {
        "providers": providers,
        "any_configured": any(providers.values()),
    }
