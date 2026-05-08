"use client";

import React, { useState } from 'react';

interface AuthProps {
  onLogin: () => void;
}

export default function Auth({ onLogin }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    // Simplistic local storage mock
    if (isLogin) {
      const savedUser = localStorage.getItem(`user_${email}`);
      if (savedUser && JSON.parse(savedUser).password === password) {
        localStorage.setItem('currentUser', email);
        
        // Seed demo
        const historyKey = `history_${email}`;
        const existing = JSON.parse(localStorage.getItem(historyKey) || "[]");
        if (existing.length === 0) {
          existing.push({
            query: "Demo: The Future of Quantum Computing",
            summary: "This is a sample history entry generated to demonstrate the history page. Quantum computing promises to solve classically intractable problems by leveraging superposition and entanglement.",
            timestamp: new Date().toISOString(),
            taskId: "demo-task-123"
          });
          localStorage.setItem(historyKey, JSON.stringify(existing));
        }

        window.dispatchEvent(new Event('auth-change'));
        onLogin();
      } else {
        setError('Invalid credentials');
      }
    } else {
      localStorage.setItem('currentUser', email);
      
      // Seed a demo history item to ensure the History page shows something
      const historyKey = `history_${email}`;
      const existing = JSON.parse(localStorage.getItem(historyKey) || "[]");
      if (existing.length === 0) {
        existing.push({
          query: "Demo: The Future of Quantum Computing",
          summary: "This is a sample history entry generated to demonstrate the history page. Quantum computing promises to solve classically intractable problems by leveraging superposition and entanglement.",
          timestamp: new Date().toISOString(),
          taskId: "demo-task-123"
        });
        localStorage.setItem(historyKey, JSON.stringify(existing));
      }
      
      window.dispatchEvent(new Event('auth-change'));
      onLogin();
    }
  };

  return (
    <div className="glassmorphism rounded-2xl p-8 border border-white/5 max-w-md mx-auto w-full animate-fade-in-up">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-100 mb-2">
          {isLogin ? 'Welcome Back' : 'Create an Account'}
        </h2>
        <p className="text-slate-400 text-sm">
          {isLogin 
            ? 'Log in to access autonomous research' 
            : 'Sign up to start researching for free'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}
        
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Email
          </label>
          <input 
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
            placeholder="you@example.com"
            suppressHydrationWarning
          />
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Password
          </label>
          <input 
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
            placeholder="••••••••"
            suppressHydrationWarning
          />
        </div>
        
        <button 
          type="submit"
          className="w-full btn-primary px-4 py-3 text-sm mt-4"
          suppressHydrationWarning
        >
          {isLogin ? 'Log In' : 'Sign Up'}
        </button>
      </form>
      
      <div className="mt-6 text-center text-sm text-slate-400">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button 
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
          }}
          className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
          suppressHydrationWarning
        >
          {isLogin ? 'Sign up' : 'Log in'}
        </button>
      </div>
    </div>
  );
}
