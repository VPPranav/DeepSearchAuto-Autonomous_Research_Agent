"use client";

import { useEffect, useState, useRef } from "react";
import CitationGraph from "./CitationGraph";
import KnowledgeGraph from "./KnowledgeGraph";
import ResearchHeatmap from "./ResearchHeatmap";
import ConfidenceDashboard from "./ConfidenceDashboard";

interface Source {
  url: string;
  title: string;
  snippet?: string;
  content?: string;
  credibility_score: number;
}

interface SubQuestion {
  question: string;
  status: string;
  sources: Source[];
  answer?: string;
}

interface ResearchReport {
  query: string;
  executive_summary: string;
  sub_topics: SubQuestion[];
  conclusion: string;
  overall_confidence: number;
}

interface ResearchState {
  status: string;
  sub_questions?: SubQuestion[];
  report?: ResearchReport;
  error?: string;
}

interface ResearchDashboardProps {
  taskId: string;
  query: string;
  onReset: () => void;
}

const STATUS_STEPS = [
  { id: "started", label: "Init", icon: "⚡", fullLabel: "Initialization" },
  { id: "planned", label: "Planning", icon: "🗺️", fullLabel: "Research Planning" },
  { id: "gathered_data", label: "Gathering", icon: "🔍", fullLabel: "Search & Scrape" },
  { id: "completed", label: "Complete", icon: "✅", fullLabel: "Synthesis & Report" },
];

const STATUS_MESSAGES: Record<string, string[]> = {
  started: ["Initializing research agent...", "Setting up workflow..."],
  planned: [
    "Analyzing research query...",
    "Generating targeted sub-questions...",
    "Planning search strategy...",
    "Research plan ready ✓",
  ],
  gathered_data: [
    "Executing parallel web searches...",
    "Fetching top sources via SerpAPI...",
    "Scraping content with Trafilatura...",
    "Extracting clean text from sources...",
    "Processing scraped content...",
    "Data gathering complete ✓",
  ],
  completed: [
    "All sources processed...",
    "Claude is synthesizing findings...",
    "Generating executive summary...",
    "Calculating confidence scores...",
    "Report generation complete ✓",
  ],
};

