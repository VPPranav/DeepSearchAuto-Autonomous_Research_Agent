"use client";

import { useState } from "react";

interface ResearchFormProps {
  onStart: (taskId: string, query: string) => void;
}

const EXAMPLE_QUERIES = [
  "What are the latest breakthroughs in solid-state battery technology?",
  "How does CRISPR gene editing work and what are its medical applications?",
  "What is the current state of quantum computing and when will it be practical?",
  "Explain the mechanisms behind large language models and transformer architecture",
];

export default function ResearchForm({ onStart }: ResearchFormProps) {
  const [query, setQuery] = useState("");
  const [depth, setDepth] = useState("standard");
  const [sourceType, setSourceType] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const submitResearch = async () => {
    if (!query.trim()) return;
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/research/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim(), depth, source_type: sourceType }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Server error: ${res.status}`);
      }

      const data = await res.json();
      if (data.task_id) {
        onStart(data.task_id, query.trim());
      } else {
        throw new Error("No task ID returned from server");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to connect to research server. Make sure the backend is running.";
      console.error("Failed to start research", err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitResearch();
  };

  return (
    <div className="w-full">
      {/* Example queries */}
      <div className="mb-6">
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-3 font-semibold">Example queries</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {EXAMPLE_QUERIES.map((q, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setQuery(q)}
              className="text-left px-4 py-3 rounded-xl glassmorphism-light border border-white/5 hover:border-blue-500/30 text-slate-400 hover:text-slate-200 text-sm transition-all group"
            >
              <span className="text-blue-500/60 group-hover:text-blue-400 mr-2 font-mono text-xs">→</span>
              {q}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glassmorphism rounded-2xl p-6 md:p-8 border border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none transition-opacity duration-500" />

        <div className="relative z-10 space-y-5">
          {/* Query input */}
          <div>
            <label htmlFor="query" className="block text-sm font-semibold text-slate-300 mb-2.5">
              Research Question
            </label>
            <div className="relative">
              <textarea
                id="query"
                rows={3}
                className="w-full px-4 py-3.5 bg-slate-900/60 border border-slate-700/60 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none text-base leading-relaxed"
                placeholder="E.g., What are the latest advancements in solid-state batteries and their potential impact on electric vehicles?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    void submitResearch();
                  }
                }}
              />
              <div className="absolute bottom-3 right-3 text-slate-600 text-xs">
                {query.length > 0 && `Ctrl+↵`}
              </div>
            </div>
          </div>

          {/* Settings row */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
                Research Depth
              </label>
              <div className="flex gap-2">
                {[
                  { value: "standard", label: "Standard", desc: "~2 min" },
                  { value: "deep", label: "Deep Dive", desc: "~5 min" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDepth(opt.value)}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      depth === opt.value
                        ? "bg-blue-500/15 border-blue-500/40 text-blue-300"
                        : "bg-slate-900/40 border-slate-700/40 text-slate-500 hover:text-slate-300 hover:border-slate-600"
                    }`}
                  >
                    {opt.label}
                    <span className="ml-1 text-xs opacity-60">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
                Source Type
              </label>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-700/60 text-slate-300 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 p-2.5 outline-none"
              >
                <option value="all">All Sources</option>
                <option value="academic">Academic / Scientific</option>
                <option value="news">News & Current Events</option>
              </select>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-sm">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="w-full btn-primary py-4 text-base flex justify-center items-center gap-3"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Initializing Research Agent...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span>Launch Research Agent</span>
                <span className="text-blue-300/60 text-sm">→</span>
              </>
            )}
          </button>

          <p className="text-center text-xs text-slate-600">
            Tip: Be specific for better results. Include context, timeframe, or specific aspects you want covered.
          </p>
        </div>
      </form>
    </div>
  );
}
