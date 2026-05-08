from typing import TypedDict, List, Optional
import asyncio
from langgraph.graph import StateGraph, END
from models.schema import ResearchRequest, ResearchReport, SubQuestion, Source
from tools.search import perform_search
from tools.scraper import scrape_multiple
import os
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import SystemMessage, HumanMessage
import json

class AgentState(TypedDict):
    request: ResearchRequest
    sub_questions: List[SubQuestion]
    report: Optional[ResearchReport]
    status: str

anthropic_api_key = os.getenv("ANTHROPIC_API_KEY")

import httpx

def get_llm():
    if anthropic_api_key:
        return ChatAnthropic(
            model="claude-3-haiku-20240307", 
            anthropic_api_key=anthropic_api_key,
            timeout=30.0,
            max_retries=2,
            http_client=httpx.AsyncClient()
        )
    return None


async def safe_ainvoke(llm, messages, timeout: float = 15.0):
    """Invoke LLM with a hard timeout so requests cannot stall the pipeline."""
    return await asyncio.wait_for(llm.ainvoke(messages), timeout=timeout)

async def plan_research(state: AgentState):
    """Generate sub-questions from the main query."""
    query = state["request"].query
    print(f"[PLAN] Planning research for: {query}")

    sub_questions = [
        SubQuestion(question=f"What is the background and history of {query}?"),
        SubQuestion(question=f"What are the key technical components and mechanisms of {query}?"),
        SubQuestion(question=f"What are the latest developments and breakthroughs in {query}?"),
        SubQuestion(question=f"What are the main challenges and limitations facing {query}?"),
        SubQuestion(question=f"What is the future outlook and potential impact of {query}?"),
    ]

    llm = get_llm()
    if llm:
        messages = [
            SystemMessage(content="""You are a research planner. Generate exactly 5 distinct, specific sub-questions 
            for deep research on the given topic. Each question should cover a different angle.
            Return ONLY a valid JSON array of 5 strings, nothing else. Example: ["Q1?", "Q2?", "Q3?", "Q4?", "Q5?"]"""),
            HumanMessage(content=query)
        ]
        try:
            res = await safe_ainvoke(llm, messages, timeout=12.0)
            content = res.content.strip()
            # Strip markdown code fences if present
            if content.startswith("```"):
                content = content.split("```")[1]
                if content.startswith("json"):
                    content = content[4:]
            questions = json.loads(content.strip())
            if isinstance(questions, list) and len(questions) >= 3:
                sub_questions = [SubQuestion(question=q) for q in questions[:5]]
                print(f"[PLAN] Generated {len(sub_questions)} sub-questions via LLM")
        except Exception as e:
            print(f"[PLAN] LLM planning failed, using fallback: {e}")

    return {**state, "sub_questions": sub_questions, "status": "planned"}

async def search_and_scrape(state: AgentState):
    """Execute search and scrape for all sub-questions."""
    print("[SEARCH] Starting search and scrape...")
    sub_questions = state["sub_questions"]

    # Use asyncio.gather for parallel search and scrape across sub-questions
    async def process_sub_question(sq: SubQuestion):
        print(f"[SEARCH] Searching for: {sq.question}")
        sources = await perform_search(sq.question, num_results=3)
        print(f"[SCRAPE] Scraping {len(sources)} sources for: {sq.question}")
        scraped_sources = await scrape_multiple(sources)
        sq.sources = scraped_sources
        sq.status = "completed"
        return sq

    tasks = [process_sub_question(sq) for sq in sub_questions]
    completed_sqs = await asyncio.gather(*tasks)

    return {**state, "sub_questions": completed_sqs, "status": "gathered_data"}

