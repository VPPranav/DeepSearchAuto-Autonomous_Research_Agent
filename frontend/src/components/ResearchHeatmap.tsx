import React from 'react';

interface Keyword {
  keyword: string;
  intensity: number;
  category: string;
}

export default function ResearchHeatmap({ keywords }: { keywords: Keyword[] }) {
  if (!keywords || keywords.length === 0) {
    return <div className="p-10 text-center text-slate-500 glassmorphism rounded-2xl">No keywords extracted.</div>;
  }

  // Sort by intensity descending
  const sorted = [...keywords].sort((a, b) => b.intensity - a.intensity);

  const getHeatColor = (intensity: number) => {
    if (intensity > 85) return 'bg-rose-500 text-rose-50';
    if (intensity > 70) return 'bg-orange-500 text-orange-50';
    if (intensity > 50) return 'bg-amber-500 text-amber-900';
    if (intensity > 30) return 'bg-blue-500 text-blue-50';
    return 'bg-slate-700 text-slate-300';
  };

  return (
    <div className="glassmorphism p-6 rounded-2xl border border-white/5">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-100 mb-2">Topic Intensity Heatmap</h3>
        <p className="text-slate-400 text-sm">Keywords and concepts that received the most attention across all gathered sources.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {sorted.map((kw, i) => (
          <div
            key={i}
            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border border-white/10 shadow-lg ${getHeatColor(kw.intensity)}`}
            style={{ 
              opacity: Math.max(0.6, kw.intensity / 100),
              transform: `scale(${Math.max(0.9, 0.9 + (kw.intensity / 100) * 0.2)})` 
            }}
          >
            <span>{kw.keyword}</span>
            <span className="bg-black/20 px-2 py-0.5 rounded-full text-[10px]">
              {kw.intensity}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
