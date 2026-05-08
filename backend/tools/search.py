import os
from typing import List
import httpx
from models.schema import Source

SERPAPI_KEY = os.getenv("SERPAPI_KEY")

async def perform_search(query: str, num_results: int = 5) -> List[Source]:
    """Perform a search using SerpAPI or return mock results."""
    if not SERPAPI_KEY:
        print(f"[SEARCH] Warning: SERPAPI_KEY not set. Returning mock results for: {query}")
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
        print(f"[SEARCH] Search failed: {e}")
        return []
