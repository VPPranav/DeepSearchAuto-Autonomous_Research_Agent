from pydantic import BaseModel, Field
from typing import List, Optional

class ResearchRequest(BaseModel):
    query: str
    depth: str = "standard"   # standard, deep
    source_type: str = "all"  # all, academic, news

class Source(BaseModel):
    url: str
    title: str
    snippet: Optional[str] = None
    content: Optional[str] = None
    credibility_score: float = 0.0

class SubQuestion(BaseModel):
    question: str
    status: str = "pending"
    sources: List[Source] = Field(default_factory=list)
    answer: Optional[str] = None

class Keyword(BaseModel):
    keyword: str
    intensity: int
    category: str

class Relationship(BaseModel):
    source: str
    target: str
    label: str

class ConfidenceMetrics(BaseModel):
    overall: float
    source_agreement: float
    evidence_strength: float
    hallucination_risk: float

class ResearchReport(BaseModel):
    query: str
    executive_summary: str
    sub_topics: List[SubQuestion]
    conclusion: str
    overall_confidence: float
    keywords: List[Keyword] = Field(default_factory=list)
    relationships: List[Relationship] = Field(default_factory=list)
    metrics: Optional[ConfidenceMetrics] = None

class TaskStatus(BaseModel):
    task_id: str
    status: str
    message: str
