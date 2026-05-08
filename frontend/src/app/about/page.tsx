"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function AboutPage() {
  const techStack = {
    frontend: [
      { name: "Next.js 15", desc: "React framework with App Router" },
      { name: "TypeScript", desc: "Type-safe JavaScript" },
      { name: "TailwindCSS", desc: "Utility-first styling" },
      { name: "Framer Motion", desc: "Production animations" },
    ],
    backend: [
      { name: "FastAPI", desc: "High-performance Python API" },
      { name: "LangGraph", desc: "AI workflow orchestration" },
      { name: "LangChain", desc: "LLM integration framework" },
      { name: "Pydantic v2", desc: "Data validation & serialization" },
    ],
    ai: [
      { name: "Claude API", desc: "Anthropic's AI model for synthesis" },
      { name: "SerpAPI", desc: "Google search results API" },
      { name: "Trafilatura", desc: "Web content extraction" },
      { name: "Asyncio", desc: "Parallel async execution" },
    ],
    infra: [
      { name: "WebSockets", desc: "Real-time streaming updates" },
      { name: "Docker", desc: "Containerized deployment" },
      { name: "Vercel", desc: "Frontend hosting" },
      { name: "Railway", desc: "Backend hosting" },
    ],
  };

  const timeline = [
    { phase: "Phase 1", title: "Research Planning", desc: "Claude AI analyzes the query and generates 5 targeted sub-questions covering different angles of the topic.", icon: "🗺️", color: "blue" },
    { phase: "Phase 2", title: "Parallel Search", desc: "SerpAPI executes simultaneous Google searches for each sub-question, collecting top-ranked URLs and metadata.", icon: "🔍", color: "cyan" },
    { phase: "Phase 3", title: "Content Extraction", desc: "Trafilatura scrapes each URL concurrently, extracting clean readable text while removing ads and navigation.", icon: "⛏️", color: "purple" },
    { phase: "Phase 4", title: "AI Synthesis", desc: "Claude synthesizes all gathered evidence into a structured report with executive summary, findings, and conclusion.", icon: "🔬", color: "emerald" },
    { phase: "Phase 5", title: "Report Generation", desc: "The final report is streamed to the frontend with confidence scores, source citations, and export options.", icon: "📊", color: "amber" },
  ];

  const colorMap: Record<string, string> = {
    blue: "border-blue-500/30 bg-blue-500/10 text-blue-400",
    cyan: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
    purple: "border-purple-500/30 bg-purple-500/10 text-purple-400",
    emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    amber: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative py-24 px-4 overflow-hidden">
          <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-4xl mx-auto text-center relative z-10 animate-fade-in-up">
            <span className="status-badge status-completed mb-6 inline-flex">✦ About This Project</span>
            <h1 className="text-4xl md:text-6xl font-bold text-gradient mb-6">
              DeepSearch Auto
            </h1>
            <p className="text-slate-300 text-xl leading-relaxed max-w-3xl mx-auto mb-8">
              An autonomous AI research platform that replicates the capability of enterprise deep-research tools like Perplexity AI. 
              Built to showcase production-grade AI engineering, full-stack architecture, and autonomous agent systems.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <span className="px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-medium">AI Engineering</span>
              <span className="px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-medium">LangGraph Orchestration</span>
              <span className="px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-sm font-medium">Autonomous Agents</span>
              <span className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-medium">RAG Systems</span>
              <span className="px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm font-medium">Full-Stack</span>
            </div>
          </div>
        </section>

        {/* Project Overview */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="text-3xl font-bold text-slate-100 mb-6">Project Overview</h2>
                <div className="space-y-4 text-slate-400 leading-relaxed">
                  <p>
                    DeepSearch Auto is a portfolio-grade autonomous research platform built to demonstrate mastery of modern AI engineering. 
                    It combines a FastAPI backend with LangGraph-orchestrated AI agents that autonomously plan and execute multi-step research workflows.
                  </p>
                  <p>
                    The system accepts complex research questions, breaks them into targeted sub-questions, performs parallel web searches, 
                    scrapes and processes source content, and uses Claude AI to synthesize a comprehensive, citation-backed report.
                  </p>
                  <p>
                    Real-time progress streaming via WebSockets keeps users informed at every step, while the modular architecture 
                    ensures the platform is scalable, maintainable, and ready for production deployment.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Research Phases", value: "5", sub: "Automated pipeline" },
                  { label: "Parallel Scrapers", value: "15+", sub: "Concurrent tasks" },
                  { label: "AI Model", value: "Claude", sub: "Anthropic Haiku/Sonnet" },
                  { label: "Deployment", value: "Cloud", sub: "Vercel + Railway" },
                ].map((stat, i) => (
                  <div key={i} className="glassmorphism rounded-2xl p-5 text-center border border-white/5">
                    <div className="text-3xl font-bold text-gradient mb-1">{stat.value}</div>
                    <div className="text-slate-200 font-semibold text-sm mb-1">{stat.label}</div>
                    <div className="text-slate-500 text-xs">{stat.sub}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-16">
              <h3 className="text-2xl font-bold text-slate-100 mb-6">Key Features Added</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glassmorphism p-5 rounded-2xl border border-white/5">
                  <h4 className="text-blue-300 font-bold mb-2">Interactive Citation Graph</h4>
                  <p className="text-slate-400 text-sm">A visual node map illustrating exactly how sources connect to sub-topics and claims using React Flow.</p>
                </div>
                <div className="glassmorphism p-5 rounded-2xl border border-white/5">
                  <h4 className="text-blue-300 font-bold mb-2">Knowledge Graph Visualization</h4>
                  <p className="text-slate-400 text-sm">Dynamically maps extracted entities and their relationships (e.g., organizations, concepts) in an interactive UI.</p>
                </div>
                <div className="glassmorphism p-5 rounded-2xl border border-white/5">
                  <h4 className="text-blue-300 font-bold mb-2">Topic Intensity Heatmap</h4>
                  <p className="text-slate-400 text-sm">Clustered visualization of the most frequently mentioned keywords across all processed sources.</p>
                </div>
                <div className="glassmorphism p-5 rounded-2xl border border-white/5">
                  <h4 className="text-blue-300 font-bold mb-2">Confidence Dashboard</h4>
                  <p className="text-slate-400 text-sm">Real-time metrics tracking source agreement, evidence strength, and hallucination risk.</p>
                </div>
                <div className="glassmorphism p-5 rounded-2xl border border-white/5">
                  <h4 className="text-blue-300 font-bold mb-2">Professional Exports</h4>
                  <p className="text-slate-400 text-sm">Instantly converts complex research outputs into downloadable PDF, DOCX, and Markdown formats.</p>
                </div>
                <div className="glassmorphism p-5 rounded-2xl border border-white/5">
                  <h4 className="text-blue-300 font-bold mb-2">Session History</h4>
                  <p className="text-slate-400 text-sm">Safely stores your active research session data locally for quick review, automatically clearing upon logout.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 px-4 relative">
          <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
          <div className="max-w-5xl mx-auto relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-100 mb-3">Research Pipeline</h2>
              <p className="text-slate-500">How the autonomous agent processes your query</p>
            </div>

            <div className="space-y-4">
              {timeline.map((item, i) => (
                <div key={i} className="glassmorphism-light rounded-2xl p-6 border border-white/5 flex gap-6 items-start card-hover">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl border flex items-center justify-center text-xl ${colorMap[item.color]}`}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-xs font-bold tracking-widest ${colorMap[item.color].split(' ').pop()}`}>{item.phase}</span>
                      <h3 className="text-slate-100 font-bold text-lg">{item.title}</h3>
                    </div>
                    <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-100 mb-3">Technology Stack</h2>
              <p className="text-slate-500">Enterprise-grade tools and frameworks</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(techStack).map(([category, items]) => (
                <div key={category} className="glassmorphism rounded-2xl p-5 border border-white/5">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 pb-3 border-b border-white/5">
                    {category === "ai" ? "AI & Search" : category === "infra" ? "Infrastructure" : category.charAt(0).toUpperCase() + category.slice(1)}
                  </h3>
                  <div className="space-y-3">
                    {items.map((item, i) => (
                      <div key={i}>
                        <div className="text-slate-200 font-semibold text-sm">{item.name}</div>
                        <div className="text-slate-600 text-xs">{item.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Architecture */}
        <section className="py-16 px-4 relative">
          <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
          <div className="max-w-5xl mx-auto relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-100 mb-3">System Architecture</h2>
              <p className="text-slate-500">Clean, modular, production-ready design</p>
            </div>

            <div className="glassmorphism rounded-2xl p-8 border border-white/5 font-mono text-sm">
              <div className="text-emerald-400 mb-2">{"# Project Structure"}</div>
              <div className="space-y-1 text-slate-400">
                <div><span className="text-blue-400">deepsearch-auto/</span></div>
                <div className="pl-4"><span className="text-cyan-400">├── backend/</span></div>
                <div className="pl-8 text-slate-500">├── main.py            <span className="text-slate-600"># FastAPI app + WebSocket streaming</span></div>
                <div className="pl-8 text-slate-500">├── agents/</div>
                <div className="pl-12 text-slate-500">└── researcher.py      <span className="text-slate-600"># LangGraph workflow orchestration</span></div>
                <div className="pl-8 text-slate-500">├── models/</div>
                <div className="pl-12 text-slate-500">└── schema.py          <span className="text-slate-600"># Pydantic data models</span></div>
                <div className="pl-8 text-slate-500">└── tools/</div>
                <div className="pl-12 text-slate-500">├── search.py          <span className="text-slate-600"># SerpAPI integration</span></div>
                <div className="pl-12 text-slate-500">└── scraper.py         <span className="text-slate-600"># Trafilatura content extraction</span></div>
                <div className="pl-4 mt-2"><span className="text-cyan-400">└── frontend/</span></div>
                <div className="pl-8 text-slate-500">├── app/</div>
                <div className="pl-12 text-slate-500">├── page.tsx           <span className="text-slate-600"># Homepage + research form</span></div>
                <div className="pl-12 text-slate-500">└── about/page.tsx     <span className="text-slate-600"># This page</span></div>
                <div className="pl-8 text-slate-500">└── components/</div>
                <div className="pl-12 text-slate-500">├── ResearchForm.tsx   <span className="text-slate-600"># Research input UI</span></div>
                <div className="pl-12 text-slate-500">├── ResearchDashboard  <span className="text-slate-600"># Live progress + report</span></div>
                <div className="pl-12 text-slate-500">├── Navbar.tsx         <span className="text-slate-600"># Navigation</span></div>
                <div className="pl-12 text-slate-500">└── Footer.tsx         <span className="text-slate-600"># Footer</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* Developer */}
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="glassmorphism rounded-3xl p-10 border border-white/5 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none" />
              <div className="relative z-10">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mx-auto mb-6 flex items-center justify-center text-3xl font-bold text-white shadow-lg glow-blue">
                  PV
                </div>
                <h2 className="text-2xl font-bold text-slate-100 mb-2">Developed by</h2>
                <h3 className="text-3xl font-bold text-gradient mb-4">Pranav V P</h3>
                <p className="text-slate-400 mb-6 max-w-lg mx-auto leading-relaxed">
                  AI Engineer & Full Stack Developer specializing in autonomous agent systems, LLM orchestration, 
                  and production-grade AI applications. Passionate about building tools that push the boundaries of what&apos;s possible.
                </p>
                <div className="flex flex-wrap gap-3 justify-center mb-8">
                  {["AI Engineering", "LangGraph", "FastAPI", "Next.js", "Autonomous Agents", "RAG"].map((skill) => (
                    <span key={skill} className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/50 text-slate-300 text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <a
                    href="mailto:pranavvp1507@gmail.com"
                    className="flex items-center gap-2 px-6 py-3 bg-blue-500/10 border border-blue-500/30 text-blue-300 rounded-xl hover:bg-blue-500/20 transition-all font-medium"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    pranavvp1507@gmail.com
                  </a>
                  <Link
                    href="/"
                    className="flex items-center gap-2 px-6 py-3 btn-primary"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Try DeepSearch Auto
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
