"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

export default function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Particle network animation
    const particles: Array<{
      x: number; y: number; vx: number; vy: number;
      size: number; opacity: number; color: string;
    }> = [];

    const colors = ["rgba(59,130,246,", "rgba(6,182,212,", "rgba(139,92,246,"];

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(59,130,246,${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.opacity})`;
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
      {/* Background canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.7 }}
      />

      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none animate-float" />
      <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none animate-float" style={{ animationDelay: "-3s" }} />
      <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-purple-600/8 rounded-full blur-[100px] pointer-events-none animate-float" style={{ animationDelay: "-6s" }} />

      {/* Grid background */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 text-center max-w-5xl mx-auto px-4">
        <div className="animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glassmorphism-light border border-blue-500/20 text-blue-300 text-sm font-medium mb-8">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Powered by Claude AI + LangGraph Orchestration
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 leading-none">
            <span className="text-slate-100">Autonomous</span>
            <br />
            <span className="text-gradient">AI Research</span>
          </h1>

          <p className="text-slate-400 text-xl md:text-2xl max-w-3xl mx-auto mb-10 leading-relaxed">
            Enter any complex question. Our AI agent autonomously plans, searches, scrapes, 
            and synthesizes a{" "}
            <span className="text-slate-200 font-medium">comprehensive research report</span>{" "}
            with citations in minutes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link
              href="/#research"
              className="btn-primary px-8 py-4 text-base inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Start Researching Free
            </Link>
            <Link
              href="/about"
              className="px-8 py-4 text-base text-slate-300 hover:text-white glassmorphism-light border border-white/10 rounded-xl inline-flex items-center gap-2 transition-all hover:border-white/20"
            >
              Learn How It Works
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {[
              { value: "5-Step", label: "AI Pipeline" },
              { value: "15+", label: "Sources Analyzed" },
              { value: "Real-time", label: "Streaming" },
            ].map((stat, i) => (
              <div key={i} className="glassmorphism-light rounded-xl p-4 border border-white/5 text-center">
                <div className="text-lg font-bold text-gradient">{stat.value}</div>
                <div className="text-slate-500 text-xs mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating 3D-style cards */}
      <div className="absolute left-6 top-1/3 hidden xl:block animate-float" style={{ animationDelay: "-2s" }}>
        <div className="glassmorphism rounded-xl p-3 border border-blue-500/20 text-xs text-slate-400 w-40 shadow-xl">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-emerald-400 font-mono text-xs">Planning...</span>
          </div>
          <div className="text-slate-300 font-medium text-xs">Generating sub-questions</div>
          <div className="mt-2 space-y-1">
            {["Q1: Background", "Q2: Technical", "Q3: Developments"].map((q) => (
              <div key={q} className="h-1.5 bg-blue-500/20 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500/60 rounded-full w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute right-6 top-1/2 hidden xl:block animate-float" style={{ animationDelay: "-4s" }}>
        <div className="glassmorphism rounded-xl p-3 border border-cyan-500/20 text-xs text-slate-400 w-44 shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
            <span className="text-cyan-400 font-mono text-xs">Scraping sources</span>
          </div>
          <div className="space-y-1.5">
            {["nature.com ✓", "arxiv.org ✓", "wikipedia.org ⟳"].map((src, i) => (
              <div key={i} className="text-xs text-slate-400">{src}</div>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-1">
            <div className="text-slate-500 text-xs">Confidence:</div>
            <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full w-4/5"></div>
            </div>
            <div className="text-cyan-400 text-xs font-bold">85%</div>
          </div>
        </div>
      </div>
    </section>
  );
}
