import React from 'react';
import { X, Trophy, Plane, Star, TrendingUp } from 'lucide-react';

export default function RulesAndOddsModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-zinc-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-amber-400">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Rules & Fantasy Scoring
              </h2>
              <p className="text-xs text-zinc-400">
                16-0 Cricket Draft Simulation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs text-zinc-300">
          {/* Objective */}
          <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800">
            <h3 className="font-bold text-zinc-100 text-xs uppercase mb-1">
              Objective
            </h3>
            <p className="text-zinc-400 leading-relaxed">
              Draft an all-time Starting XI from randomly spun club and national eras, then simulate the entire campaign to achieve an undefeated record.
            </p>
          </div>

          {/* Roster Rules */}
          <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 space-y-1.5">
            <h3 className="font-bold text-zinc-100 text-xs uppercase mb-1 flex items-center gap-1.5">
              <Plane className="w-3.5 h-3.5 text-zinc-400" /> Roster Constraints
            </h3>
            <ul className="space-y-1 list-disc list-inside text-zinc-400">
              <li><strong className="text-zinc-200">Max 4 Overseas Players:</strong> True to official T20 regulations, your XI can contain at most 4 international players.</li>
              <li><strong className="text-zinc-200">Designated Wicketkeeper:</strong> Your starting XI must include at least 1 recognized keeper.</li>
              <li><strong className="text-zinc-200">Bowling Depth:</strong> Minimum 2 pacers and 1 spinner required.</li>
            </ul>
          </div>

          {/* Fantasy Scoring */}
          <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800">
            <h3 className="font-bold text-zinc-100 text-xs uppercase mb-2 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Dream11 Point Model
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-zinc-400">
              <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800/80">
                <span className="font-semibold text-zinc-200 block mb-0.5">Batting</span>
                <p>• 1 pt per run</p>
                <p>• +1 for 4, +2 for 6</p>
                <p>• +4 (30r), +8 (50r), +16 (100r)</p>
                <p>• +6 for Strike Rate &gt; 170</p>
              </div>
              <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800/80">
                <span className="font-semibold text-zinc-200 block mb-0.5">Bowling & Fielding</span>
                <p>• +25 pts per wicket</p>
                <p>• +8 for Bowled / LBW</p>
                <p>• +12 for Maiden over</p>
                <p>• +8 for 4-wkt, +16 for 5-wkt</p>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-zinc-400">
              Captain (C) receives <strong className="text-amber-400">2.0x</strong> fantasy multiplier; Vice-Captain (VC) receives <strong className="text-sky-400">1.5x</strong>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-zinc-950 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
