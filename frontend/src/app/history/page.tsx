"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
      setIsLoggedIn(true);
      const savedHistory = localStorage.getItem(`history_${currentUser}`);
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    }
  }, []);

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center pt-20">
          <div className="glassmorphism p-8 rounded-2xl border border-white/5 text-center">
            <h2 className="text-xl font-bold text-slate-100 mb-2">Not Logged In</h2>
            <p className="text-slate-400">Please log in to view your research history.</p>
            <Link href="/" className="btn-primary px-5 py-2 inline-block mt-4 text-sm">Go to Login</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 pt-32 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Research History</h1>
          <div className="px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-sm flex items-start gap-2 max-w-2xl">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>
              <strong>Note:</strong> Past conversations are stored <em>only for this active session</em>. 
              If you log out, this history will be securely deleted from your browser and not stored anywhere permanently.
            </p>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="glassmorphism rounded-2xl p-10 border border-white/5 text-center">
            <p className="text-slate-400">No past research sessions found.</p>
            <Link href="/#research" className="text-blue-400 hover:text-blue-300 mt-2 inline-block">Start your first research</Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {history.map((item, idx) => (
              <div key={idx} className="glassmorphism p-5 rounded-2xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-200">{item.query}</h3>
                  <p className="text-slate-500 text-sm mt-1 line-clamp-2 max-w-2xl">{item.summary}</p>
                </div>
                <div className="flex-shrink-0 text-sm text-slate-400">
                  {new Date(item.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
