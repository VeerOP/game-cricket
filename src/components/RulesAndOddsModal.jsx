import React from 'react';
import { X, Trophy, Plane, Star, TrendingUp } from 'lucide-react';

export default function RulesAndOddsModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-zinc-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92dvh] flex flex-col">
        {/* Header */}
        <div className="p-3.5 sm:p-5 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-amber-400 shrink-0">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Rules & Fantasy Scoring
              </h2>
              <p className="text-[11px] sm:text-xs text-zinc-400">
                16-0 Cricket Draft Simulation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0"
            aria-label="Close rules modal"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-3.5 sm:p-5 overflow-y-auto space-y-3 sm:space-y-4 text-xs text-zinc-300 flex-1">
          {/* Objective */}
          <div className="bg-zinc-950 p-3 sm:p-3.5 rounded-xl border border-zinc-800">
            <h3 className="font-bold text-zinc-100 text-[11px] sm:text-xs uppercase mb-1 font-sports">
              Objective
            </h3>
            <p className="text-zinc-400 leading-relaxed text-[11px] sm:text-xs">
              Draft an all-time Starting XI from randomly spun club and national eras, then simulate the entire campaign to achieve an undefeated record.
            </p>
          </div>

          {/* Roster Rules */}
          <div className="bg-zinc-950 p-3 sm:p-3.5 rounded-xl border border-zinc-800 space-y-1.5">
            <h3 className="font-bold text-zinc-100 text-[11px] sm:text-xs uppercase mb-1 flex items-center gap-1.5 font-sports">
              <Plane className="w-3.5 h-3.5 text-zinc-400" /> Roster Constraints
            </h3>
            <ul className="space-y-1 list-disc list-inside text-zinc-400 text-[11px] sm:text-xs">
              <li><strong className="text-zinc-200">Max 4 Overseas Players:</strong> True to official T20 regulations, your XI can contain at most 4 international players.</li>
              <li><strong className="text-zinc-200">Designated Wicketkeeper:</strong> Your starting XI must include at least 1 recognized keeper.</li>
              <li><strong className="text-zinc-200">Bowling Depth:</strong> Minimum 2 pacers and 1 spinner required.</li>
            </ul>
          </div>

          {/* Fantasy Scoring */}
          <div className="bg-zinc-950 p-3 sm:p-3.5 rounded-xl border border-zinc-800">
            <h3 className="font-bold text-zinc-100 text-[11px] sm:text-xs uppercase mb-2 flex items-center gap-1.5 font-sports">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Dream11 Point Model
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-zinc-400 text-[11px] sm:text-xs">
              <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800/80">
                <span className="font-semibold text-zinc-200 block mb-0.5 font-sports">Batting</span>
                <p>• 1 pt per run</p>
                <p>• +1 for 4, +2 for 6</p>
                <p>• +4 (30r), +8 (50r), +16 (100r)</p>
                <p>• +6 for Strike Rate &gt; 170</p>
              </div>
              <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800/80">
                <span className="font-semibold text-zinc-200 block mb-0.5 font-sports">Bowling & Fielding</span>
                <p>• +25 pts per wicket</p>
                <p>• +8 for Bowled / LBW</p>
                <p>• +12 for Maiden over</p>
                <p>• +8 for 4-wkt, +16 for 5-wkt</p>
              </div>
            </div>
            <p className="mt-2 text-[10px] sm:text-[11px] text-zinc-400">
              Captain (C) receives <strong className="text-amber-400">2.0x</strong> fantasy multiplier; Vice-Captain (VC) receives <strong className="text-sky-400">1.5x</strong>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-3.5 bg-zinc-950 border-t border-zinc-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
