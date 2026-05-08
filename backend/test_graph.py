"""Test script to run the research graph directly."""
import asyncio
import sys
import os

# Add parent to path so imports work when run from project root
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from models.schema import ResearchRequest
from agents.researcher import research_graph


async def main():
    query = sys.argv[1] if len(sys.argv) > 1 else "solid state batteries"
    print(f"\n{'='*60}")
    print(f"Testing research graph with query: '{query}'")
    print(f"{'='*60}\n")

    request = ResearchRequest(query=query)
    initial_state = {
        "request": request,
        "sub_questions": [],
        "report": None,
        "status": "started",
    }

    try:
        async for output in research_graph.astream(initial_state):
            node_name = list(output.keys())[0]
            node_output = output[node_name]
            status = node_output.get("status", "unknown")
            print(f"\n[NODE: {node_name}] Status: {status}")

            sub_qs = node_output.get("sub_questions", [])
            if sub_qs:
                print(f"  Sub-questions ({len(sub_qs)}):")
                for i, sq in enumerate(sub_qs):
                    print(f"    {i+1}. {sq.question}")
                    if sq.sources:
                        print(f"       Sources: {len(sq.sources)}")

            report = node_output.get("report")
            if report:
                print(f"\n{'='*60}")
                print(f"REPORT GENERATED")
                print(f"{'='*60}")
                print(f"Query: {report.query}")
                print(f"\nExecutive Summary:\n{report.executive_summary[:300]}...")
                print(f"\nConclusion:\n{report.conclusion[:200]}...")
                print(f"\nConfidence: {report.overall_confidence * 100:.0f}%")

    except Exception as e:
        import traceback
        print(f"\nERROR: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
