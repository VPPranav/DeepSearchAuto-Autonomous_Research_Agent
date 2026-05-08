
import os
import asyncio
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from agents.researcher import research_graph
from models.schema import ResearchRequest

async def test_research():
    print("Testing research graph...")
    request = ResearchRequest(query="What is the latest in solid-state batteries?", depth="standard")
    
    initial_state = {
        "request": request,
        "sub_questions": [],
        "report": None,
        "status": "started"
    }
    
    try:
        print("Starting stream...")
        async for output in research_graph.astream(initial_state):
            node_name = list(output.keys())[0]
            node_output = output[node_name]
            print(f"Node: {node_name}, Status: {node_output.get('status')}")
            
            if node_output.get("report"):
                print("Report generated successfully!")
                break
    except Exception as e:
        print(f"Error during research: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_research())