export default function ResearchDashboard({ taskId, query, onReset }: ResearchDashboardProps) {
  const [status, setStatus] = useState<string>("started");
  const [researchState, setResearchState] = useState<ResearchState>({ status: "started" });
  const [logs, setLogs] = useState<Array<{ msg: string; time: string; type: string }>>([]);
  const [activeTab, setActiveTab] = useState<string>("report");
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const [wsError, setWsError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const initializedRef = useRef<string | null>(null);
  const lastLoggedStatusRef = useRef<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  // More robust WS URL construction
  const getWsUrl = () => {
    try {
      const url = new URL(API_URL);
      url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
      return `${url.origin}/api/research/stream/${taskId}`;
    } catch {
      const base = API_URL.replace(/^http/, "ws");
      return `${base}/api/research/stream/${taskId}`;
    }
  };

  const addLog = (msg: string, type: string = "info") => {
    const time = new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setLogs((prev) => {
      // Prevent duplicate messages in a row
      if (prev.length > 0 && prev[prev.length - 1].msg === msg) return prev;
      return [...prev.slice(-100), { msg, time, type }];
    });
  };

  const saveToHistory = (reportToSave: any) => {
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser && reportToSave) {
      const historyKey = `history_${currentUser}`;
      const existing = JSON.parse(localStorage.getItem(historyKey) || "[]");
      if (!existing.some((h: any) => h.taskId === taskId)) {
        existing.unshift({
          query: reportToSave.query,
          summary: reportToSave.executive_summary,
          timestamp: new Date().toISOString(),
          taskId: taskId
        });
        localStorage.setItem(historyKey, JSON.stringify(existing));
      }
    }
  };

  const startPolling = () => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/api/research/status/${taskId}`);
        if (!res.ok) return;
        const data = await res.json();

        setStatus(data.status);
        if (data.state) {
          setResearchState(data.state);
        }

        if (data.status === "completed" || data.status === "failed") {
          clearInterval(interval);
          addLog(`Research ${data.status}.`, data.status === "completed" ? "success" : "error");
          
          if (data.status === "completed" && data.state?.report) {
            saveToHistory(data.state.report);
          }
        }
      } catch {
        // ignore
      }
    }, 2000);
  };

  useEffect(() => {
    if (initializedRef.current === taskId) return;
    initializedRef.current = taskId;

    addLog(`Starting research: "${query}"`, "info");

    const connectWs = () => {
      const wsUrl = getWsUrl();
      console.log("Connecting to WebSocket:", wsUrl);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        addLog("WebSocket connected ✓", "success");
        setWsError(null);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          if (message.error) {
            addLog(`Error: ${message.error}`, "error");
            setWsError(message.error);
            return;
          }

          const newStatus = message.status;
          const newData: ResearchState = message.data || {};

          if (newStatus && newStatus !== lastLoggedStatusRef.current) {
            lastLoggedStatusRef.current = newStatus;
            setStatus(newStatus);
            newData.status = newStatus;

            // Add auto-generated log messages
            const msgs = STATUS_MESSAGES[newStatus];
            if (msgs) {
              msgs.forEach((m, i) => {
                setTimeout(() => addLog(m, i === msgs.length - 1 ? "success" : "info"), i * 400);
              });
            }
          }

          // Update state — the key fix: data contains sub_questions and report
          setResearchState((prev) => {
            const updated = {
              ...prev,
              ...newData,
              status: newStatus || prev.status,
            };
            
            // Save to history if newly completed
            if (newStatus === "completed") {
              const reportToSave = newData.report || prev.report;
              if (reportToSave) saveToHistory(reportToSave);
            }
            return updated;
          });

        } catch {
          addLog("Failed to parse server message", "error");
        }
      };

      ws.onclose = () => {
        addLog("Connection closed.", "muted");
      };

      ws.onerror = () => {
        startPolling();
      };
    };

    connectWs();
    return () => {
      wsRef.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.id === status);
  const isRunning = status !== "completed" && status !== "failed";
  const report = researchState.report;
  const subQuestions = researchState.sub_questions || report?.sub_topics || [];

  const exportMarkdown = () => {
    if (!report) return;
    const md = `# Research Report: ${report.query}

## Executive Summary
${report.executive_summary}

## Key Findings

${report.sub_topics
  .map(
    (t, i) => `### ${i + 1}. ${t.question}

${t.answer || "Analysis in progress."}

**Sources:**
${t.sources.map((s) => `- [${s.title}](${s.url})`).join("\n")}
`
  )
  .join("\n")}

## Conclusion
${report.conclusion}

---
*Confidence Score: ${(report.overall_confidence * 100).toFixed(0)}%*
*Generated by DeepSearch Auto*
`;
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `research-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPdf = () => {
    window.open(`${API_URL}/api/research/export/pdf/${taskId}`, "_blank");
  };

  const exportDocx = () => {
    window.open(`${API_URL}/api/research/export/docx/${taskId}`, "_blank");
  };

  const copyReport = () => {
    if (!report) return;
    const text = `${report.executive_summary}\n\n${report.conclusion}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="w-full animate-scale-in space-y-6">
      {/* Header */}
      <div className="glassmorphism rounded-2xl p-5 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            status === "completed" ? "bg-emerald-500/20 border border-emerald-500/30" :
            status === "failed" ? "bg-red-500/20 border border-red-500/30" :
            "bg-blue-500/20 border border-blue-500/30"
          }`}>
            {status === "completed" ? "✅" : status === "failed" ? "❌" : (
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
              </span>
            )}
          </div>
          <div>
            <h2 className="font-bold text-slate-100 text-lg leading-tight line-clamp-2">{query}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`status-badge status-${status}`}>
                {STATUS_STEPS.find(s => s.id === status)?.fullLabel || status}
              </span>
              <span className="text-slate-600 text-xs">Task: {taskId.substring(0, 8)}...</span>
            </div>
          </div>
        </div>
        <button
          onClick={onReset}
          className="flex-shrink-0 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white glassmorphism-light border border-white/10 rounded-xl transition-all hover:border-white/20 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          New Research
        </button>
      </div>

      {/* Progress Timeline */}
      <div className="glassmorphism rounded-2xl p-5 border border-white/5">
        <div className="flex items-center justify-between relative">
          {/* Connector line */}
          <div className="absolute left-0 right-0 top-4 h-px bg-slate-800 -z-10"></div>
          <div
            className="absolute left-0 top-4 h-px bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-1000 -z-10"
            style={{ width: `${(Math.max(0, currentStepIndex) / (STATUS_STEPS.length - 1)) * 100}%` }}
          ></div>

          {STATUS_STEPS.map((step, idx) => {
            const isActive = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div key={step.id} className="flex flex-col items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-500 text-sm ${
                    isActive
                      ? "bg-blue-600 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                      : "bg-slate-900 border-slate-700"
                  } ${isCurrent && isRunning ? "animate-pulse-glow" : ""}`}
                >
                  {isActive ? step.icon : <div className="w-2 h-2 rounded-full bg-slate-700" />}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${
                  isCurrent ? "text-blue-400" : isActive ? "text-slate-300" : "text-slate-600"
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* WebSocket error notice */}
      {wsError && (
        <div className="px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {wsError}
        </div>
      )}

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Report */}
        <div className="lg:col-span-2 space-y-5">
          {/* Tabs */}
          {(report || subQuestions.length > 0) && (
            <div className="flex gap-2">
              {[
                { id: "report", label: "📄 Report" },
                { id: "sources", label: `🔗 Sources (${subQuestions.reduce((acc, sq) => acc + sq.sources.length, 0)})` },
                { id: "confidence", label: "🛡️ Confidence" },
                { id: "heatmap", label: "🔥 Heatmap" },
                { id: "graph", label: "🕸️ Flow" },
                { id: "knowledge", label: "🧠 Entities" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-blue-500/15 border border-blue-500/30 text-blue-300"
                      : "glassmorphism-light border border-white/5 text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Report tab */}
          {activeTab === "report" && (
            report ? (
              <div className="glassmorphism rounded-2xl border border-white/5 overflow-hidden animate-fade-in-up">
                {/* Report header */}
                <div className="px-6 pt-6 pb-4 border-b border-white/5 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-100">Research Report</h3>
                    <p className="text-slate-500 text-sm mt-0.5">{report.query}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={copyReport}
                      className="p-2 rounded-lg glassmorphism-light border border-white/5 text-slate-400 hover:text-slate-200 transition-all"
                      title="Copy summary"
                    >
                      {copied ? (
                        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={exportDocx}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg glassmorphism-light border border-white/5 text-slate-400 hover:text-blue-300 text-sm transition-all"
                    >
                      Export .docx
                    </button>
                    <button
                      onClick={exportPdf}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg glassmorphism-light border border-white/5 text-slate-400 hover:text-red-300 text-sm transition-all"
                    >
                      Export .pdf
                    </button>
                    <button
                      onClick={exportMarkdown}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg glassmorphism-light border border-white/5 text-slate-400 hover:text-slate-200 text-sm transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      .md
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Confidence */}
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/15">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1.5">
                        <span className="text-xs text-slate-400 font-medium">Research Confidence</span>
                        <span className="text-xs text-blue-400 font-bold">{(report.overall_confidence * 100).toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="confidence-bar h-full rounded-full transition-all duration-1000"
                          style={{ width: `${report.overall_confidence * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-xs text-slate-500">
                      Based on {subQuestions.reduce((a, sq) => a + sq.sources.length, 0)} sources
                    </div>
                  </div>

                  {/* Executive Summary */}
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">
                      <span>📋</span> Executive Summary
                    </h4>
                    <div className="prose-report">
                      <p>{report.executive_summary}</p>
                    </div>
                  </div>

                  {/* Key Findings */}
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">
                      <span>🔬</span> Key Findings
                    </h4>
                    <div className="space-y-3">
                      {report.sub_topics.map((topic, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-white/5 overflow-hidden"
                        >
                          <button
                            className="w-full flex items-center justify-between p-4 text-left hover:bg-white/2 transition-all"
                            onClick={() => setExpandedQuestion(expandedQuestion === idx ? null : idx)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-xs text-blue-400 font-bold flex-shrink-0">
                                {idx + 1}
                              </div>
                              <span className="text-slate-200 font-medium text-sm leading-snug pr-4">{topic.question}</span>
                            </div>
                            <svg
                              className={`w-4 h-4 text-slate-500 flex-shrink-0 transition-transform ${expandedQuestion === idx ? "rotate-180" : ""}`}
                              fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {expandedQuestion === idx && (
                            <div className="px-4 pb-4 border-t border-white/5">
                              {topic.answer && (
                                <p className="text-slate-300 text-sm leading-relaxed mt-3 mb-3">{topic.answer}</p>
                              )}
                              {topic.sources.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {topic.sources.slice(0, 3).map((src, j) => (
                                    <a
                                      key={j}
                                      href={src.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 text-xs bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/40 text-blue-300 hover:text-blue-200 px-2.5 py-1.5 rounded-lg transition-all max-w-[200px]"
                                    >
                                      <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                      </svg>
                                      <span className="truncate">{src.title || `Source ${j + 1}`}</span>
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Conclusion */}
                  <div className="pt-2 border-t border-white/5">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">
                      <span>🎯</span> Conclusion
                    </h4>
                    <div className="prose-report">
                      <p>{report.conclusion}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glassmorphism rounded-2xl p-10 border border-white/5 flex flex-col items-center justify-center min-h-[300px] text-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-3xl mb-4 animate-float">
                  🔬
                </div>
                <p className="text-slate-300 font-medium mb-2">Research in Progress</p>
                <p className="text-slate-500 text-sm max-w-xs">
                  The AI agent is working through the research pipeline. Results will appear here when ready.
                </p>
                <div className="mt-6 flex gap-1">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-2 h-2 rounded-full bg-blue-500/50 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )
          )}

          {/* Sources tab */}
          {activeTab === "sources" && (
            <div className="space-y-4 animate-fade-in-up">
              {subQuestions.length === 0 ? (
                <div className="glassmorphism rounded-2xl p-8 border border-white/5 text-center text-slate-500">
                  Sources will appear here as the agent searches...
                </div>
              ) : (
                subQuestions.map((sq, i) => (
                  <div key={i} className="glassmorphism rounded-2xl p-5 border border-white/5">
                    <h4 className="text-slate-200 font-semibold mb-4 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-xs text-blue-400">{i + 1}</span>
                      {sq.question}
                    </h4>
                    {sq.sources.length === 0 ? (
                      <p className="text-slate-600 text-sm">No sources yet...</p>
                    ) : (
                      <div className="space-y-2">
                        {sq.sources.map((src, j) => (
                          <div key={j} className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800/40">
                            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 text-slate-500 text-xs font-bold">
                              {j + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <a
                                href={src.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-300 hover:text-blue-200 text-sm font-medium truncate block"
                              >
                                {src.title || src.url}
                              </a>
                              <p className="text-slate-500 text-xs mt-0.5 truncate">{src.url}</p>
                              {src.snippet && (
                                <p className="text-slate-400 text-xs mt-1.5 line-clamp-2">{src.snippet}</p>
                              )}
                            </div>
                            {src.credibility_score > 0 && (
                              <div className="flex-shrink-0 text-xs text-emerald-400 font-bold">
                                {(src.credibility_score * 100).toFixed(0)}%
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Graph tab */}
          {activeTab === "graph" && (
            <div className="animate-fade-in-up">
              {subQuestions.length === 0 ? (
                <div className="glassmorphism rounded-2xl p-8 border border-white/5 text-center text-slate-500">
                  Graph will appear here as the agent searches...
                </div>
              ) : (
                <CitationGraph query={query} subTopics={subQuestions as any} />
              )}
            </div>
          )}

          {/* Confidence tab */}
          {activeTab === "confidence" && (
            <div className="animate-fade-in-up">
              {report?.metrics ? (
                <ConfidenceDashboard metrics={report.metrics} />
              ) : (
                <div className="glassmorphism rounded-2xl p-8 border border-white/5 text-center text-slate-500">
                  Confidence metrics will appear once the report is finalized...
                </div>
              )}
            </div>
          )}

          {/* Heatmap tab */}
          {activeTab === "heatmap" && (
            <div className="animate-fade-in-up">
              {report?.keywords ? (
                <ResearchHeatmap keywords={report.keywords} />
              ) : (
                <div className="glassmorphism rounded-2xl p-8 border border-white/5 text-center text-slate-500">
                  Heatmap will appear once the report is finalized...
                </div>
              )}
            </div>
          )}

          {/* Knowledge Graph tab */}
          {activeTab === "knowledge" && (
            <div className="animate-fade-in-up">
              {report?.relationships ? (
                <KnowledgeGraph relationships={report.relationships} />
              ) : (
                <div className="glassmorphism rounded-2xl p-8 border border-white/5 text-center text-slate-500">
                  Knowledge Graph will appear once entities are extracted...
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Activity log */}
        <div className="lg:col-span-1 space-y-4 sticky top-24 self-start">
          <div className="glassmorphism rounded-2xl border border-white/5 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Agent Activity</h3>
              {isRunning && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
              )}
            </div>
            <div className="h-80 overflow-y-auto p-3 space-y-1.5 font-mono text-xs" id="logs-container">
              {logs.map((log, i) => (
                <div
                  key={i}
                  className={`flex gap-2 animate-slide-in-left ${
                    log.type === "success" ? "text-emerald-400" :
                    log.type === "error" ? "text-red-400" :
                    log.type === "muted" ? "text-slate-600" :
                    "text-slate-400"
                  }`}
                >
                  <span className="text-slate-700 flex-shrink-0">{log.time}</span>
                  <span
                    className={
                      log.type === "success" ? "text-cyan-500" :
                      log.type === "error" ? "text-red-500" : "text-blue-500"
                    }
                  >{"›"}</span>
                  <span className="break-all">{log.msg}</span>
                </div>
              ))}
              {isRunning && (
                <div className="flex gap-2 text-slate-600">
                  <span className="text-slate-700">···</span>
                  <span className="text-blue-500">›</span>
                  <span className="animate-pulse">Processing...</span>
                </div>
              )}
              <div ref={logsEndRef} />
            </div>
          </div>

          {/* Sub-questions progress */}
          {subQuestions.length > 0 && (
            <div className="glassmorphism rounded-2xl p-4 border border-white/5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Research Dimensions</h3>
              <div className="space-y-2">
                {subQuestions.map((sq, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${
                      sq.status === "completed"
                        ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
                        : "bg-slate-800 border border-slate-700 text-slate-500"
                    }`}>
                      {sq.status === "completed" ? "✓" : i + 1}
                    </div>
                    <span className="text-slate-400 text-xs leading-tight line-clamp-2 flex-1">{sq.question}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status failed info */}
          {status === "failed" && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm">
              <p className="text-red-300 font-semibold mb-1">Research Failed</p>
              <p className="text-red-400/70 text-xs">
                {researchState.error || "An error occurred during research. Check that your backend is running and API keys are configured."}
              </p>
              <button
                onClick={onReset}
                className="mt-3 px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-300 text-xs rounded-lg hover:bg-red-500/30 transition-all"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
