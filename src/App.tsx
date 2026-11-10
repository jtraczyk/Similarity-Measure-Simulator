/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  FastForward,
  Download,
  Info,
  CheckCircle2,
  ExternalLink,
  Upload,
  FileSpreadsheet,
  Sparkles,
  FileText,
  BookOpen
} from 'lucide-react';
import { ReadmeTab } from './components/ReadmeTab';
import { TABLE_3_CHOICE_PROBLEMS } from './data/paperData';
import {
  runRScriptAlgorithm,
  downloadCSV,
  exportSimilarityMeasureCSV,
  calculateDeltaN,
  parseChoiceProblemsCSV,
  getChoiceProblemsCSVTemplate,
  exportCalculatedLimitsCSV,
  DEFAULT_REPLICATION_PROBLEMS
} from './utils/simulation';
import { BatchCalculatedProblem } from './types/decision';

export default function App() {
  // Preset mode
  const [preset, setPreset] = useState<'fig1' | 'table3' | 'custom'>('fig1');
  const [selectedProblemIndex, setSelectedProblemIndex] = useState<number>(0);

  // Custom gamble state
  const [outcomeVal, setOutcomeVal] = useState<number>(40);
  const [outcomeProb, setOutcomeProb] = useState<number>(0.60);

  // Batch CSV replication state
  const [customSubMode, setCustomSubMode] = useState<'single' | 'batch'>('batch');
  const [batchProblems, setBatchProblems] = useState<BatchCalculatedProblem[]>(DEFAULT_REPLICATION_PROBLEMS);
  const [activeBatchId, setActiveBatchId] = useState<string | null>(DEFAULT_REPLICATION_PROBLEMS[0]?.id || null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeBatchProblem = useMemo(() => {
    return batchProblems.find(p => p.id === activeBatchId) || batchProblems[0] || null;
  }, [batchProblems, activeBatchId]);

  // Active gamble parameters
  const activeGamble = useMemo(() => {
    if (preset === 'fig1') {
      return {
        name: 'Figure 1 Benchmark',
        low: { outcome: 40, prob: 0.60, ev: 24.0 },
        high: { outcome: 80, prob: 0.30, ev: 24.0 }
      };
    }
    if (preset === 'table3') {
      const p = TABLE_3_CHOICE_PROBLEMS[selectedProblemIndex];
      return {
        name: `Problem ${p.problemNumber} (${p.domain})`,
        low: { outcome: p.optionA.outcome1, prob: p.optionA.prob1, ev: p.evA },
        high: { outcome: p.optionB.outcome1, prob: p.optionB.prob1, ev: p.evB }
      };
    }
    if (preset === 'custom') {
      if (customSubMode === 'batch' && activeBatchProblem) {
        return {
          name: `Custom [${activeBatchProblem.id}]`,
          low: {
            outcome: activeBatchProblem.optionA.outcome1,
            prob: activeBatchProblem.optionA.prob1,
            ev: activeBatchProblem.evA
          },
          high: {
            outcome: activeBatchProblem.optionB.outcome1,
            prob: activeBatchProblem.optionB.prob1,
            ev: activeBatchProblem.evB
          }
        };
      }
      return {
        name: 'Custom Gamble',
        low: { outcome: outcomeVal, prob: outcomeProb, ev: outcomeVal * outcomeProb },
        high: { outcome: outcomeVal * 2, prob: Math.max(0.05, outcomeProb / 2), ev: outcomeVal * outcomeProb }
      };
    }
    return {
      name: 'Custom Gamble',
      low: { outcome: outcomeVal, prob: outcomeProb, ev: outcomeVal * outcomeProb },
      high: { outcome: outcomeVal * 2, prob: Math.max(0.05, outcomeProb / 2), ev: outcomeVal * outcomeProb }
    };
  }, [preset, selectedProblemIndex, outcomeVal, outcomeProb, customSubMode, activeBatchProblem]);

  // Target Option selector: 'low' (Option A) or 'high' (Option B)
  const [targetOption, setTargetOption] = useState<'low' | 'high'>('low');

  // Interactive sample draws history
  interface DrawPoint {
    n: number;
    outcome: number;
    mean: number;
    similarity: number;
  }

  const [draws, setDraws] = useState<DrawPoint[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);

  // Perform 1 draw
  const addSingleDraw = () => {
    const opt = targetOption === 'low' ? activeGamble.low : activeGamble.high;
    const isWin = Math.random() < opt.prob;
    const outcome = isWin ? opt.outcome : 0;

    setDraws((prev) => {
      const n = prev.length + 1;
      const prevSum = prev.reduce((acc, p) => acc + p.outcome, 0);
      const newSum = prevSum + outcome;
      const currentMean = newSum / n;
      const prevMean = prev.length > 0 ? prev[prev.length - 1].mean : 0;

      const sim = n === 1 ? 0.40 : calculateDeltaN(prevMean, currentMean);

      return [
        ...prev,
        {
          n,
          outcome,
          mean: currentMean,
          similarity: sim
        }
      ];
    });
  };

  // Perform multiple draws at once
  const addBulkDraws = (count: number) => {
    const opt = targetOption === 'low' ? activeGamble.low : activeGamble.high;
    let newDraws = [...draws];

    for (let i = 0; i < count; i++) {
      const isWin = Math.random() < opt.prob;
      const outcome = isWin ? opt.outcome : 0;
      const n = newDraws.length + 1;
      const prevSum = newDraws.reduce((acc, p) => acc + p.outcome, 0);
      const newSum = prevSum + outcome;
      const currentMean = newSum / n;
      const prevMean = newDraws.length > 0 ? newDraws[newDraws.length - 1].mean : 0;

      const sim = n === 1 ? 0.40 : calculateDeltaN(prevMean, currentMean);

      newDraws.push({
        n,
        outcome,
        mean: currentMean,
        similarity: sim
      });
    }

    setDraws(newDraws);
  };

  // Reset simulation
  const resetSimulation = () => {
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setDraws([]);
  };

  // Auto-play timer (350ms per draw)
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        setDraws((prev) => {
          if (prev.length >= 35) {
            setIsPlaying(false);
            return prev;
          }
          const opt = targetOption === 'low' ? activeGamble.low : activeGamble.high;
          const isWin = Math.random() < opt.prob;
          const outcome = isWin ? opt.outcome : 0;
          const n = prev.length + 1;
          const prevSum = prev.reduce((acc, p) => acc + p.outcome, 0);
          const newSum = prevSum + outcome;
          const currentMean = newSum / n;
          const prevMean = prev.length > 0 ? prev[prev.length - 1].mean : 0;
          const sim = n === 1 ? 0.40 : calculateDeltaN(prevMean, currentMean);

          return [
            ...prev,
            {
              n,
              outcome,
              mean: currentMean,
              similarity: sim
            }
          ];
        });
      }, 350);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, targetOption, activeGamble]);

  // Current stats
  const latestDraw = draws[draws.length - 1] || null;
  const currentN = draws.length;
  const currentSim = latestDraw ? latestDraw.similarity : 0;
  const currentMean = latestDraw ? latestDraw.mean : 0;
  const trueEV = targetOption === 'low' ? activeGamble.low.ev : activeGamble.high.ev;

  // Threshold detection
  const reachedLowAt = draws.find((d, idx) => idx >= 2 && d.similarity >= 0.70)?.n || null;
  const reachedModAt = draws.find((d, idx) => idx >= 3 && d.similarity >= 0.80)?.n || null;
  const reachedHighAt = draws.find((d, idx) => idx >= 4 && d.similarity >= 0.90)?.n || null;

  // Theoretical curves comparison data (Monte Carlo benchmark like Figure 1)
  const theoreticalChartData = useMemo(() => {
    const points = [];
    for (let n = 1; n <= 35; n++) {
      // Low uncertainty (p=0.6) reaches 0.90 at n ~ 10
      // High uncertainty (p=0.3) reaches 0.84 at n = 10, reaches 0.90 at n ~ 15
      const lowSim = n === 1 ? 0.42 : Math.min(0.96, 0.42 + 0.54 * (1 - Math.exp(-0.24 * (n - 1))));
      const highSim = n === 1 ? 0.38 : Math.min(0.95, 0.38 + 0.57 * (1 - Math.exp(-0.16 * (n - 1))));

      const livePoint = draws[n - 1];

      points.push({
        n,
        lowExpected: parseFloat(lowSim.toFixed(3)),
        highExpected: parseFloat(highSim.toFixed(3)),
        liveSimilarity: livePoint ? parseFloat(livePoint.similarity.toFixed(3)) : null,
        liveMean: livePoint ? parseFloat(livePoint.mean.toFixed(2)) : null
      });
    }
    return points;
  }, [draws]);

  // Section toggle: 'simulator' vs 'table' vs 'readme'
  const [activeSection, setActiveSection] = useState<'simulator' | 'table' | 'readme'>('simulator');

  // R script data simulation
  const rResult = useMemo(() => runRScriptAlgorithm(30), []);

  const histogramData = useMemo(() => {
    const bins: { [key: number]: { nsample: number; Low: number; Moderate: number; High: number; total: number } } = {};
    for (let s = 4; s <= 22; s++) {
      bins[s] = { nsample: s, Low: 0, Moderate: 0, High: 0, total: 0 };
    }
    rResult.rows.forEach(r => {
      if (bins[r.nsample]) {
        bins[r.nsample][r.deliberation] += 1;
        bins[r.nsample].total += 1;
      }
    });
    return Object.values(bins).filter(b => b.total > 0 || (b.nsample >= 4 && b.nsample <= 22));
  }, [rResult]);

  return (
    <div className="min-h-screen bg-[#f8fafb] text-[#313131] pb-12 font-sans selection:bg-[#ef9421] selection:text-white">
      {/* Top Header styled with CRIDM Visual Identity */}
      <header className="border-b border-[#dce3e8] bg-white sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Official CRIDM Logo */}
            <img
              src="./logo-cridm.png"
              onError={(e) => {
                e.currentTarget.src = 'https://cridm.edu.pl/wp-content/uploads/2019/05/logo-02.png';
              }}
              alt="CRIDM - Center for Research on Improving Decision Making"
              className="h-11 w-11 object-contain shrink-0 drop-shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-[#344b57] tracking-tight">
                  Similarity Measure δ(n) Simulator
                </h1>
                <a
                  href="https://cridm.edu.pl/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#ef9421] hover:text-[#d87f13] bg-[#fff8ee] border border-[#fcd9a8] px-2 py-0.5 rounded transition-colors"
                >
                  <span>cridm.edu.pl</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <p className="text-xs text-[#617986] mt-0.5">
                Center for Research on Improving Decision Making · SWPS University
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg bg-[#f0f4f7] p-1 border border-[#dce3e8] text-xs font-medium">
              <button
                onClick={() => setActiveSection('simulator')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  activeSection === 'simulator'
                    ? 'bg-[#ef9421] text-white shadow-xs font-semibold'
                    : 'text-[#344b57] hover:text-[#1c2a31] hover:bg-white/60'
                }`}
              >
                δ(n) Simulation
              </button>
              <button
                onClick={() => setActiveSection('table')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  activeSection === 'table'
                    ? 'bg-[#344b57] text-white shadow-xs font-semibold'
                    : 'text-[#344b57] hover:text-[#1c2a31] hover:bg-white/60'
                }`}
              >
                18 Empirical Decision Gambles (R Pipeline)
              </button>
              <button
                onClick={() => setActiveSection('readme')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                  activeSection === 'readme'
                    ? 'bg-[#344b57] text-white shadow-xs font-semibold'
                    : 'text-[#344b57] hover:text-[#1c2a31] hover:bg-white/60'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-[#ef9421]" />
                <span>README &amp; Guide</span>
              </button>
            </div>

            <button
              onClick={() => {
                const csv = exportSimilarityMeasureCSV(rResult.rows);
                downloadCSV('Similarity_measure.csv', csv);
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#344b57] bg-[#f0f4f7] hover:bg-[#e4ebf0] border border-[#dce3e8] rounded-md transition-colors"
              title="Download Similarity_measure.csv"
            >
              <Download className="w-3.5 h-3.5 text-[#ef9421]" />
              <span>CSV</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 mt-6">
        {activeSection === 'simulator' ? (
          <div className="space-y-6">
            {/* The Formula Card with CRIDM Palette & Embedded Paper Equation PNG */}
            <div className="bg-white border border-[#dce3e8] rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-[#f0f4f7]">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-[#fff8ee] text-[#ef9421] border border-[#fcd9a8] rounded-lg shrink-0 mt-0.5">
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xs uppercase font-mono tracking-wider font-bold text-[#617986]">
                        Equation · Similarity Measure δ(n)
                      </h2>
                    </div>
                    <p className="text-xs text-[#617986] mt-1 leading-relaxed">
                      Quantifies the similarity between the sample distribution generated during exploration and the true distribution by tracking the diminishing relative change between successive sample means μ(n) and μ(n−1).
                    </p>
                  </div>
                </div>

                {/* Threshold Indicators in CRIDM Colors */}
                <div className="flex flex-wrap items-center gap-2 text-xs shrink-0 font-mono">
                  <div className="px-3 py-1.5 bg-[#f0f4f7] border border-[#dce3e8] rounded-lg text-[#344b57]">
                    <span className="block text-[10px] uppercase font-sans font-semibold text-[#617986]">Low Similarity</span>
                    <span className="font-bold text-sm">70% (δ ≥ 0.70)</span>
                  </div>
                  <div className="px-3 py-1.5 bg-[#eaf0f3] border border-[#c6d5dd] rounded-lg text-[#344b57]">
                    <span className="block text-[10px] uppercase font-sans font-semibold text-[#344b57]">Moderate Similarity</span>
                    <span className="font-bold text-sm">80% (δ ≥ 0.80)</span>
                  </div>
                  <div className="px-3 py-1.5 bg-[#fff8ee] border border-[#fcd9a8] rounded-lg text-[#d87f13]">
                    <span className="block text-[10px] uppercase font-sans font-bold text-[#ef9421]">High Similarity</span>
                    <span className="font-bold text-sm text-[#ef9421]">90% (δ ≥ 0.90)</span>
                  </div>
                </div>
              </div>

              {/* Equation Visual Banner with embedded PNG */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-[#f8fafb] border border-[#dce3e8] rounded-lg p-3 sm:p-4">
                <div className="md:col-span-7 flex flex-col items-center justify-center bg-white border border-[#dce3e8] rounded-md p-3 shadow-2xs">
                  <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-[#617986] self-start mb-1">
                    Formal Piecewise Formulation (From Paper)
                  </span>
                  <img
                    src="./assets/aistudio/image_adbfa6d0.png"
                    alt="Equation: Piecewise definition of Similarity Measure δ(n)"
                    className="max-h-24 sm:max-h-28 w-auto object-contain my-1"
                  />
                </div>

                <div className="md:col-span-5 text-xs text-[#344b57] space-y-2">
                  <div className="font-semibold text-xs text-[#344b57] flex items-center gap-1.5">
                    <span>Deliberation Proxy &amp; Epistemic Uncertainty Reduction</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-[#617986] font-sans">
                    <li className="flex items-start gap-1.5">
                      <span className="font-mono font-bold text-[#ef9421] shrink-0">•</span>
                      <span><strong className="text-[#344b57] font-mono">Convergence to True EV:</strong> As sampling increases, the difference between successive means |μ(n) − μ(n−1)| decreases, reflecting convergence of the sample mean toward the true Expected Value.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="font-mono font-bold text-[#ef9421] shrink-0">•</span>
                      <span><strong className="text-[#344b57] font-mono">Epistemic Uncertainty:</strong> In DfE, participants sample to overcome unfamiliarity with payoff distributions without computing formal variances. δ(n) quantifies this learning process.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="font-mono font-bold text-[#ef9421] shrink-0">•</span>
                      <span><strong className="text-[#344b57] font-mono">Problem-Specific Criterion:</strong> Calibrates sampling limits to gamble uncertainty (e.g. 15 vs 10 samples for 90% similarity) across Low (70%), Moderate (80%), and High (90%) conditions.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Decision Environment Selector & Exploration Controls */}
            <div className="bg-white border border-[#dce3e8] rounded-xl p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3.5 border-b border-[#f0f4f7]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#344b57]">Decision Environment:</span>
                  <div className="inline-flex rounded-lg bg-[#f0f4f7] p-0.5 border border-[#dce3e8] text-xs">
                    <button
                      onClick={() => setPreset('fig1')}
                      className={`px-2.5 py-1 rounded transition-colors ${
                        preset === 'fig1'
                          ? 'bg-[#344b57] text-white font-semibold shadow-xs'
                          : 'text-[#617986] hover:text-[#344b57]'
                      }`}
                    >
                      Figure 1 Benchmark (15 vs 10 Samples for 90% Similarity)
                    </button>
                    <button
                      onClick={() => setPreset('table3')}
                      className={`px-2.5 py-1 rounded transition-colors ${
                        preset === 'table3'
                          ? 'bg-[#344b57] text-white font-semibold shadow-xs'
                          : 'text-[#617986] hover:text-[#344b57]'
                      }`}
                    >
                      18 Empirical Decision Gambles (From Paper)
                    </button>
                    <button
                      onClick={() => setPreset('custom')}
                      className={`px-2.5 py-1 rounded transition-colors ${
                        preset === 'custom'
                          ? 'bg-[#344b57] text-white font-semibold shadow-xs'
                          : 'text-[#617986] hover:text-[#344b57]'
                      }`}
                    >
                      Custom Gamble
                    </button>
                  </div>
                </div>

                {/* Target Option Selector */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[#617986]">Exploration Target:</span>
                  <button
                    onClick={() => {
                      setTargetOption('low');
                      resetSimulation();
                    }}
                    className={`px-3 py-1.5 rounded font-medium border transition-colors ${
                      targetOption === 'low'
                        ? 'bg-[#344b57] border-[#344b57] text-white font-semibold'
                        : 'bg-white border-[#dce3e8] text-[#344b57] hover:bg-[#f0f4f7]'
                    }`}
                  >
                    Option A ({activeGamble.low.prob * 100}%, outcome {activeGamble.low.outcome > 0 ? `+${activeGamble.low.outcome}` : activeGamble.low.outcome})
                  </button>
                  <button
                    onClick={() => {
                      setTargetOption('high');
                      resetSimulation();
                    }}
                    className={`px-3 py-1.5 rounded font-medium border transition-colors ${
                      targetOption === 'high'
                        ? 'bg-[#ef9421] border-[#ef9421] text-white font-semibold'
                        : 'bg-white border-[#dce3e8] text-[#344b57] hover:bg-[#fff8ee]'
                    }`}
                  >
                    Option B ({activeGamble.high.prob * 100}%, outcome {activeGamble.high.outcome > 0 ? `+${activeGamble.high.outcome}` : activeGamble.high.outcome})
                  </button>
                </div>
              </div>

              {/* Sub-controls based on preset */}
              {preset === 'table3' && (
                <div className="pt-3.5 flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="text-xs font-semibold text-[#344b57] shrink-0">
                    Select Experimental Choice Problem (9 Gain / 9 Loss Problems):
                  </label>
                  <select
                    value={selectedProblemIndex}
                    onChange={(e) => {
                      setSelectedProblemIndex(Number(e.target.value));
                      resetSimulation();
                    }}
                    className="w-full text-xs font-mono bg-[#f0f4f7] border border-[#dce3e8] rounded-md px-3 py-2 text-[#313131] focus:ring-2 focus:ring-[#ef9421] focus:outline-hidden"
                  >
                    {TABLE_3_CHOICE_PROBLEMS.map((p, idx) => (
                      <option key={p.id} value={idx}>
                        Problem {p.problemNumber} [{p.domain} Domain]: Option A [{p.optionA.outcome1 > 0 ? `+${p.optionA.outcome1}` : p.optionA.outcome1} ({p.optionA.prob1 * 100}%)] vs Option B [{p.optionB.outcome1 > 0 ? `+${p.optionB.outcome1}` : p.optionB.outcome1} ({p.optionB.prob1 * 100}%)] · {p.deliberation} Similarity Condition (Req: A={p.explorationA}, B={p.explorationB}, Total={p.totalExploration})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {preset === 'custom' && (
                <div className="pt-3.5 space-y-4">
                  {/* Sub-mode selector */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#f0f4f7] p-1.5 rounded-lg border border-[#dce3e8]">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setCustomSubMode('batch');
                          resetSimulation();
                        }}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                          customSubMode === 'batch'
                            ? 'bg-[#ef9421] text-white shadow-xs'
                            : 'text-[#344b57] hover:text-[#1c2a31]'
                        }`}
                      >
                        Replication CSV Batch Tool (3 Similarity Conditions)
                      </button>
                      <button
                        onClick={() => {
                          setCustomSubMode('single');
                          resetSimulation();
                        }}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                          customSubMode === 'single'
                            ? 'bg-[#344b57] text-white shadow-xs'
                            : 'text-[#344b57] hover:text-[#1c2a31]'
                        }`}
                      >
                        Quick Single Gamble
                      </button>
                    </div>

                    <div className="text-[11px] text-[#617986] font-mono pr-2">
                      {customSubMode === 'batch' ? `${batchProblems.length} custom problems loaded` : 'Quick exploration testing'}
                    </div>
                  </div>

                  {/* Mode 1: Single Gamble Inputs */}
                  {customSubMode === 'single' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#f8fafb] p-3.5 rounded-lg border border-[#dce3e8]">
                      <div>
                        <label className="block text-xs font-medium text-[#344b57] mb-1">Win Outcome (pts):</label>
                        <input
                          type="number"
                          value={outcomeVal}
                          onChange={(e) => {
                            setOutcomeVal(Number(e.target.value));
                            resetSimulation();
                          }}
                          className="w-full text-xs font-mono bg-white border border-[#dce3e8] rounded px-2.5 py-1.5 focus:ring-2 focus:ring-[#ef9421] focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#344b57] mb-1">Win Probability (0.05 to 0.95):</label>
                        <input
                          type="number"
                          min="0.05"
                          max="0.95"
                          step="0.05"
                          value={outcomeProb}
                          onChange={(e) => {
                            setOutcomeProb(Number(e.target.value));
                            resetSimulation();
                          }}
                          className="w-full text-xs font-mono bg-white border border-[#dce3e8] rounded px-2.5 py-1.5 focus:ring-2 focus:ring-[#ef9421] focus:outline-hidden"
                        />
                      </div>
                    </div>
                  )}

                  {/* Mode 2: Batch CSV Tool */}
                  {customSubMode === 'batch' && (
                    <div className="space-y-3 bg-[#f8fafb] p-3.5 rounded-lg border border-[#dce3e8]">
                      {/* Action Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#e4ebf0]">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Hidden file input */}
                          <input
                            type="file"
                            ref={fileInputRef}
                            accept=".csv,text/csv"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const text = event.target?.result as string;
                                if (text) {
                                  const parsed = parseChoiceProblemsCSV(text);
                                  if (parsed.length > 0) {
                                    setBatchProblems(parsed);
                                    setActiveBatchId(parsed[0].id);
                                    setUploadStatus(`Calculated sample limits for ${parsed.length} problems!`);
                                    resetSimulation();
                                  } else {
                                    setUploadStatus('No valid gamble rows found in CSV. Please verify column headers.');
                                  }
                                }
                              };
                              reader.readAsText(file);
                              e.target.value = '';
                            }}
                            className="hidden"
                          />

                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#ef9421] hover:bg-[#d87f13] rounded-md shadow-xs transition-colors"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Choice Problems CSV</span>
                          </button>

                          <button
                            onClick={() => downloadCSV('choice_problems_template.csv', getChoiceProblemsCSVTemplate())}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#344b57] bg-white hover:bg-[#f0f4f7] border border-[#dce3e8] rounded-md transition-colors"
                            title="Download pre-formatted CSV template"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#617986]" />
                            <span>Download CSV Template</span>
                          </button>

                          <button
                            onClick={() => {
                              const exampleProblems = parseChoiceProblemsCSV(getChoiceProblemsCSVTemplate());
                              setBatchProblems(exampleProblems);
                              setActiveBatchId(exampleProblems[0].id);
                              setUploadStatus('Loaded 6 example replication problems with generated limits!');
                              resetSimulation();
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#344b57] bg-white hover:bg-[#f0f4f7] border border-[#dce3e8] rounded-md transition-colors"
                            title="Load 6 pre-configured research problems"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-[#ef9421]" />
                            <span>Load 6 Examples</span>
                          </button>
                        </div>

                        {batchProblems.length > 0 && (
                          <button
                            onClick={() => {
                              const csv = exportCalculatedLimitsCSV(batchProblems);
                              downloadCSV('Custom_Gambles_Sample_Limits.csv', csv);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#344b57] hover:bg-[#273842] rounded-md shadow-xs transition-colors"
                            title="Download table with all calculated sample limits"
                          >
                            <Download className="w-3.5 h-3.5 text-[#ef9421]" />
                            <span>Download Calculated Limits CSV</span>
                          </button>
                        )}
                      </div>

                      {/* Status / feedback message */}
                      {uploadStatus && (
                        <div className="text-xs text-[#344b57] font-medium flex items-center justify-between bg-[#fff8ee] border border-[#fcd9a8] px-3 py-1.5 rounded">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#ef9421]" />
                            <span>{uploadStatus}</span>
                          </div>
                          <button onClick={() => setUploadStatus(null)} className="text-[#617986] hover:text-[#313131] text-[10px]">✕</button>
                        </div>
                      )}

                      {/* Problem Quick Selector */}
                      {activeBatchProblem && (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 bg-white rounded border border-[#dce3e8] text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#344b57]">Currently Simulating in Graph:</span>
                            <span className="font-mono font-bold text-[#ef9421] bg-[#fff8ee] px-2 py-0.5 rounded border border-[#fcd9a8]">
                              {activeBatchProblem.id}
                            </span>
                            <span className="text-[#617986]">
                              A: [{activeBatchProblem.optionA.outcome1} ({activeBatchProblem.optionA.prob1 * 100}%)] vs B: [{activeBatchProblem.optionB.outcome1} ({activeBatchProblem.optionB.prob1 * 100}%)]
                            </span>
                          </div>

                          <div className="font-mono text-[11px] text-[#344b57]">
                            Sample Limits: <span className="text-[#708a98]">Low={activeBatchProblem.totalLow}</span> · <span className="text-[#344b57]">Mod={activeBatchProblem.totalMod}</span> · <span className="text-[#ef9421] font-bold">High={activeBatchProblem.totalHigh}</span>
                          </div>
                        </div>
                      )}

                      {/* Batch Calculated Limits Table */}
                      <div className="overflow-x-auto max-h-64 rounded border border-[#dce3e8] bg-white">
                        <table className="w-full text-xs text-left font-mono border-collapse">
                          <thead className="sticky top-0 bg-[#f0f4f7] text-[#344b57] border-b border-[#dce3e8] text-[10px] uppercase">
                            <tr>
                              <th className="py-2 px-2.5">ID</th>
                              <th className="py-2 px-2.5">Domain</th>
                              <th className="py-2 px-2.5">Option A</th>
                              <th className="py-2 px-2.5">Option B</th>
                              <th className="py-2 px-2.5 text-center text-[#708a98]">Low (70%)</th>
                              <th className="py-2 px-2.5 text-center text-[#344b57]">Mod (80%)</th>
                              <th className="py-2 px-2.5 text-center text-[#ef9421] font-bold">High (90%)</th>
                              <th className="py-2 px-2.5 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#f0f4f7]">
                            {batchProblems.map((prob) => {
                              const isActive = activeBatchId === prob.id;
                              return (
                                <tr
                                  key={prob.id}
                                  className={`transition-colors ${isActive ? 'bg-[#fff8ee]' : 'hover:bg-[#f8fafb]'}`}
                                >
                                  <td className="py-2 px-2.5 font-bold text-[#344b57]">{prob.id}</td>
                                  <td className="py-2 px-2.5 font-sans">
                                    <span className={prob.domain === 'Gain' ? 'text-emerald-700' : 'text-rose-700'}>
                                      {prob.domain}
                                    </span>
                                  </td>
                                  <td className="py-2 px-2.5 text-[#313131]">
                                    {prob.optionA.outcome1} ({prob.optionA.prob1 * 100}%)
                                    <span className="text-[#8fa3af] text-[10px] block">EV={prob.evA.toFixed(1)}</span>
                                  </td>
                                  <td className="py-2 px-2.5 text-[#313131]">
                                    {prob.optionB.outcome1} ({prob.optionB.prob1 * 100}%)
                                    <span className="text-[#8fa3af] text-[10px] block">EV={prob.evB.toFixed(1)}</span>
                                  </td>
                                  <td className="py-2 px-2.5 text-center font-mono">
                                    <span className="text-[#344b57] font-semibold">{prob.lowLimitA} + {prob.lowLimitB}</span>
                                    <span className="text-[#708a98] text-[10px] block font-bold">Total: {prob.totalLow}</span>
                                  </td>
                                  <td className="py-2 px-2.5 text-center font-mono">
                                    <span className="text-[#344b57] font-semibold">{prob.modLimitA} + {prob.modLimitB}</span>
                                    <span className="text-[#344b57] text-[10px] block font-bold">Total: {prob.totalMod}</span>
                                  </td>
                                  <td className="py-2 px-2.5 text-center font-mono">
                                    <span className="text-[#d87f13] font-bold">{prob.highLimitA} + {prob.highLimitB}</span>
                                    <span className="text-[#ef9421] text-[10px] block font-extrabold">Total: {prob.totalHigh}</span>
                                  </td>
                                  <td className="py-2 px-2.5 text-center">
                                    <button
                                      onClick={() => {
                                        setActiveBatchId(prob.id);
                                        resetSimulation();
                                      }}
                                      className={`px-2 py-1 text-[11px] font-sans font-medium rounded transition-colors ${
                                        isActive
                                          ? 'bg-[#ef9421] text-white font-bold'
                                          : 'bg-[#f0f4f7] hover:bg-[#e4ebf0] text-[#344b57] border border-[#dce3e8]'
                                      }`}
                                    >
                                      {isActive ? 'Active' : 'Simulate'}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons styled with CRIDM Orange & Slate */}
              <div className="pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#f0f4f7] mt-3.5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={addSingleDraw}
                    disabled={isPlaying || currentN >= 35}
                    className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-semibold text-white bg-[#ef9421] hover:bg-[#d87f13] disabled:opacity-50 rounded-md shadow-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+1 Draw</span>
                  </button>

                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    disabled={currentN >= 35}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md text-white transition-colors ${
                      isPlaying
                        ? 'bg-[#d87f13] hover:bg-[#bf6f0f]'
                        : 'bg-[#344b57] hover:bg-[#273842]'
                    } disabled:opacity-50 shadow-xs`}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isPlaying ? 'Pause' : 'Stream Draws (350ms)'}</span>
                  </button>

                  <button
                    onClick={() => addBulkDraws(10)}
                    disabled={isPlaying || currentN >= 35}
                    className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-medium text-[#344b57] bg-[#f0f4f7] hover:bg-[#e4ebf0] border border-[#dce3e8] disabled:opacity-50 rounded-md transition-colors"
                  >
                    <FastForward className="w-3.5 h-3.5 text-[#ef9421]" />
                    <span>+10 Draws</span>
                  </button>

                  <button
                    onClick={resetSimulation}
                    className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-[#617986] hover:text-[#344b57] transition-colors"
                    title="Reset simulation"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </div>

                <div className="text-xs font-mono text-[#617986]">
                  Target Expected Value: <strong className="text-[#344b57] font-bold">{trueEV.toFixed(1)} pts</strong>
                </div>
              </div>
            </div>

            {/* Live Metrics Dashboard */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="bg-white border border-[#dce3e8] rounded-xl p-3.5 shadow-xs">
                <span className="text-[10px] text-[#617986] uppercase font-mono block">Sample Count</span>
                <span className="text-2xl font-bold font-mono text-[#344b57]">{currentN}</span>
                <span className="text-[10px] text-[#8fa3af] block">draws</span>
              </div>

              <div className="bg-white border border-[#dce3e8] rounded-xl p-3.5 shadow-xs">
                <span className="text-[10px] text-[#617986] uppercase font-mono block">Latest Draw</span>
                <span className={`text-2xl font-bold font-mono ${latestDraw && latestDraw.outcome > 0 ? 'text-[#ef9421]' : 'text-[#8fa3af]'}`}>
                  {latestDraw ? (latestDraw.outcome > 0 ? `+${latestDraw.outcome}` : '0') : '—'}
                </span>
                <span className="text-[10px] text-[#8fa3af] block">points</span>
              </div>

              <div className="bg-white border border-[#dce3e8] rounded-xl p-3.5 shadow-xs">
                <span className="text-[10px] text-[#617986] uppercase font-mono block">Sample Mean μ(n)</span>
                <span className="text-2xl font-bold font-mono text-[#344b57]">
                  {latestDraw ? currentMean.toFixed(2) : '0.00'}
                </span>
                <span className="text-[10px] text-[#8fa3af] block">vs EV {trueEV.toFixed(1)}</span>
              </div>

              <div className="bg-[#fff8ee] border border-[#fcd9a8] rounded-xl p-3.5 shadow-xs col-span-2 sm:col-span-2">
                <span className="text-[10px] text-[#ef9421] uppercase font-mono font-bold block">
                  Similarity Measure δ(n)
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-bold font-mono text-[#d87f13]">
                    {latestDraw ? `${(currentSim * 100).toFixed(1)}%` : '—'}
                  </span>
                  <span className="text-xs text-[#617986] font-mono">
                    (δ = {latestDraw ? currentSim.toFixed(3) : '0.000'})
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-[10px] font-mono">
                  <span className={reachedLowAt ? 'text-[#344b57] font-bold' : 'text-[#8fa3af]'}>
                    70%: {reachedLowAt ? `n=${reachedLowAt}` : 'pending'}
                  </span>
                  <span>·</span>
                  <span className={reachedModAt ? 'text-[#344b57] font-bold' : 'text-[#8fa3af]'}>
                    80%: {reachedModAt ? `n=${reachedModAt}` : 'pending'}
                  </span>
                  <span>·</span>
                  <span className={reachedHighAt ? 'text-[#ef9421] font-bold' : 'text-[#8fa3af]'}>
                    90%: {reachedHighAt ? `n=${reachedHighAt}` : 'pending'}
                  </span>
                </div>
              </div>
            </div>

            {/* The Similarity Chart (Figure 1 in paper) with CRIDM Palette */}
            <div className="bg-white border border-[#dce3e8] rounded-xl p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-2 border-b border-[#f0f4f7]">
                <div>
                  <h3 className="text-sm font-bold text-[#344b57]">
                    Figure 1: Similarity Measure δ(n) as a Function of Sample Size
                  </h3>
                  <p className="text-xs text-[#617986]">
                    Comparing convergence between Low Uncertainty (<span className="text-[#344b57] font-semibold">p=0.60</span>) and High Uncertainty (<span className="text-[#ef9421] font-semibold">p=0.30</span>)
                  </p>
                </div>
                <div className="text-xs font-mono text-[#617986] bg-[#f0f4f7] px-2 py-0.5 rounded border border-[#dce3e8]">
                  Paper Benchmark: δ(10) = 0.90 vs. 0.84
                </div>
              </div>

              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={theoreticalChartData} margin={{ top: 10, right: 25, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f7" />
                    <XAxis
                      dataKey="n"
                      label={{ value: 'Number of samples (n)', position: 'insideBottom', offset: -4, fontSize: 11, fill: '#617986' }}
                      tick={{ fontSize: 11, fill: '#617986' }}
                    />
                    <YAxis
                      domain={[0.4, 1.0]}
                      ticks={[0.4, 0.5, 0.6, 0.7, 0.8, 0.84, 0.9, 1.0]}
                      label={{ value: 'Similarity δ(n)', angle: -90, position: 'insideLeft', offset: 15, fontSize: 11, fill: '#617986' }}
                      tick={{ fontSize: 11, fill: '#617986' }}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-[#22323a] text-white p-2.5 rounded-lg text-xs font-mono shadow-md border border-[#344b57]">
                              <div className="font-bold border-b border-slate-700 pb-1 mb-1 text-slate-200">
                                Sample Count: n = {label}
                              </div>
                              <div className="text-sky-300">Low Uncertainty Expected: {payload[0]?.value}</div>
                              <div className="text-[#ef9421] font-medium">High Uncertainty Expected: {payload[1]?.value}</div>
                              {payload[2]?.value !== undefined && payload[2]?.value !== null && (
                                <div className="text-emerald-400 font-bold mt-1 pt-1 border-t border-slate-700">
                                  Your Current Run: {payload[2]?.value}
                                </div>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }} />

                    {/* Similarity Condition Thresholds in CRIDM Brand Colors */}
                    <ReferenceLine y={0.90} stroke="#ef9421" strokeDasharray="3 3" strokeWidth={1.5} label={{ value: 'High Similarity (90%)', position: 'insideTopRight', fill: '#d87f13', fontSize: 10 }} />
                    <ReferenceLine y={0.80} stroke="#344b57" strokeDasharray="3 3" strokeWidth={1.5} label={{ value: 'Moderate Similarity (80%)', position: 'insideTopRight', fill: '#344b57', fontSize: 10 }} />
                    <ReferenceLine y={0.70} stroke="#708a98" strokeDasharray="3 3" strokeWidth={1.5} label={{ value: 'Low Similarity (70%)', position: 'insideTopRight', fill: '#708a98', fontSize: 10 }} />
                    <ReferenceLine x={10} stroke="#b0c0c8" strokeDasharray="2 2" strokeWidth={1} label={{ value: 'n = 10', position: 'insideBottomRight', fill: '#617986', fontSize: 10 }} />

                    {/* Theoretical curves from paper Figure 1 */}
                    <Line type="monotone" dataKey="lowExpected" name="Low Uncertainty (p = 0.60)" stroke="#344b57" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="highExpected" name="High Uncertainty (p = 0.30)" stroke="#ef9421" strokeWidth={2.5} dot={false} />

                    {/* Live user trial */}
                    {draws.length > 0 && (
                      <Line type="monotone" dataKey="liveSimilarity" name="Live Draw Trace" stroke="#00d084" strokeWidth={3} dot={{ r: 3, fill: '#00d084' }} />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : activeSection === 'table' ? (
          /* SECTION 2: R SCRIPT SIMILARITY CONDITION TABLE & HISTOGRAM */
          <div className="space-y-6">
            <div className="bg-white border border-[#dce3e8] rounded-xl p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#f0f4f7]">
                <div>
                  <h3 className="text-base font-bold text-[#344b57]">
                    Experimental Decision Gambles: Similarity Condition Sampling Limits &amp; nsample Distribution
                  </h3>
                  <p className="text-xs text-[#617986] mt-0.5">
                    Reproducing the paper's R pipeline: <code className="font-mono text-[#ef9421] font-semibold">ggplot(Similarity_measure, aes(x = nsample, fill = Deliberation)) + geom_histogram()</code>
                  </p>
                </div>

                <button
                  onClick={() => {
                    const csv = exportSimilarityMeasureCSV(rResult.rows);
                    downloadCSV('Similarity_measure.csv', csv);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#ef9421] hover:bg-[#d87f13] rounded-md shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Similarity_measure.csv</span>
                </button>
              </div>

              {/* Tally Metrics in CRIDM Colors */}
              <div className="grid grid-cols-3 gap-3 my-4">
                <div className="p-3.5 bg-[#f0f4f7] border border-[#dce3e8] rounded-lg">
                  <span className="text-[10px] text-[#617986] uppercase font-mono font-semibold block">Low Similarity (70%)</span>
                  <span className="text-xl font-bold font-mono text-[#344b57]">n = {rResult.summary.totalLow}</span>
                  <span className="text-[11px] text-[#617986] block">Mean sample: {rResult.summary.meanNsampleLow} draws</span>
                </div>
                <div className="p-3.5 bg-[#e4ebf0] border border-[#c6d5dd] rounded-lg">
                  <span className="text-[10px] text-[#344b57] uppercase font-mono font-semibold block">Moderate Similarity (80%)</span>
                  <span className="text-xl font-bold font-mono text-[#344b57]">n = {rResult.summary.totalMod}</span>
                  <span className="text-[11px] text-[#344b57] block">Mean sample: {rResult.summary.meanNsampleMod} draws</span>
                </div>
                <div className="p-3.5 bg-[#fff8ee] border border-[#fcd9a8] rounded-lg">
                  <span className="text-[10px] text-[#ef9421] uppercase font-mono font-bold block">High Similarity (90%)</span>
                  <span className="text-xl font-bold font-mono text-[#d87f13]">n = {rResult.summary.totalHigh}</span>
                  <span className="text-[11px] text-[#617986] block">Mean sample: {rResult.summary.meanNsampleHigh} draws</span>
                </div>
              </div>

              {/* ggplot2 Histogram with CRIDM Palette */}
              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={histogramData} margin={{ top: 10, right: 25, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f7" />
                    <XAxis
                      dataKey="nsample"
                      label={{ value: 'Total exploration samples (nsample = Similarity_A + Similarity_B)', position: 'insideBottom', offset: -4, fontSize: 11, fill: '#617986' }}
                      tick={{ fontSize: 11, fill: '#617986' }}
                    />
                    <YAxis
                      allowDecimals={false}
                      label={{ value: 'Count of Choice Problems', angle: -90, position: 'insideLeft', offset: 15, fontSize: 11, fill: '#617986' }}
                      tick={{ fontSize: 11, fill: '#617986' }}
                    />
                    <Tooltip />
                    <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '11px', paddingBottom: '6px' }} />
                    <Bar dataKey="Low" name="Low Similarity (70%)" fill="#708a98" stackId="a" />
                    <Bar dataKey="Moderate" name="Moderate Similarity (80%)" fill="#344b57" stackId="a" />
                    <Bar dataKey="High" name="High Similarity (90%)" fill="#ef9421" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Complete Dataframe Table */}
            <div className="bg-white border border-[#dce3e8] rounded-xl p-5 shadow-xs">
              <div className="mb-3">
                <h4 className="text-sm font-bold text-[#344b57]">
                  18 Empirical Choice Problems: Required Sample Sizes (Similarity_A, Similarity_B) &amp; Total Exploration (nsample)
                </h4>
                <p className="text-xs text-[#617986] mt-0.5">
                  Grounded in Table 3 of the paper. Required exploration samples were determined by how many draws each gamble took to cross its assigned similarity threshold (δ ≥ 0.70, 0.80, or 0.90).
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left font-mono border-collapse">
                  <thead>
                    <tr className="bg-[#f0f4f7] text-[#344b57] border-b border-[#dce3e8] uppercase text-[10px]">
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Gamble .id</th>
                      <th className="py-2.5 px-3">Domain</th>
                      <th className="py-2.5 px-3">Similarity Condition</th>
                      <th className="py-2.5 px-3 text-right">Option A Draws (Similarity_A)</th>
                      <th className="py-2.5 px-3 text-right">Option B Draws (Similarity_B)</th>
                      <th className="py-2.5 px-3 text-right font-bold text-[#344b57]">Total Draws (nsample)</th>
                      <th className="py-2.5 px-3 text-right">EV(A)</th>
                      <th className="py-2.5 px-3 text-right">EV(B)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0f4f7]">
                    {rResult.rows.map((row) => (
                      <tr key={row.id} className="hover:bg-[#f8fafb]">
                        <td className="py-2 px-3 text-[#8fa3af]">{row.rowNum}</td>
                        <td className="py-2 px-3 font-semibold text-[#344b57]">{row.id}</td>
                        <td className="py-2 px-3 font-sans">
                          <span className={row.domain === 'Gain' ? 'text-emerald-700 font-medium' : 'text-rose-700 font-medium'}>
                            {row.domain}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-sans font-medium">
                          <span className={
                            row.deliberation === 'High' ? 'text-[#ef9421] font-bold' : row.deliberation === 'Moderate' ? 'text-[#344b57] font-semibold' : 'text-[#708a98]'
                          }>
                            {row.deliberation}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right text-[#313131]">{row.similarityA}</td>
                        <td className="py-2 px-3 text-right text-[#313131]">{row.similarityB}</td>
                        <td className="py-2 px-3 text-right font-bold text-[#344b57] bg-[#f0f4f7]/50">
                          {row.nsample}
                        </td>
                        <td className="py-2 px-3 text-right text-[#617986]">{row.evA?.toFixed(2)}</td>
                        <td className="py-2 px-3 text-right text-[#617986]">{row.evB?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* SECTION 3: README & USER GUIDE */
          <ReadmeTab
            onGoToSimulator={() => setActiveSection('simulator')}
            onGoToRTable={() => setActiveSection('table')}
          />
        )}
      </main>
    </div>
  );
}
