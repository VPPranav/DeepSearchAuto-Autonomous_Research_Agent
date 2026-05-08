import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <span className="font-bold text-slate-100">DeepSearch<span className="text-blue-400">Auto</span></span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
              Autonomous AI research platform powered by Claude, LangGraph, and advanced web scraping technology.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-slate-300 font-semibold text-sm mb-4 tracking-wide uppercase">Navigation</h4>
            <div className="space-y-2">
              {[
                { href: "/", label: "Home" },
                { href: "/#features", label: "Features" },
                { href: "/#how-it-works", label: "How It Works" },
                { href: "/#research", label: "Try It" },
                { href: "/about", label: "About" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-slate-500 hover:text-slate-300 text-sm transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Tech */}
          <div>
            <h4 className="text-slate-300 font-semibold text-sm mb-4 tracking-wide uppercase">Built With</h4>
            <div className="flex flex-wrap gap-2">
              {["Next.js 15", "FastAPI", "LangGraph", "Claude API", "Trafilatura", "SerpAPI"].map((tech) => (
                <span key={tech} className="px-2.5 py-1 rounded-md bg-slate-800/60 border border-slate-700/40 text-slate-400 text-xs">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-600 text-sm">
            © {new Date().getFullYear()} DeepSearch Auto. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-600">Developed by</span>
            <span className="font-semibold text-slate-300">Pranav V P</span>
            <span className="text-slate-700">·</span>
            <a
              href="mailto:pranavvp1507@gmail.com"
              className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              pranavvp1507@gmail.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
