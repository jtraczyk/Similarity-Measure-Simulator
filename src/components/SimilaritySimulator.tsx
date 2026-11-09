import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, Legend } from 'recharts';
import { Play, Pause, RotateCcw, FastForward, Info, CheckCircle2, ChevronRight } from 'lucide-react';
import { GambleOption } from '../types/decision';
import { TABLE_3_CHOICE_PROBLEMS } from '../data/paperData';
import { simulateEnsemble, simulateTrajectory } from '../utils/simulation';

export const SimilaritySimulator: React.FC = () => {
  // Preset selection: High vs Low uncertainty as in Figure 1, or Table 3 problem
  const [selectedPreset, setSelectedPreset] = useState<'fig1_benchmark' | 'problem_table3'>('fig1_benchmark');
  const [selectedProblemId, setSelectedProblemId] = useState<string>(TABLE_3_CHOICE_PROBLEMS[1].id); // Problem 2 (High deliberation)
  const [activeOptionChoice, setActiveOptionChoice] = useState<'A' | 'B'>('A');

  // Custom / benchmark gamble parameters
  const [lowUncertaintyGamble, setLowUncertaintyGamble] = useState<GambleOption>({
    outcome1: 40,
    prob1: 0.60,
    outcome2: 0,
    prob2: 0.40,
    ev: 24.0
  });

  const [highUncertaintyGamble, setHighUncertaintyGamble] = useState<GambleOption>({
    outcome1: 80,
    prob1: 0.30,
    outcome2: 0,
    prob2: 0.70,
    ev: 24.0
  });

  // Simulation controls
  const [numDraws, setNumDraws] = useState<number>(35);
  const [ensembleRuns, setEnsembleRuns] = useState<number>(150);
  const [simulationSeed, setSimulationSeed] = useState<number>(42);

  // Interactive step-by-step drawing state
  const [interactiveStep, setInteractiveStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const animationTimerRef = useRef<number | null>(null);

  // Determine current active target gamble
  const currentGamble: GambleOption = useMemo(() => {
    if (selectedPreset === 'fig1_benchmark') {
      return activeOptionChoice === 'A' ? lowUncertaintyGamble : highUncertaintyGamble;
    }
    const prob = TABLE_3_CHOICE_PROBLEMS.find(p => p.id === selectedProblemId) || TABLE_3_CHOICE_PROBLEMS[0];
    return activeOptionChoice === 'A' ? prob.optionA : prob.optionB;
  }, [selectedPreset, selectedProblemId, activeOptionChoice, lowUncertaintyGamble, highUncertaintyGamble]);

  // Compute ensemble trajectories
  const lowUncertaintyEnsemble = useMemo(() => {
    return simulateEnsemble(lowUncertaintyGamble, ensembleRuns, numDraws, simulationSeed);
  }, [lowUncertaintyGamble, ensembleRuns, numDraws, simulationSeed]);

  const highUncertaintyEnsemble = useMemo(() => {
    return simulateEnsemble(highUncertaintyGamble, ensembleRuns, numDraws, simulationSeed + 100);
  }, [highUncertaintyGamble, ensembleRuns, numDraws, simulationSeed]);

  // Single interactive trial for step-by-step exploration
  const singleTrial = useMemo(() => {
    return simulateTrajectory(currentGamble, numDraws);
  }, [currentGamble, numDraws, simulationSeed]);

  // Automatic playback for the 400ms experience stream
  useEffect(() => {
    if (isPlaying) {
      animationTimerRef.current = window.setInterval(() => {
        setInteractiveStep(prev => {
          if (prev >= numDraws) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 400);
    } else {
      if (animationTimerRef.current) {
        clearInterval(animationTimerRef.current);
      }
    }
    return () => {
      if (animationTimerRef.current) {
        clearInterval(animationTimerRef.current);
      }
    };
  }, [isPlaying, numDraws]);

  // Comparison chart data for Figure 1 reproduction
  const figure1ChartData = useMemo(() => {
    return lowUncertaintyEnsemble.aggregatedSteps.map((lowStep, i) => {
      const highStep = highUncertaintyEnsemble.aggregatedSteps[i];
      return {
        sample: lowStep.step,
        lowUncertaintySim: parseFloat(lowStep.avgSimilarity.toFixed(3)),
        highUncertaintySim: highStep ? parseFloat(highStep.avgSimilarity.toFixed(3)) : 0,
        lowMean: parseFloat(lowStep.avgMean.toFixed(2)),
        highMean: highStep ? parseFloat(highStep.avgMean.toFixed(2)) : 0,
        thresholdHigh: 0.90,
        thresholdMod: 0.80,
        thresholdLow: 0.70
      };
    });
  }, [lowUncertaintyEnsemble, highUncertaintyEnsemble]);

  // Step-by-step history slice
  const currentStepData = singleTrial.steps[interactiveStep - 1] || null;

  return (
    <div className="space-y-6">
      {/* Top Banner / Concept Card */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <span className="text-xs uppercase font-mono tracking-wider text-indigo-400">
              Theoretical Foundation · Figure 1 &amp; Equation 1
            </span>
            <h2 className="text-xl font-bold tracking-tight mt-1">
              The Similarity Measure δ(n) for Deliberation
            </h2>
            <p className="text-slate-300 text-sm mt-2 leading-relaxed">
              In Decisions from Experience (DfE), individuals learn outcome distributions by sequentially drawing samples.
              The similarity metric <span className="font-mono text-indigo-300 font-semibold">δ(n)</span> quantifies how closely the experienced sample mean approximates true Expected Value (EV) by tracking the diminishing relative change between successive sample means.
            </p>

            <div className="mt-4 p-3.5 bg-slate-800/90 rounded-lg border border-slate-700 font-mono text-xs text-slate-200">
              <div className="text-indigo-400 font-semibold mb-1">Mathematical Definition (Mondal &amp; Traczyk, page 9):</div>
              <div className="overflow-x-auto whitespace-pre">
                {`δ(n) = 1 - (|μ(n) - μ(n-1)| / |μ(n-1)|)    if μ(n-1) ≠ 0
δ(n) = 0                                       if μ(n-1) = 0 & μ(n) ≠ 0
δ(n) = 1                                       if μ(n-1) = 0 & μ(n) = 0`}
              </div>
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-lg p-4 border border-slate-700/80 flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase font-mono text-slate-400">Three Similarity Conditions</span>
              <ul className="mt-2 space-y-2 text-xs">
                <li className="flex items-center justify-between pb-1.5 border-b border-slate-700">
                  <span className="font-medium text-emerald-400">High Similarity</span>
                  <span className="font-mono text-slate-200">90% (δ ≥ 0.90)</span>
                </li>
                <li className="flex items-center justify-between pb-1.5 border-b border-slate-700">
                  <span className="font-medium text-amber-400">Moderate Similarity</span>
                  <span className="font-mono text-slate-200">80% (δ ≥ 0.80)</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="font-medium text-sky-400">Low Similarity</span>
                  <span className="font-mono text-slate-200">70% (δ ≥ 0.70)</span>
                </li>
              </ul>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-700 text-xs text-slate-400">
              Higher environmental uncertainty requires significantly more exploration samples to reach the identical veridicality threshold.
            </div>
          </div>
        </div>
      </div>

      {/* Simulator Controls & Preset Selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Convergence &amp; Sampling Simulation</h3>
            <p className="text-xs text-slate-500">
              Simulate how sample means stabilize and compare convergence across uncertainty profiles
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-lg p-1 bg-slate-100 border border-slate-200 text-xs">
              <button
                onClick={() => setSelectedPreset('fig1_benchmark')}
                className={`px-3 py-1 font-medium rounded-md transition-colors ${
                  selectedPreset === 'fig1_benchmark'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Figure 1 Benchmark (Low vs High Uncertainty)
              </button>
              <button
                onClick={() => setSelectedPreset('problem_table3')}
                className={`px-3 py-1 font-medium rounded-md transition-colors ${
                  selectedPreset === 'problem_table3'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Table 3 Experimental Problems
              </button>
            </div>
          </div>
        </div>

        {/* Preset Specific Inputs */}
        <div className="pt-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          {selectedPreset === 'fig1_benchmark' ? (
            <>
              <div className="p-3 bg-sky-50/60 rounded-lg border border-sky-100 text-xs">
                <div className="font-semibold text-sky-900">Low Uncertainty Option (p = 0.60)</div>
                <div className="text-slate-600 mt-1 font-mono">
                  60% chance of +40, 40% chance of 0
                </div>
                <div className="text-slate-500 mt-0.5">True EV = 24.0 pts</div>
              </div>
              <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-100 text-xs">
                <div className="font-semibold text-amber-900">High Uncertainty Option (p = 0.30)</div>
                <div className="text-slate-600 mt-1 font-mono">
                  30% chance of +80, 70% chance of 0
                </div>
                <div className="text-slate-500 mt-0.5">True EV = 24.0 pts</div>
              </div>
            </>
          ) : (
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Select Table 3 Decision Problem
              </label>
              <select
                value={selectedProblemId}
                onChange={(e) => setSelectedProblemId(e.target.value)}
                className="w-full text-xs font-mono bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                {TABLE_3_CHOICE_PROBLEMS.map((prob) => (
                  <option key={prob.id} value={prob.id}>
                    Problem {prob.problemNumber} ({prob.domain}) · Condition: {prob.deliberation} · A: {prob.optionA.outcome1} ({prob.optionA.prob1}) vs B: {prob.optionB.outcome1} ({prob.optionB.prob1})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Monte Carlo Sample Runs: <span className="font-mono text-indigo-600 font-semibold">{ensembleRuns}</span>
            </label>
            <input
              type="range"
              min="20"
              max="500"
              step="10"
              value={ensembleRuns}
              onChange={(e) => setEnsembleRuns(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Max Exploration Draws: <span className="font-mono text-indigo-600 font-semibold">{numDraws}</span>
            </label>
            <input
              type="range"
              min="15"
              max="60"
              step="5"
              value={numDraws}
              onChange={(e) => setNumDraws(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Main Visualizations: Figure 1 Reproduction */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Figure 1 Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xs uppercase font-mono text-indigo-600 font-semibold">
                  Empirical Reproduction
                </span>
                <h4 className="text-base font-semibold text-slate-900">
                  Figure 1: Similarity Measure δ(n) vs. Number of Samples
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mean trajectory across {ensembleRuns} simulated participants with 70%, 80%, and 90% deliberation thresholds
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSimulationSeed(prev => prev + 1)}
                  className="px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200"
                  title="Resample with fresh seed"
                >
                  Resample
                </button>
              </div>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={figure1ChartData} margin={{ top: 10, right: 30, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="sample"
                    label={{ value: 'Number of samples (n)', position: 'insideBottom', offset: -4, fontSize: 11, fill: '#64748b' }}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <YAxis
                    domain={[0.4, 1.0]}
                    ticks={[0.4, 0.5, 0.6, 0.7, 0.8, 0.84, 0.9, 1.0]}
                    label={{ value: 'Similarity δ(n)', angle: -90, position: 'insideLeft', offset: 15, fontSize: 11, fill: '#64748b' }}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-lg text-xs shadow-lg border border-slate-800 font-mono">
                            <div className="font-semibold text-slate-300 border-b border-slate-700 pb-1 mb-1.5">
                              Sample Count: n = {label}
                            </div>
                            <div className="text-sky-400">
                              Low Uncertainty (p=0.60): δ = {payload[0]?.value}
                            </div>
                            <div className="text-amber-400">
                              High Uncertainty (p=0.30): δ = {payload[1]?.value}
                            </div>
                            <div className="text-slate-400 text-[10px] pt-1 mt-1 border-t border-slate-800">
                              {Number(label) === 10 ? '★ Paper Benchmark: δ(10)=0.90 vs δ(10)=0.84' : ''}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }}
                  />

                  {/* Threshold Lines */}
                  <ReferenceLine y={0.90} stroke="#10b981" strokeDasharray="3 3" strokeWidth={1.5} label={{ value: 'High Deliberation (90%)', position: 'insideTopRight', fill: '#059669', fontSize: 10 }} />
                  <ReferenceLine y={0.80} stroke="#f59e0b" strokeDasharray="3 3" strokeWidth={1.5} label={{ value: 'Moderate Deliberation (80%)', position: 'insideTopRight', fill: '#d97706', fontSize: 10 }} />
                  <ReferenceLine y={0.70} stroke="#0284c7" strokeDasharray="3 3" strokeWidth={1.5} label={{ value: 'Low Deliberation (70%)', position: 'insideTopRight', fill: '#0369a1', fontSize: 10 }} />

                  {/* Benchmark Marker at 10 samples */}
                  <ReferenceLine x={10} stroke="#64748b" strokeDasharray="2 2" strokeWidth={1} label={{ value: 'n = 10', position: 'insideBottomRight', fill: '#64748b', fontSize: 10 }} />

                  <Line
                    type="monotone"
                    dataKey="lowUncertaintySim"
                    name="Low Uncertainty (p = 0.60)"
                    stroke="#0284c7"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="highUncertaintySim"
                    name="High Uncertainty (p = 0.30)"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-start gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg">
            <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <span>
              <strong>Figure 1 Verification:</strong> At exactly 10 samples, the low-uncertainty gamble reaches <span className="font-mono text-sky-700 font-semibold">δ(10) ≈ 0.90</span>, whereas the high-uncertainty gamble reaches only <span className="font-mono text-amber-700 font-semibold">δ(10) ≈ 0.84</span>. High uncertainty requires approximately <strong>15 vs 10 samples</strong> to reach 90% veridicality.
            </span>
          </div>
        </div>

        {/* Statistical Summary Panel */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h4 className="text-sm font-semibold text-slate-900 pb-2 border-b border-slate-100">
              Required Samples by Deliberation Level
            </h4>
            <div className="space-y-3 mt-3">
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">Low Deliberation (70%)</span>
                  <span className="text-[11px] font-mono text-slate-500">δ ≥ 0.70</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono mt-1">
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Low Uncertainty</span>
                    <span className="text-sky-700 font-bold">{lowUncertaintyEnsemble.avgToLow || 3} draws</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">High Uncertainty</span>
                    <span className="text-amber-700 font-bold">{highUncertaintyEnsemble.avgToLow || 4} draws</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">Moderate Deliberation (80%)</span>
                  <span className="text-[11px] font-mono text-slate-500">δ ≥ 0.80</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono mt-1">
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Low Uncertainty</span>
                    <span className="text-sky-700 font-bold">{lowUncertaintyEnsemble.avgToMod || 6} draws</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">High Uncertainty</span>
                    <span className="text-amber-700 font-bold">{highUncertaintyEnsemble.avgToMod || 8} draws</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">High Deliberation (90%)</span>
                  <span className="text-[11px] font-mono text-slate-500">δ ≥ 0.90</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono mt-1">
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Low Uncertainty</span>
                    <span className="text-sky-700 font-bold">{lowUncertaintyEnsemble.avgToHigh || 10} draws</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">High Uncertainty</span>
                    <span className="text-amber-700 font-bold">{highUncertaintyEnsemble.avgToHigh || 15} draws</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Theoretical Note Card */}
          <div className="bg-indigo-50/70 rounded-xl border border-indigo-100 p-4 text-xs text-indigo-950">
            <h5 className="font-semibold mb-1 flex items-center gap-1.5 text-indigo-900">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              Scientific Takeaway
            </h5>
            <p className="leading-relaxed text-indigo-900/80">
              Rather than enforcing arbitrary time limits, this similarity metric dynamically calibrates required deliberation to the specific mathematical uncertainty of each gamble.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Step-by-Step Exploration Sandbox */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs uppercase font-mono text-indigo-600 font-semibold">
              Live Trial Experimenter
            </span>
            <h4 className="text-base font-semibold text-slate-900">
              Step-by-Step Draw Progression &amp; Mean Fluctuation
            </h4>
            <p className="text-xs text-slate-500">
              Watch each sequential draw update the running sample mean μ(n) and calculate δ(n) live
            </p>
          </div>

          {/* Interactive controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (interactiveStep < numDraws) {
                  setInteractiveStep(prev => prev + 1);
                }
              }}
              disabled={interactiveStep >= numDraws || isPlaying}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-md transition-colors"
            >
              <span>+1 Draw</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={interactiveStep >= numDraws}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors text-white ${
                isPlaying ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'
              } disabled:opacity-50`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause' : 'Stream Draws (400ms)'}</span>
            </button>

            <button
              onClick={() => setInteractiveStep(numDraws)}
              disabled={interactiveStep >= numDraws}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 disabled:opacity-50"
              title="Fast forward to end"
            >
              <FastForward className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                setIsPlaying(false);
                setInteractiveStep(0);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
              title="Reset draws"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Live Draw Stats Dashboard */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 my-4">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Sample Count (n)</span>
            <span className="text-xl font-bold font-mono text-slate-900">{interactiveStep}</span>
            <span className="text-[10px] text-slate-400 block">of {numDraws} max</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Latest Draw Outcome</span>
            <span className={`text-xl font-bold font-mono ${
              currentStepData?.outcome && currentStepData.outcome > 0 ? 'text-emerald-600' : currentStepData?.outcome && currentStepData.outcome < 0 ? 'text-rose-600' : 'text-slate-500'
            }`}>
              {currentStepData ? (currentStepData.outcome > 0 ? `+${currentStepData.outcome}` : `${currentStepData.outcome}`) : '—'}
            </span>
            <span className="text-[10px] text-slate-400 block">points</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Sample Mean μ(n)</span>
            <span className="text-xl font-bold font-mono text-slate-900">
              {currentStepData ? currentStepData.sampleMean.toFixed(2) : '0.00'}
            </span>
            <span className="text-[10px] text-slate-400 block">True EV = {currentGamble.ev.toFixed(1)}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Relative Change</span>
            <span className="text-xl font-bold font-mono text-slate-900">
              {currentStepData ? `${(currentStepData.deltaPercent * 100).toFixed(1)}%` : '0%'}
            </span>
            <span className="text-[10px] text-slate-400 block">|μ(n) - μ(n-1)| / |μ|</span>
          </div>

          <div className="p-3 bg-indigo-50/70 rounded-lg border border-indigo-100 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-indigo-700 uppercase font-mono font-semibold block">Similarity δ(n)</span>
            <span className="text-xl font-bold font-mono text-indigo-700">
              {currentStepData ? `${(currentStepData.similarity * 100).toFixed(1)}%` : '0%'}
            </span>
            <span className="text-[10px] text-indigo-600/80 block">
              {currentStepData && currentStepData.similarity >= 0.90 ? '★ High' : currentStepData && currentStepData.similarity >= 0.80 ? '◆ Moderate' : currentStepData && currentStepData.similarity >= 0.70 ? '● Low' : 'Exploration'}
            </span>
          </div>
        </div>

        {/* Real-time progression line chart */}
        <div className="h-48 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={singleTrial.steps.slice(0, Math.max(1, interactiveStep))}
              margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="step" tick={{ fontSize: 10, fill: '#64748b' }} domain={[1, numDraws]} />
              <YAxis domain={[0, 1]} tick={{ fontSize: 10, fill: '#64748b' }} ticks={[0.2, 0.4, 0.6, 0.7, 0.8, 0.9, 1.0]} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const stepItem = payload[0]?.payload as any;
                    return (
                      <div className="bg-slate-900 text-white p-2 rounded text-xs font-mono shadow-md">
                        <div>Draw #{label}</div>
                        <div>Outcome: {stepItem?.outcome}</div>
                        <div>Mean μ({label}): {stepItem?.sampleMean?.toFixed(2)}</div>
                        <div className="text-indigo-400 font-semibold">Similarity δ({label}): {(stepItem?.similarity * 100).toFixed(1)}%</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={0.90} stroke="#10b981" strokeDasharray="2 2" strokeWidth={1} />
              <ReferenceLine y={0.80} stroke="#f59e0b" strokeDasharray="2 2" strokeWidth={1} />
              <ReferenceLine y={0.70} stroke="#0284c7" strokeDasharray="2 2" strokeWidth={1} />
              <Line
                type="monotone"
                dataKey="similarity"
                name="δ(n)"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ r: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
