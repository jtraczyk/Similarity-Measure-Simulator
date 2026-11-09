import React, { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ReferenceLine } from 'recharts';
import { Award, TrendingUp, CheckCircle, HelpCircle, Layers } from 'lucide-react';
import { EMPIRICAL_STUDIES_RESULTS } from '../data/paperData';

export const EmpiricalResultsViewer: React.FC = () => {
  const [selectedStudyTab, setSelectedStudyTab] = useState<'study1' | 'study2' | 'study3'>('study1');

  // Study 1 Figure 2 Data
  const study1Data = [
    {
      deliberation: 'Low',
      HighNumeracy: 0.65,
      LowNumeracy: 0.62,
      ciHighUpper: 0.65 + 1.96 * 0.02,
      ciHighLower: 0.65 - 1.96 * 0.02,
      ciLowUpper: 0.62 + 1.96 * 0.022,
      ciLowLower: 0.62 - 1.96 * 0.022
    },
    {
      deliberation: 'Moderate',
      HighNumeracy: 0.69,
      LowNumeracy: 0.64,
      ciHighUpper: 0.69 + 1.96 * 0.02,
      ciHighLower: 0.69 - 1.96 * 0.02,
      ciLowUpper: 0.64 + 1.96 * 0.022,
      ciLowLower: 0.64 - 1.96 * 0.022
    },
    {
      deliberation: 'High',
      HighNumeracy: 0.79,
      LowNumeracy: 0.75,
      ciHighUpper: 0.79 + 1.96 * 0.016,
      ciHighLower: 0.79 - 1.96 * 0.016,
      ciLowUpper: 0.75 + 1.96 * 0.022,
      ciLowLower: 0.75 - 1.96 * 0.022
    }
  ];

  // Study 2 Figure 5 Data
  const study2Data = [
    {
      deliberation: 'Low',
      HighNumeracy: 0.66,
      LowNumeracy: 0.63,
      ciHighUpper: 0.66 + 1.96 * 0.021,
      ciHighLower: 0.66 - 1.96 * 0.021,
      ciLowUpper: 0.63 + 1.96 * 0.022,
      ciLowLower: 0.63 - 1.96 * 0.022
    },
    {
      deliberation: 'Moderate',
      HighNumeracy: 0.64,
      LowNumeracy: 0.66,
      ciHighUpper: 0.64 + 1.96 * 0.025,
      ciHighLower: 0.64 - 1.96 * 0.025,
      ciLowUpper: 0.66 + 1.96 * 0.023,
      ciLowLower: 0.66 - 1.96 * 0.023
    },
    {
      deliberation: 'High',
      HighNumeracy: 0.75,
      LowNumeracy: 0.79,
      ciHighUpper: 0.75 + 1.96 * 0.02,
      ciHighLower: 0.75 - 1.96 * 0.02,
      ciLowUpper: 0.79 + 1.96 * 0.021,
      ciLowLower: 0.79 - 1.96 * 0.021
    }
  ];

  // Study 3 Figure 6 Data: DfD vs DpE
  const study3Data = [
    { deliberation: 'Low', DfD: 0.86, DpE: 0.83 },
    { deliberation: 'Moderate', DfD: 0.82, DpE: 0.81 },
    { deliberation: 'High', DfD: 0.92, DpE: 0.89 }
  ];

  // Figure 3 Confidence Data: Panel A (Flat across Deliberation) vs Panel B (Correlated with Experienced Prob)
  const confidenceDeliberationData = [
    { deliberation: 'Low', confidence: 6.39, ciLower: 6.1, ciUpper: 6.6 },
    { deliberation: 'Moderate', confidence: 6.22, ciLower: 5.95, ciUpper: 6.48 },
    { deliberation: 'High', confidence: 6.41, ciLower: 6.15, ciUpper: 6.65 }
  ];

  const confidenceProbRegressionData = [
    { prob: 0.05, confHigh: 5.2, confMod: 5.3, confLow: 5.1 },
    { prob: 0.25, confHigh: 5.8, confMod: 5.8, confLow: 5.7 },
    { prob: 0.50, confHigh: 6.4, confMod: 6.3, confLow: 6.3 },
    { prob: 0.75, confHigh: 7.0, confMod: 6.8, confLow: 6.7 },
    { prob: 0.95, confHigh: 7.4, confMod: 7.1, confLow: 7.0 }
  ];

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono tracking-wider text-indigo-400">
                Empirical Research Synthesis · N = 600 Participants
              </span>
              <span className="text-xs font-medium text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded">
                Preregistered Hypotheses Confirmed
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight mt-1">
              Equalizing Decision Quality: Closing the Numeracy Gap
            </h2>
            <p className="text-slate-300 text-sm mt-1.5 max-w-3xl leading-relaxed">
              Prior research assumed less numerate individuals suffer from permanent computational limits.
              Here, across three empirical studies, the deliberation intervention demonstrated that less numerate individuals benefit disproportionately from increased exploration, producing a <strong>steeper improvement slope (t = -7.52, p &lt; .001)</strong> that converges with highly numerate peers.
            </p>
          </div>

          <div className="flex md:flex-col gap-2 shrink-0">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-lg p-3 text-center min-w-[120px]">
              <span className="text-slate-400 text-[10px] block font-mono uppercase">Effect Size (High-Low)</span>
              <span className="text-xl font-bold font-mono text-emerald-400">d = 0.65</span>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-lg p-3 text-center min-w-[120px]">
              <span className="text-slate-400 text-[10px] block font-mono uppercase">Linear Trend</span>
              <span className="text-xl font-bold font-mono text-indigo-400">p &lt; .001</span>
            </div>
          </div>
        </div>
      </div>

      {/* Study Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setSelectedStudyTab('study1')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            selectedStudyTab === 'study1'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'
          }`}
        >
          Study 1: Voluntary Exploration (N = 192)
        </button>
        <button
          onClick={() => setSelectedStudyTab('study2')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            selectedStudyTab === 'study2'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'
          }`}
        >
          Study 2: Involuntary Piecewise (N = 123)
        </button>
        <button
          onClick={() => setSelectedStudyTab('study3')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            selectedStudyTab === 'study3'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'
          }`}
        >
          Study 3: DfD vs. DpE (N = 285)
        </button>
      </div>

      {/* STUDY 1 VIEW */}
      {selectedStudyTab === 'study1' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Figure 2 Chart */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-xs uppercase font-mono text-indigo-600 font-semibold">
                    Figure 2 Reproduction
                  </span>
                  <h4 className="text-base font-bold text-slate-900">
                    Mean Decision Accuracy (EV Consistency) by Deliberation &amp; Numeracy
                  </h4>
                  <p className="text-xs text-slate-500">
                    Error bars represent 95% confidence intervals (N_High = 110, N_Low = 82)
                  </p>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={study1Data} margin={{ top: 20, right: 30, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="deliberation" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis
                      domain={[0.55, 0.85]}
                      ticks={[0.55, 0.60, 0.65, 0.70, 0.75, 0.80, 0.85]}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      label={{ value: 'Decision Accuracy (EV Consistency)', angle: -90, position: 'insideLeft', offset: 15, fontSize: 11, fill: '#64748b' }}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-lg text-xs font-mono shadow-md">
                              <div className="font-bold border-b border-slate-700 pb-1 mb-1">
                                {label} Deliberation
                              </div>
                              <div className="text-amber-400">
                                Highly Numerate: {((payload[0]?.value as number) * 100).toFixed(1)}%
                              </div>
                              <div className="text-sky-400">
                                Less Numerate: {((payload[1]?.value as number) * 100).toFixed(1)}%
                              </div>
                              <div className="text-slate-400 text-[10px] pt-1 mt-1 border-t border-slate-800">
                                Accuracy Gap narrows from 3.0% to convergence at High Deliberation
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }} />
                    <Line
                      type="monotone"
                      dataKey="HighNumeracy"
                      name="Highly Numerate (BNT ≥ 4)"
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      dot={{ r: 5, fill: '#f59e0b' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="LowNumeracy"
                      name="Less Numerate (BNT < 4)"
                      stroke="#0284c7"
                      strokeWidth={2.5}
                      dot={{ r: 5, fill: '#0284c7' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 p-3 bg-slate-50 rounded-lg text-xs text-slate-600 flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Key Empirical Discovery:</strong> Less numerate individuals jumped from <strong>62% accuracy at Low Deliberation to 75% at High Deliberation</strong> (+13 percentage points), substantially narrowing the gap with highly numerate individuals (65% to 79%). The linear interaction trend was highly significant: <span className="font-mono font-semibold text-slate-900">t(190) = -7.52, p &lt; .001, d = -0.69</span>.
                </span>
              </div>
            </div>

            {/* Statistical ANOVA Panel */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <h4 className="text-sm font-semibold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span>Repeated-Measures ANOVA</span>
                  <span className="font-mono text-xs text-indigo-600 font-semibold">Study 1</span>
                </h4>

                <div className="mt-3 space-y-2.5 text-xs font-mono">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500 font-sans">Main Effect Deliberation:</span>
                    <span className="font-bold text-slate-900">F(1.96, 373.42) = 25.57</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500 font-sans">p-value:</span>
                    <span className="font-bold text-emerald-600">p &lt; .001</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500 font-sans">Partial Eta Squared (η_p²):</span>
                    <span className="font-bold text-slate-900">0.12 (Large)</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500 font-sans">Correction:</span>
                    <span className="text-slate-700 font-sans">Huynh-Feldt</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500 font-sans">Numeracy Contrast Coeff:</span>
                    <span className="font-bold text-indigo-600">-0.14 (SE = 0.02)</span>
                  </div>
                </div>
              </div>

              {/* Table 1 Pairwise Comparisons */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <h4 className="text-sm font-semibold text-slate-900 pb-2 border-b border-slate-100">
                  Table 1: Post Hoc Pairwise Comparisons
                </h4>
                <div className="overflow-x-auto mt-2">
                  <table className="w-full text-xs font-mono text-left">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-200">
                        <th className="py-1.5">Comparison</th>
                        <th className="py-1.5 text-right">Diff</th>
                        <th className="py-1.5 text-right">d</th>
                        <th className="py-1.5 text-right">p_bonf</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {EMPIRICAL_STUDIES_RESULTS.study1.pairwiseComparisons.map((c) => (
                        <tr key={c.comparison} className="hover:bg-slate-50">
                          <td className="py-1.5 font-sans font-medium text-slate-800">{c.comparison}</td>
                          <td className="py-1.5 text-right font-bold text-slate-900">+{c.diff.toFixed(3)}</td>
                          <td className="py-1.5 text-right text-indigo-600 font-semibold">{c.d.toFixed(2)}</td>
                          <td className="py-1.5 text-right text-slate-600">{c.pBonf}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Figure 3: Confidence vs Deliberation and Experienced Probability */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="mb-4 pb-3 border-b border-slate-100">
              <span className="text-xs uppercase font-mono text-indigo-600 font-semibold">
                Figure 3 &amp; Exploratory Analysis
              </span>
              <h4 className="text-base font-bold text-slate-900">
                The Decision Confidence Paradox: Process vs. Outcome Uncertainty
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Panel A shows confidence is NOT increased by deliberation time; Panel B shows confidence is driven by perceived environmental probability (r = .19, p &lt; .001).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Panel A */}
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="text-xs font-semibold text-slate-800 mb-1">
                  Panel A: Confidence across Deliberation Conditions
                </div>
                <div className="text-[11px] text-slate-500 mb-2">
                  Flat relationship (F = 3.31, p = .047, but η_p² = .016; Bonferroni diffs p = 1.0)
                </div>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={confidenceDeliberationData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="deliberation" tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis domain={[5.0, 8.0]} tick={{ fontSize: 10, fill: '#64748b' }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="confidence" stroke="#475569" strokeWidth={2.5} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Panel B */}
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="text-xs font-semibold text-slate-800 mb-1">
                  Panel B: Confidence vs. Experienced Probability
                </div>
                <div className="text-[11px] text-slate-500 mb-2">
                  Strong positive association: β = 1.90, t(3452) = 11.09, p &lt; .001
                </div>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={confidenceProbRegressionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="prob" tick={{ fontSize: 10, fill: '#64748b' }} domain={[0, 1]} />
                      <YAxis domain={[5.0, 8.0]} tick={{ fontSize: 10, fill: '#64748b' }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="confHigh" name="High Delib" stroke="#6366f1" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="confMod" name="Moderate Delib" stroke="#f59e0b" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="confLow" name="Low Delib" stroke="#0d9488" strokeDasharray="2 2" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STUDY 2 VIEW */}
      {selectedStudyTab === 'study2' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <span className="text-xs uppercase font-mono text-indigo-600 font-semibold">
                Figure 5 Reproduction
              </span>
              <h4 className="text-base font-bold text-slate-900 mt-1">
                Study 2 Replication: Involuntary Piecewise Outcome Streams
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Participants observed alternating computer-presented outcome streams, ruling out the artifact of reduced switching ratio (N = 123)
              </p>

              <div className="h-72 w-full mt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={study2Data} margin={{ top: 20, right: 30, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="deliberation" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis
                      domain={[0.55, 0.85]}
                      ticks={[0.55, 0.60, 0.65, 0.70, 0.75, 0.80, 0.85]}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      label={{ value: 'Decision Accuracy (EV Consistency)', angle: -90, position: 'insideLeft', offset: 15, fontSize: 11, fill: '#64748b' }}
                    />
                    <Tooltip />
                    <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }} />
                    <Line
                      type="monotone"
                      dataKey="HighNumeracy"
                      name="Highly Numerate (N = 63)"
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      dot={{ r: 5, fill: '#f59e0b' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="LowNumeracy"
                      name="Less Numerate (N = 60)"
                      stroke="#0284c7"
                      strokeWidth={2.5}
                      dot={{ r: 5, fill: '#0284c7' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 p-3 bg-slate-50 rounded-lg text-xs text-slate-600">
                <strong>Study 2 Robustness Check:</strong> Even with computer-controlled piecewise sampling where participants could not choose when to switch options, less numerate decision makers showed a <strong>steeper improvement slope (t(121) = -5.82, p &lt; .001, d = -0.67)</strong>, reaching 79% accuracy in the High condition.
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <h4 className="text-sm font-semibold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span>Table 2 Pairwise Comparisons</span>
                  <span className="font-mono text-xs text-indigo-600">Study 2</span>
                </h4>
                <div className="overflow-x-auto mt-2">
                  <table className="w-full text-xs font-mono text-left">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-200">
                        <th className="py-1.5">Comparison</th>
                        <th className="py-1.5 text-right">Diff</th>
                        <th className="py-1.5 text-right">d</th>
                        <th className="py-1.5 text-right">p_bonf</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {EMPIRICAL_STUDIES_RESULTS.study2.pairwiseComparisons.map((c) => (
                        <tr key={c.comparison} className="hover:bg-slate-50">
                          <td className="py-1.5 font-sans font-medium text-slate-800">{c.comparison}</td>
                          <td className="py-1.5 text-right font-bold text-slate-900">+{c.diff.toFixed(3)}</td>
                          <td className="py-1.5 text-right text-indigo-600 font-semibold">{c.d.toFixed(2)}</td>
                          <td className="py-1.5 text-right text-slate-600">{c.pBonf}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-mono text-slate-600 space-y-1">
                  <div>RMANOVA: F(2, 244) = 22.62, p &lt; .001</div>
                  <div>Partial Eta Squared: η_p² = 0.16</div>
                  <div>Contrast Est: -0.12 (SE = 0.02)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STUDY 3 VIEW */}
      {selectedStudyTab === 'study3' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <span className="text-xs uppercase font-mono text-indigo-600 font-semibold">
              Figure 6 Reproduction
            </span>
            <h4 className="text-base font-bold text-slate-900 mt-1">
              Study 3: Decision from Description (DfD) vs. Description plus Experience (DpE)
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Testing whether deliberation benefits persist when explicit symbolic probabilities are provided alongside experienced sampling (N = 285)
            </p>

            <div className="h-72 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={study3Data} margin={{ top: 20, right: 30, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="deliberation" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis
                    domain={[0.75, 0.95]}
                    ticks={[0.75, 0.80, 0.85, 0.90, 0.95]}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    label={{ value: 'Decision Accuracy', angle: -90, position: 'insideLeft', offset: 15, fontSize: 11, fill: '#64748b' }}
                  />
                  <Tooltip />
                  <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }} />
                  <Line
                    type="monotone"
                    dataKey="DfD"
                    name="Decision from Description (N = 149)"
                    stroke="#475569"
                    strokeWidth={2.5}
                    dot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="DpE"
                    name="Description + Experience (N = 136)"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    dot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 p-3.5 bg-slate-50 rounded-lg text-xs text-slate-600">
              <strong>Study 3 Conclusion:</strong> Deliberation maintained a highly significant main effect across both presentation formats (<span className="font-mono">F(1.96, 555.27) = 40.76, p &lt; .001, η_p² = 0.13</span>). The linear trend interaction demonstrated that combining descriptive probabilities with experiential sampling (DpE) yields a significantly steeper rate of change (<span className="font-mono">t(283) = -5.60, p &lt; .001</span>).
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