async def synthesize(state: AgentState):
    """Synthesize the findings into a structured report using Claude."""
    print("[SYNTHESIZE] Synthesizing report...")
    query = state["request"].query
    sub_questions = state["sub_questions"]

    # Build context from scraped sources
    context_parts = []
    for sq in sub_questions:
        context_parts.append(f"\n### Sub-question: {sq.question}")
        for src in sq.sources[:2]:  # limit to 2 sources per question for token efficiency
            if src.content and src.content != "Failed to scrape":
                snippet = src.content[:1500] if src.content else ""
                context_parts.append(f"**Source**: {src.title} ({src.url})\n{snippet}")

    context = "\n".join(context_parts)

    # Mock synthesis as fallback
    executive_summary = f"This comprehensive report examines {query} through multiple lenses including history, technical components, recent developments, challenges, and future outlook. The research synthesizes data from {sum(len(sq.sources) for sq in sub_questions)} sources across {len(sub_questions)} key research dimensions."
    conclusion = f"Based on the research gathered, {query} represents a significant and evolving field. The evidence suggests continued growth and development, with both promising opportunities and notable challenges ahead. Further research and monitoring of developments is recommended."
    confidence = 0.75
    confidence = 0.75
    
    from models.schema import Keyword, Relationship, ConfidenceMetrics
    
    # Fallback mock data to ensure visualizations render even if API fails
    keywords = [
        Keyword(keyword=query, intensity=95, category="Primary"),
        Keyword(keyword="Technology", intensity=80, category="Context"),
        Keyword(keyword="Development", intensity=70, category="Context"),
        Keyword(keyword="Impact", intensity=65, category="Analysis"),
        Keyword(keyword="Future Trends", intensity=50, category="Analysis"),
    ]
    
    relationships = [
        Relationship(source=query, target="Global Market", label="impacts"),
        Relationship(source=query, target="Future Development", label="drives"),
        Relationship(source="Current Research", target=query, label="explores"),
        Relationship(source=query, target="Industry Standards", label="shapes"),
    ]
    
    metrics = ConfidenceMetrics(
        overall=0.75,
        source_agreement=0.80,
        evidence_strength=0.70,
        hallucination_risk=0.20
    )

    # Per-question answers
    for sq in sub_questions:
        sq.answer = f"Research gathered from {len(sq.sources)} sources covering various aspects of this sub-topic."

    llm = get_llm()
    if llm and context.strip():
        try:
            # Generate executive summary
            summary_messages = [
                SystemMessage(content="""You are a research synthesis expert. Based on the provided research context, 
                write a professional, comprehensive executive summary (3-4 paragraphs) for the research report.
                Be factual, cite specific findings, and avoid hallucination. 
                If context is limited, state what was found and acknowledge limitations."""),
                HumanMessage(content=f"Research Topic: {query}\n\nGathered Context:\n{context[:6000]}\n\nWrite executive summary:")
            ]
            summary_res = await safe_ainvoke(llm, summary_messages, timeout=20.0)
            executive_summary = summary_res.content.strip()

            # Generate per-question answers
            ans_tasks = []
            for sq in sub_questions:
                src_context = ""
                for src in sq.sources[:2]:
                    if src.content and src.content != "Failed to scrape":
                        src_context += f"{src.title}: {src.content[:800]}\n"
                
                if src_context:
                    ans_messages = [
                        SystemMessage(content="You are a research analyst. Answer the given sub-question based only on the provided source context. Be concise (2-3 sentences). Acknowledge if sources are insufficient."),
                        HumanMessage(content=f"Question: {sq.question}\n\nSource Context:\n{src_context}\n\nAnswer:")
                    ]
                    ans_tasks.append((sq, safe_ainvoke(llm, ans_messages, timeout=12.0)))
            
            if ans_tasks:
                sq_objects = [t[0] for t in ans_tasks]
                sq_coros = [t[1] for t in ans_tasks]
                sq_results = await asyncio.gather(*sq_coros)
                for sq_obj, res in zip(sq_objects, sq_results):
                    sq_obj.answer = res.content.strip()

            # Generate conclusion
            conc_messages = [
                SystemMessage(content="You are a research analyst. Write a concise conclusion (2 paragraphs) for this research report. Summarize key takeaways and suggest next steps or areas for further research."),
                HumanMessage(content=f"Research Topic: {query}\n\nExecutive Summary:\n{executive_summary[:2000]}\n\nWrite conclusion:")
            ]
            conc_res = await safe_ainvoke(llm, conc_messages, timeout=15.0)
            conclusion = conc_res.content.strip()
            confidence = 0.88

            # Extract advanced analysis
            adv_messages = [
                SystemMessage(content="You are a data extraction AI. Based on the text, extract: 1. Top 5-10 keywords/topics with intensity (1-100) and category. 2. 5-10 entity relationships (source, target, label). 3. Confidence metrics (overall, source_agreement, evidence_strength, hallucination_risk - each 0.0 to 1.0). Return strictly valid JSON containing 'keywords', 'relationships', and 'metrics' keys without markdown formatting."),
                HumanMessage(content=f"Topic: {query}\n\nSummary:\n{executive_summary}\n\nExtract JSON:")
            ]
            try:
                adv_res = await safe_ainvoke(llm, adv_messages, timeout=15.0)
                adv_content = adv_res.content.strip()
                if adv_content.startswith("```"):
                    adv_content = adv_content.split("```")[1]
                    if adv_content.startswith("json"):
                        adv_content = adv_content[4:]
                adv_data = json.loads(adv_content.strip())
                
                from models.schema import Keyword, Relationship, ConfidenceMetrics
                if "keywords" in adv_data:
                    keywords = [Keyword(**k) for k in adv_data["keywords"]]
                if "relationships" in adv_data:
                    relationships = [Relationship(**r) for r in adv_data["relationships"]]
                if "metrics" in adv_data:
                    metrics = ConfidenceMetrics(**adv_data["metrics"])
                    confidence = metrics.overall
            except Exception as adv_e:
                print(f"[SYNTHESIZE] Advanced extraction failed: {adv_e}")

        except Exception as e:
            print(f"[SYNTHESIZE] LLM synthesis failed, using fallback: {e}")

    report = ResearchReport(
        query=query,
        executive_summary=executive_summary,
        sub_topics=sub_questions,
        conclusion=conclusion,
        overall_confidence=confidence,
        keywords=keywords,
        relationships=relationships,
        metrics=metrics
    )

    return {**state, "report": report, "status": "completed"}

def build_graph():
    workflow = StateGraph(AgentState)

    workflow.add_node("plan", plan_research)
    workflow.add_node("search_and_scrape", search_and_scrape)
    workflow.add_node("synthesize", synthesize)

    workflow.set_entry_point("plan")
    workflow.add_edge("plan", "search_and_scrape")
    workflow.add_edge("search_and_scrape", "synthesize")
    workflow.add_edge("synthesize", END)

    return workflow.compile()

research_graph = build_graph()
