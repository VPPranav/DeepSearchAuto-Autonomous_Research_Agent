import asyncio
import trafilatura
from typing import List
from models.schema import Source

async def scrape_source(url: str) -> str:
    """Scrape web page content using Trafilatura."""
    def fetch_and_extract():
        try:
            downloaded = trafilatura.fetch_url(url)
            if downloaded:
                extracted = trafilatura.extract(downloaded)
                return extracted or ""
            return ""
        except Exception as e:
            print(f"[SCRAPER] Error scraping {url}: {e}")
            return ""

    loop = asyncio.get_event_loop()
    try:
        content = await asyncio.wait_for(
            loop.run_in_executor(None, fetch_and_extract),
            timeout=15.0
        )
        return content or ""
    except asyncio.TimeoutError:
        print(f"[SCRAPER] Timeout scraping {url}")
        return ""

async def scrape_multiple(sources: List[Source]) -> List[Source]:
    """Scrape multiple sources concurrently."""
    tasks = [scrape_source(source.url) for source in sources]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    for i, res in enumerate(results):
        if isinstance(res, Exception):
            sources[i].content = "Failed to scrape"
            print(f"[SCRAPER] Exception for {sources[i].url}: {res}")
        else:
            sources[i].content = res if res else "No content extracted"

    return sources
