"use client";

import { useState, useEffect } from "react";
import ResearchForm from "@/components/ResearchForm";
import ResearchDashboard from "@/components/ResearchDashboard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import Auth from "@/components/Auth";

export default function Home() {
  const [taskId, setTaskId] = useState<string | null>(null);
  const [taskQuery, setTaskQuery] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("currentUser")) {
      setIsLoggedIn(true);
    }
    const handleAuthChange = () => {
      setIsLoggedIn(!!localStorage.getItem("currentUser"));
    };
    window.addEventListener("auth-change", handleAuthChange);
    return () => window.removeEventListener("auth-change", handleAuthChange);
  }, []);

  const handleStart = (id: string, query: string) => {
    setTaskId(id);
    setTaskQuery(query);
  };

  const handleReset = () => {
    setTaskId(null);
    setTaskQuery("");
    // Clear hash if present
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  };

  useEffect(() => {
    // If user clicks a hash link (Features, etc.) while in research mode, go back to home
    const handleHashChange = () => {
      if (window.location.hash) {
        setTaskId(null);
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onLinkClick={handleReset} />

      <main className="flex-1">
        {!taskId ? (
          <>
            <HeroSection />
            <section id="research" className="py-16 px-4 relative">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                  <h2 className="text-3xl md:text-4xl font-bold text-gradient mb-4">
                    Start Your Research
                  </h2>
                  <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                    {isLoggedIn
                      ? "Enter any complex research question and our AI will autonomously plan, search, and synthesize a comprehensive report."
                      : "Please log in or sign up to access the autonomous research capabilities."}
                  </p>
                </div>
                {isLoggedIn ? (
                  <ResearchForm onStart={handleStart} />
                ) : (
                  <Auth onLogin={() => setIsLoggedIn(true)} />
                )}
              </div>
            </section>
            <FeaturesSection />
            <HowItWorksSection />
          </>
        ) : (
          <section className="pt-28 pb-10 px-4">
            <div className="max-w-6xl mx-auto">
              <ResearchDashboard taskId={taskId} query={taskQuery} onReset={handleReset} />
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: "🧠",
      title: "Autonomous Planning",
      description: "AI breaks down complex questions into targeted sub-questions and research strategies automatically.",
      color: "from-blue-500/20 to-blue-600/5",
      border: "border-blue-500/20",
    },
    {
      icon: "🔍",
      title: "Parallel Web Research",
      description: "Simultaneous searches across multiple sources using SerpAPI with intelligent deduplication.",
      color: "from-cyan-500/20 to-cyan-600/5",
      border: "border-cyan-500/20",
    },
    {
      icon: "📄",
      title: "Smart Content Extraction",
      description: "Trafilatura-powered scraping removes noise and extracts clean, readable content from any page.",
      color: "from-purple-500/20 to-purple-600/5",
      border: "border-purple-500/20",
    },
    {
      icon: "✅",
      title: "Fact Verification",
      description: "Cross-references claims across multiple sources to reduce hallucinations and improve accuracy.",
      color: "from-emerald-500/20 to-emerald-600/5",
      border: "border-emerald-500/20",
    },
    {
      icon: "📊",
      title: "Confidence Scoring",
      description: "Every report includes a transparency confidence score based on source quality and consensus.",
      color: "from-amber-500/20 to-amber-600/5",
      border: "border-amber-500/20",
    },
    {
      icon: "⚡",
      title: "Real-Time Streaming",
      description: "WebSocket-powered live progress updates as the agent works through each research phase.",
      color: "from-rose-500/20 to-rose-600/5",
      border: "border-rose-500/20",
    },
    {
      icon: "🕸️",
      title: "Interactive Citation Graph",
      description: "A dynamic, node-based visual map showing how sources connect to your research sub-topics.",
      color: "from-purple-500/20 to-purple-600/5",
      border: "border-purple-500/20",
    },
    {
      icon: "🧠",
      title: "Knowledge Graph",
      description: "Dynamically maps extracted entities and their relationships (e.g., organizations, concepts) in an interactive UI.",
      color: "from-blue-500/20 to-blue-600/5",
      border: "border-blue-500/20",
    },
    {
      icon: "🔥",
      title: "Topic Heatmap",
      description: "Clustered visualization of the most frequently mentioned keywords across all processed sources.",
      color: "from-rose-500/20 to-rose-600/5",
      border: "border-rose-500/20",
    },
    {
      icon: "📄",
      title: "Professional Exports",
      description: "Generate and download enterprise-grade research reports as Markdown, PDF, or DOCX files.",
      color: "from-blue-500/20 to-blue-600/5",
      border: "border-blue-500/20",
    },
    {
      icon: "⏳",
      title: "Session History",
      description: "Secure, local memory tracking ensures you can easily review past conversations in your active session.",
      color: "from-indigo-500/20 to-indigo-600/5",
      border: "border-indigo-500/20",
    },
  ];

  return (
    <section id="features" className="py-20 px-4 relative">
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-14">
          <span className="status-badge status-completed mb-4 inline-flex">✦ Capabilities</span>
          <h2 className="text-3xl md:text-5xl font-bold text-gradient mb-4">
            Enterprise-Grade Research Engine
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Built with cutting-edge AI orchestration technology for production-ready autonomous research.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className={`glassmorphism card-hover rounded-2xl p-6 bg-gradient-to-br ${f.color} border ${f.border}`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    { num: "01", title: "Submit Query", desc: "Enter your research question with depth preferences.", icon: "💬" },
    { num: "02", title: "AI Planning", desc: "Claude generates 5 targeted sub-questions covering all angles.", icon: "🗺️" },
    { num: "03", title: "Web Search", desc: "SerpAPI fetches top sources for each sub-question in parallel.", icon: "🌐" },
    { num: "04", title: "Content Scraping", desc: "Trafilatura extracts clean content from each source.", icon: "⛏️" },
    { num: "05", title: "Synthesis", desc: "Claude synthesizes findings into a structured, cited report.", icon: "🔬" },
    { num: "06", title: "Export", desc: "Download your complete research report as Markdown or PDF.", icon: "📥" },
  ];

  return (
    <section id="how-it-works" className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <span className="status-badge status-planned mb-4 inline-flex">✦ Process</span>
          <h2 className="text-3xl md:text-5xl font-bold text-gradient mb-4">How It Works</h2>
          <p className="text-slate-400 text-lg">Six-step autonomous research pipeline</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="relative glassmorphism-light rounded-2xl p-6 border border-white/5 card-hover">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-lg">
                  {step.icon}
                </div>
                <div>
                  <div className="text-xs font-bold text-blue-400/60 mb-1 tracking-widest">{step.num}</div>
                  <h3 className="text-slate-100 font-semibold mb-1">{step.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 z-10 text-slate-600 text-lg">
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
