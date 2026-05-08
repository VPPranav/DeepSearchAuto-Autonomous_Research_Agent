import React from 'react';

interface ConfidenceMetrics {
  overall: number;
  source_agreement: number;
  evidence_strength: number;
  hallucination_risk: number;
}

export default function ConfidenceDashboard({ metrics }: { metrics: ConfidenceMetrics }) {
  if (!metrics) return null;

  const getRiskColor = (val: number) => {
    if (val < 0.3) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (val < 0.7) return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    return "text-red-400 bg-red-500/10 border-red-500/20";
  };

  const getScoreColor = (val: number) => {
    if (val > 0.8) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (val > 0.5) return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    return "text-red-400 bg-red-500/10 border-red-500/20";
  };

  return (
    <div className="space-y-6">
      <div className="glassmorphism p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-bold text-slate-100 mb-1">Overall Confidence</h3>
          <p className="text-slate-400 text-sm">Aggregated trustworthiness of the generated report.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`${metrics.overall > 0.8 ? "text-emerald-500" : metrics.overall > 0.5 ? "text-amber-500" : "text-red-500"}`}
                strokeDasharray={`${metrics.overall * 100}, 100`}
                strokeWidth="3"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute text-xl font-bold text-slate-100">
              {Math.round(metrics.overall * 100)}%
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-5 rounded-2xl border ${getScoreColor(metrics.source_agreement)}`}>
          <div className="text-sm opacity-80 mb-1">Source Agreement</div>
          <div className="text-2xl font-bold">{Math.round(metrics.source_agreement * 100)}%</div>
          <div className="text-xs opacity-60 mt-1">Consensus across URLs</div>
        </div>
        <div className={`p-5 rounded-2xl border ${getScoreColor(metrics.evidence_strength)}`}>
          <div className="text-sm opacity-80 mb-1">Evidence Strength</div>
          <div className="text-2xl font-bold">{Math.round(metrics.evidence_strength * 100)}%</div>
          <div className="text-xs opacity-60 mt-1">Depth of extracted facts</div>
        </div>
        <div className={`p-5 rounded-2xl border ${getRiskColor(metrics.hallucination_risk)}`}>
          <div className="text-sm opacity-80 mb-1">Hallucination Risk</div>
          <div className="text-2xl font-bold">{Math.round(metrics.hallucination_risk * 100)}%</div>
          <div className="text-xs opacity-60 mt-1">Probability of fabrication</div>
        </div>
      </div>
    </div>
  );
}
