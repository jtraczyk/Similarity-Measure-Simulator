import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ReferenceLine } from 'recharts';
import { Sliders, RefreshCw, CheckCircle, Calculator, ArrowRight } from 'lucide-react';
import { GambleOption } from '../types/decision';
import { simulateEnsemble } from '../utils/simulation';

export const CustomGambleAnalyzer: React.FC = () => {
  // Option A Inputs
  const [outcomeA1, setOutcomeA1] = useState<number>(50);
  const [probA1, setProbA1] = useState<number>(0.60);
  const [outcomeA2, setOutcomeA2] = useState<number>(0);

  // Option B Inputs
  const [outcomeB1, setOutcomeB1] = useState<number>(90);
  const [probB1, setProbB1] = useState<number>(0.30);
  const [outcomeB2, setOutcomeB2] = useState<number>(0);

  // Simulation controls
  const [runsCount, setRunsCount] = useState<number>(100);
  const [maxDraws, setMaxDraws] = useState<number>(40);
  const [customSeed, setCustomSeed] = useState<number>(77);

  // Computed Gamble Options
  const optionA: GambleOption = useMemo(() => ({
    outcome1: outcomeA1,
    prob1: probA1,
    outcome2: outcomeA2,
    prob2: parseFloat((1 - probA1).toFixed(2)),
    ev: outcomeA1 * probA1 + outcomeA2 * (1 - probA1)
  }), [outcomeA1, probA1, outcomeA2]);

  const optionB: GambleOption = useMemo(() => ({
    outcome1: outcomeB1,
    prob1: probB1,
    outcome2: outcomeB2,
    prob2: parseFloat((1 - probB1).toFixed(2)),
    ev: outcomeB1 * probB1 + outcomeB2 * (1 - probB1)
  }), [outcomeB1, probB1, outcomeB2]);

  // Run Ensembles for both options
  const ensembleA = useMemo(() => {
    return simulateEnsemble(optionA, runsCount, maxDraws, customSeed);
  }, [optionA, runsCount, maxDraws, customSeed]);

  const ensembleB = useMemo(() => {
    return simulateEnsemble(optionB, runsCount, maxDraws, customSeed + 50);
  }, [optionB, runsCount, maxDraws, customSeed]);

  // Combined chart data
  const chartData = useMemo(() => {
    return ensembleA.aggregatedSteps.map((stepA, i) => {
      const stepB = ensembleB.aggregatedSteps[i];
      return {
        step: stepA.step,
        simA: parseFloat(stepA.avgSimilarity.toFixed(3)),
        simB: stepB ? parseFloat(stepB.avgSimilarity.toFixed(3)) : 0,
        meanA: parseFloat(stepA.avgMean.toFixed(2)),
        meanB: stepB ? parseFloat(stepB.avgMean.toFixed(2)) : 0
      };
    });
  }, [ensembleA, ensembleB]);

  const normativeBest = optionA.ev > optionB.ev ? 'A' : optionA.ev < optionB.ev ? 'B' : 'Indifferent';
  const evDifference = Math.abs(optionA.ev - optionB.ev);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono text-indigo-600 font-semibold">
                Theoretical Research Lab
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-600 font-mono">
                Monte Carlo Convergence Testing
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">
              Custom Decision Problem &amp; Similarity Analyzer
            </h3>
            <p className="text-xs text-slate-500">
              Configure arbitrary binary gambles and calculate the required sampling budget across 70%, 80%, and 90% veridicality
            </p>
          </div>

          <button
            onClick={() => setCustomSeed(prev => prev + 1)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-200 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Resample Trajectories</span>
          </button>
        </div>

        {/* Input Form for Option A and B */}
        <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Option A Box */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-bold font-mono uppercase text-sky-800">Option A Configuration</span>
              <span className="text-xs font-mono font-bold text-slate-900">EV = {optionA.ev.toFixed(2)} pts</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Outcome 1 (x₁)</label>
                <input
                  type="number"
                  value={outcomeA1}
                  onChange={(e) => setOutcomeA1(Number(e.target.value))}
                  className="w-full text-xs font-mono bg-white border border-slate-300 rounded px-2 py-1.5 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Probability 1 (p₁)</label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.05"
                  value={probA1}
                  onChange={(e) => setProbA1(Number(e.target.value))}
                  className="w-full text-xs font-mono bg-white border border-slate-300 rounded px-2 py-1.5 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Outcome 2 (x₂)</label>
                <input
                  type="number"
                  value={outcomeA2}
                  onChange={(e) => setOutcomeA2(Number(e.target.value))}
                  className="w-full text-xs font-mono bg-white border border-slate-300 rounded px-2 py-1.5 text-slate-800"
                />
              </div>
            </div>

            <div className="text-[11px] text-slate-500 font-mono">
              Payoff: {probA1 * 100}% chance of {outcomeA1}, {((1 - probA1) * 100).toFixed(0)}% chance of {outcomeA2}
            </div>
          </div>

          {/* Option B Box */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-bold font-mono uppercase text-amber-800">Option B Configuration</span>
              <span className="text-xs font-mono font-bold text-slate-900">EV = {optionB.ev.toFixed(2)} pts</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Outcome 1 (x₁)</label>
                <input
                  type="number"
                  value={outcomeB1}
                  onChange={(e) => setOutcomeB1(Number(e.target.value))}
                  className="w-full text-xs font-mono bg-white border border-slate-300 rounded px-2 py-1.5 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Probability 1 (p₁)</label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.05"
                  value={probB1}
                  onChange={(e) => setProbB1(Number(e.target.value))}
                  className="w-full text-xs font-mono bg-white border border-slate-300 rounded px-2 py-1.5 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Outcome 2 (x₂)</label>
                <input
                  type="number"
                  value={outcomeB2}
                  onChange={(e) => setOutcomeB2(Number(e.target.value))}
                  className="w-full text-xs font-mono bg-white border border-slate-300 rounded px-2 py-1.5 text-slate-800"
                />
              </div>
            </div>

            <div className="text-[11px] text-slate-500 font-mono">
              Payoff: {probB1 * 100}% chance of {outcomeB1}, {((1 - probB1) * 100).toFixed(0)}% chance of {outcomeB2}
            </div>
          </div>
        </div>
      </div>

      {/* Normative Evaluation & Required Exploration Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Normative Solution Card */}
        <div className="bg-slate-900 text-white rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono uppercase text-indigo-400 font-semibold block">
              Normative Expected Value
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold font-mono">Option {normativeBest}</span>
              <span className="text-xs text-slate-400">is EV-Maximizing</span>
            </div>
            <div className="mt-3 text-xs text-slate-300 space-y-1 font-mono">
              <div>EV(A): {optionA.ev.toFixed(2)} pts</div>
              <div>EV(B): {optionB.ev.toFixed(2)} pts</div>
              <div className="text-emerald-400 font-bold mt-1">ΔEV: {evDifference.toFixed(2)} pts difference</div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
            Fuzzy Trace Theory suggests individuals shift to verbatim calculations when EV difference is small and ordinal gist is insufficient.
          </div>
        </div>

        {/* Required Samples for Option A */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-bold font-mono uppercase text-sky-700 block">
            Option A Required Samples
          </span>
          <div className="mt-3 space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-600 font-sans">Low Deliberation (70%):</span>
              <span className="font-bold text-slate-900">{ensembleA.avgToLow || 3} draws</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-600 font-sans">Moderate Deliberation (80%):</span>
              <span className="font-bold text-slate-900">{ensembleA.avgToMod || 5} draws</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-600 font-sans">High Deliberation (90%):</span>
              <span className="font-bold text-indigo-600">{ensembleA.avgToHigh || 10} draws</span>
            </div>
          </div>
        </div>

        {/* Required Samples for Option B */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-bold font-mono uppercase text-amber-700 block">
            Option B Required Samples
          </span>
          <div className="mt-3 space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-600 font-sans">Low Deliberation (70%):</span>
              <span className="font-bold text-slate-900">{ensembleB.avgToLow || 4} draws</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-600 font-sans">Moderate Deliberation (80%):</span>
              <span className="font-bold text-slate-900">{ensembleB.avgToMod || 7} draws</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-600 font-sans">High Deliberation (90%):</span>
              <span className="font-bold text-indigo-600">{ensembleB.avgToHigh || 14} draws</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trajectory Comparison Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="mb-3">
          <span className="text-xs uppercase font-mono text-indigo-600 font-semibold">
            Monte Carlo δ(n) Trajectories
          </span>
          <h4 className="text-base font-bold text-slate-900 mt-0.5">
            Convergence Comparison: Option A vs. Option B
          </h4>
          <p className="text-xs text-slate-500">
            Averaged over {runsCount} simulated exploration sequences
          </p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="step" tick={{ fontSize: 11, fill: '#64748b' }} label={{ value: 'Sample Number (n)', position: 'insideBottom', offset: -4, fontSize: 11, fill: '#64748b' }} />
              <YAxis domain={[0.4, 1.0]} ticks={[0.4, 0.6, 0.7, 0.8, 0.9, 1.0]} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }} />
              <ReferenceLine y={0.90} stroke="#10b981" strokeDasharray="3 3" strokeWidth={1.5} label={{ value: '90%', position: 'insideTopRight', fill: '#059669', fontSize: 10 }} />
              <ReferenceLine y={0.80} stroke="#f59e0b" strokeDasharray="3 3" strokeWidth={1.5} label={{ value: '80%', position: 'insideTopRight', fill: '#d97706', fontSize: 10 }} />
              <ReferenceLine y={0.70} stroke="#0284c7" strokeDasharray="3 3" strokeWidth={1.5} label={{ value: '70%', position: 'insideTopRight', fill: '#0369a1', fontSize: 10 }} />

              <Line type="monotone" dataKey="simA" name="Option A Similarity δ(n)" stroke="#0284c7" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="simB" name="Option B Similarity δ(n)" stroke="#f59e0b" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
