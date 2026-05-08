from fastapi import FastAPI, BackgroundTasks, WebSocket, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uuid
import asyncio
from typing import Dict
import os
from dotenv import load_dotenv

# Unset proxy variables to prevent httpx 0.28.0+ 'proxies' keyword crash
if "HTTP_PROXY" in os.environ:
    del os.environ["HTTP_PROXY"]
if "HTTPS_PROXY" in os.environ:
    del os.environ["HTTPS_PROXY"]
if "http_proxy" in os.environ:
    del os.environ["http_proxy"]
if "https_proxy" in os.environ:
    del os.environ["https_proxy"]

load_dotenv()

from models.schema import ResearchRequest, ResearchReport
from agents.researcher import research_graph
from fastapi.encoders import jsonable_encoder
from fastapi.responses import StreamingResponse
from export_utils import generate_pdf, generate_docx

app = FastAPI(title="AI Web Research Agent API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for tasks
tasks: Dict[str, dict] = {}

class StartTaskResponse(BaseModel):
    task_id: str
    message: str

async def run_research_task(task_id: str, request: ResearchRequest):
    """Run the full LangGraph research pipeline and update task state."""
    try:
        # Immediate status update to show progress
        tasks[task_id]["status"] = "planning"
        tasks[task_id]["state"]["status"] = "planning"
        tasks[task_id] = tasks[task_id]
        print(f"[TASK {task_id}] Starting research pipeline for: {request.query}")

        initial_state = {
            "request": request,
            "sub_questions": [],
            "report": None,
            "status": "started"
        }

        async for output in research_graph.astream(initial_state):
            node_name = list(output.keys())[0]
            node_output = output[node_name]

            status = node_output.get("status", "processing")
            tasks[task_id]["status"] = status

            # Always store the full state so WebSocket can broadcast it
            state_data = {
                "status": status,
                "sub_questions": [sq.model_dump() for sq in node_output.get("sub_questions", [])],
            }

            report = node_output.get("report")
            if report:
                state_data["report"] = report.model_dump()
                tasks[task_id]["result"] = report.model_dump()

            tasks[task_id]["state"] = state_data
            # Force an update to the tasks dict to ensure visibility
            tasks[task_id] = tasks[task_id]
            print(f"[TASK {task_id}] Node '{node_name}' completed with status '{status}'")

        # After the loop finishes, mark as completed if it hasn't failed
        if tasks[task_id]["status"] != "failed":
            tasks[task_id]["status"] = "completed"
            tasks[task_id]["state"]["status"] = "completed"
            tasks[task_id] = tasks[task_id]

    except Exception as e:
        import traceback
        traceback.print_exc()
        tasks[task_id]["status"] = "failed"
        tasks[task_id]["error"] = str(e)
        tasks[task_id]["state"] = {"status": "failed", "error": str(e)}

@app.post("/api/research/start", response_model=StartTaskResponse)
async def start_research(request: ResearchRequest, background_tasks: BackgroundTasks):
    task_id = str(uuid.uuid4())
    tasks[task_id] = {
        "status": "started",
        "request": request.model_dump(),
        "result": None,
        "state": {"status": "started", "sub_questions": []},
        "error": None,
    }
    background_tasks.add_task(run_research_task, task_id, request)
    return StartTaskResponse(task_id=task_id, message="Research started successfully")

@app.get("/api/research/status/{task_id}")
async def get_research_status(task_id: str):
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    return jsonable_encoder(tasks[task_id])

@app.get("/api/research/result/{task_id}")
async def get_research_result(task_id: str):
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    task = tasks[task_id]
    if task["status"] != "completed":
        raise HTTPException(status_code=202, detail=f"Task is still {task['status']}")
    return jsonable_encoder(task["result"])

@app.get("/api/research/export/pdf/{task_id}")
async def export_pdf(task_id: str):
    if task_id not in tasks or tasks[task_id].get("status") != "completed":
        raise HTTPException(status_code=404, detail="Report not available")
    report = tasks[task_id].get("result", {})
    pdf_buffer = generate_pdf(report)
    return StreamingResponse(pdf_buffer, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename=research_report_{task_id}.pdf"})

@app.get("/api/research/export/docx/{task_id}")
async def export_docx(task_id: str):
    if task_id not in tasks or tasks[task_id].get("status") != "completed":
        raise HTTPException(status_code=404, detail="Report not available")
    report = tasks[task_id].get("result", {})
    docx_buffer = generate_docx(report)
    return StreamingResponse(docx_buffer, media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document", headers={"Content-Disposition": f"attachment; filename=research_report_{task_id}.docx"})

@app.websocket("/api/research/stream/{task_id}")
async def stream_research(websocket: WebSocket, task_id: str):
    await websocket.accept()
    print(f"[WS] Connection accepted for task {task_id}")
    
    if task_id not in tasks:
        print(f"[WS] Task {task_id} not found in tasks")
        await websocket.send_json({"error": "Task not found"})
        await websocket.close()
        return

    last_status = None
    try:
        while True:
            current_task = tasks.get(task_id, {})
            current_status = current_task.get("status", "unknown")
            current_state = current_task.get("state", {})

            # Always send if status changed
            if current_status != last_status:
                await websocket.send_json({
                    "status": current_status,
                    "data": jsonable_encoder(current_state)
                })
                last_status = current_status

            if current_status in ["completed", "failed"]:
                # Send final state one more time with full data
                await websocket.send_json({
                    "status": current_status,
                    "data": jsonable_encoder(current_state)
                })
                break

            await asyncio.sleep(0.5)

    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        try:
            await websocket.close()
        except Exception:
            pass

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000)
