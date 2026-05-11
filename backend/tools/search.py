import os
from typing import List
import httpx
from models.schema import Source

SERPAPI_KEY = os.getenv("SERPAPI_KEY")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
SEARCH_PROVIDER = os.getenv("SEARCH_PROVIDER", "").lower()


def _get_search_provider() -> str:
    """Determine which search provider to use."""
    if SEARCH_PROVIDER == "tavily":
        return "tavily"
    if SEARCH_PROVIDER == "serpapi":
        return "serpapi"
    # Auto-detect based on available keys
    if TAVILY_API_KEY:
        return "tavily"
    if SERPAPI_KEY:
        return "serpapi"
    return "mock"


async def _search_tavily(query: str, num_results: int) -> List[Source]:
    """Perform a search using the Tavily API."""
    from tavily import AsyncTavilyClient

    try:
        client = AsyncTavilyClient(api_key=TAVILY_API_KEY)
        response = await client.search(
            query=query,
            max_results=num_results,
            search_depth="basic",
        )
        sources = []
        for result in response.get("results", []):
            sources.append(Source(
                url=result.get("url", ""),
                title=result.get("title", ""),
                snippet=result.get("content", ""),
                credibility_score=result.get("score", 0.8),
            ))
        return sources
    except Exception as e:
        print(f"[SEARCH] Tavily search failed: {e}")
        return []


async def _search_serpapi(query: str, num_results: int) -> List[Source]:
    """Perform a search using SerpAPI."""
    url = "https://serpapi.com/search.json"
    params = {
        "engine": "google",
        "q": query,
        "api_key": SERPAPI_KEY,
        "num": num_results
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, params=params)
            if response.status_code == 200:
                data = response.json()
                results = data.get("organic_results", [])
                sources = []
                for res in results:
                    sources.append(Source(
                        url=res.get("link", ""),
                        title=res.get("title", ""),
                        snippet=res.get("snippet", ""),
                        credibility_score=0.8
                    ))
                return sources
            else:
                print(f"[SEARCH] SerpAPI returned status {response.status_code}")
                return []
    except Exception as e:
        print(f"[SEARCH] SerpAPI search failed: {e}")
        return []


def _mock_results(query: str, num_results: int) -> List[Source]:
    """Return mock results for local development."""
    return [
        Source(
            url=f"https://en.wikipedia.org/wiki/{query.replace(' ', '_')}",
            title=f"Wikipedia: {query}",
            snippet=f"Comprehensive overview of {query} including history, applications and recent developments.",
            credibility_score=0.9
        ),
        Source(
            url=f"https://www.nature.com/search?q={query.replace(' ', '+')}",
            title=f"Nature: Research on {query}",
            snippet=f"Latest scientific research and findings related to {query}.",
            credibility_score=0.95
        ),
        Source(
            url=f"https://arxiv.org/search/?query={query.replace(' ', '+')}",
            title=f"ArXiv: Academic papers on {query}",
            snippet=f"Preprint academic papers and studies about {query}.",
            credibility_score=0.85
        ),
    ][:num_results]


async def perform_search(query: str, num_results: int = 5) -> List[Source]:
    """Perform a search using the configured provider (Tavily, SerpAPI, or mock)."""
    provider = _get_search_provider()

    if provider == "tavily":
        print(f"[SEARCH] Using Tavily for: {query}")
        return await _search_tavily(query, num_results)
    elif provider == "serpapi":
        print(f"[SEARCH] Using SerpAPI for: {query}")
        return await _search_serpapi(query, num_results)
    else:
        print(f"[SEARCH] Warning: No search API key set. Returning mock results for: {query}")
        return _mock_results(query, num_results)
