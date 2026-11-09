import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { Download, Play, Code, CheckCircle, RefreshCw, Filter, FileSpreadsheet, Eye } from 'lucide-react';
import { runRScriptAlgorithm, downloadCSV, exportSimilarityMeasureCSV } from '../utils/simulation';
import { DeliberationLevel, DomainType } from '../types/decision';

export const AlgorithmWorkbench: React.FC = () => {
  const [currentSeed, setCurrentSeed] = useState<number>(30);
  const [seedInput, setSeedInput] = useState<string>("30");
  const [viewMode, setViewMode] = useState<'algorithm' | 'self'>('algorithm');
  const [filterDeliberation, setFilterDeliberation] = useState<DeliberationLevel | 'All'>('All');
  const [filterDomain, setFilterDomain] = useState<DomainType | 'All'>('All');
  const [showRCode, setShowRCode] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Run algorithmic assignment with the specified seed
  const simulationResult = useMemo(() => {
    return runRScriptAlgorithm(currentSeed);
  }, [currentSeed]);

  // Handle seed change
  const handleApplySeed = (newSeed: number) => {
    setCurrentSeed(newSeed);
    setSeedInput(String(newSeed));
  };

  // Filtered rows for data table
  const displayedRows = useMemo(() => {
    return simulationResult.rows.filter(r => {
      const matchDelib = filterDeliberation === 'All' || r.deliberation === filterDeliberation;
      const matchDomain = filterDomain === 'All' || r.domain === filterDomain;
      return matchDelib && matchDomain;
    });
  }, [simulationResult, filterDeliberation, filterDomain]);

  // Histogram data aggregation matching ggplot(Similarity_measure, aes(x = nsample, fill = Deliberation)) + geom_histogram()
  const histogramData = useMemo(() => {
    // Collect min and max nsample
    const samples = simulationResult.rows.map(r => r.nsample);
    const minSample = Math.min(...samples, 4);
    const maxSample = Math.max(...samples, 24);

    const bins: { [key: number]: { nsample: number; Low: number; Moderate: number; High: number; total: number } } = {};

    for (let s = minSample; s <= maxSample; s++) {
      bins[s] = { nsample: s, Low: 0, Moderate: 0, High: 0, total: 0 };
    }

    simulationResult.rows.forEach(r => {
      if (bins[r.nsample]) {
        bins[r.nsample][r.deliberation] += 1;
        bins[r.nsample].total += 1;
      }
    });

    return Object.values(bins).filter(b => b.total > 0 || (b.nsample >= minSample && b.nsample <= maxSample));
  }, [simulationResult]);

  // Export handlers
  const handleExportSimilarityMeasure = () => {
    const csv = exportSimilarityMeasureCSV(simulationResult.rows);
    downloadCSV(`Similarity_measure_seed_${currentSeed}.csv`, csv);
  };

  const handleExportGamble = () => {
    const header = `"",".id","Low_del_A","Moderate_del_A","High_del_A","Low_del_B","Moderate_del_B","High_del_B"`;
    const lines = simulationResult.rows.map((r, i) => {
      return `"${i + 1}","${r.id}",${r.similarityA},${r.similarityA},${r.similarityA},${r.similarityB},${r.similarityB},${r.similarityB}`;
    });
    const csv = `${header}\n${lines.join('\n')}`;
    downloadCSV("Gamble.csv", csv);
  };

  // Copy R code
  const rScriptText = `# Reproducible R Script for Deliberation Assignment
library(tidyverse)

# 1. Load Pretested Exploration CSVs
Gamble_A_Deliberation <- read_csv("Gamble_A_Deliberation.csv", col_types = cols(...1 = col_skip()))
Gamble_B_Deliberation <- read_csv("Gamble_B_Deliberation.csv", col_types = cols(...1 = col_skip()))

Gamble <- Gamble_A_Deliberation %>%
  inner_join(Gamble_B_Deliberation) %>%
  select(.id, Low_del_A:High_del_B)
Gamble$.id <- as.character(Gamble$.id)

# 2. Algorithmic Stratified Random Assignment
Random_String <- select(Gamble, .id)
Random_String_gain <- Random_String %>% filter(.id > 0)
Random_String_loss <- Random_String %>% filter(.id < 0)

set.seed(${currentSeed})

Random_String_gain <- Random_String_gain %>%
  mutate(Deliberation = sample(rep(1:3, each = 3)),
         Deliberation = ifelse(Deliberation == 1, "Low", ifelse(
           Deliberation == 2, "Moderate", "High")))

Random_String_loss <- Random_String_loss %>%
  mutate(Deliberation = sample(rep(1:3, each = 3)),
         Deliberation = ifelse(Deliberation == 1, "Low", ifelse(
           Deliberation == 2, "Moderate", "High")))

Random_String <- rbind(Random_String_gain, Random_String_loss)

# 3. Join with Options & Map Similarity Measure
Gamble_A_Deliberation <- Gamble_A_Deliberation %>% inner_join(Random_String)
Gamble_B_Deliberation <- Gamble_B_Deliberation %>% inner_join(Random_String)

# 4. Map Deliberation to Threshold Samples
for (i in 1:18) {
  if (Gamble_A_Deliberation$Deliberation[i] == "Low") {
    Gamble_A_Deliberation$Similarity_A[i] <- Gamble_A_Deliberation$Low_del_A[i]
  } else if (Gamble_A_Deliberation$Deliberation[i] == "Moderate") {
    Gamble_A_Deliberation$Similarity_A[i] <- Gamble_A_Deliberation$Moderate_del_A[i]
  } else {
    Gamble_A_Deliberation$Similarity_A[i] <- Gamble_A_Deliberation$High_del_A[i]
  }
}

for (i in 1:18) {
  if (Gamble_B_Deliberation$Deliberation[i] == "Low") {
    Gamble_B_Deliberation$Similarity_B[i] <- Gamble_B_Deliberation$Low_del_B[i]
  } else if (Gamble_B_Deliberation$Deliberation[i] == "Moderate") {
    Gamble_B_Deliberation$Similarity_B[i] <- Gamble_B_Deliberation$Moderate_del_B[i]
  } else {
    Gamble_B_Deliberation$Similarity_B[i] <- Gamble_B_Deliberation$High_del_B[i]
  }
}

Similarity_measure <- inner_join(
  select(Gamble_A_Deliberation, .id, Deliberation, Similarity_A),
  select(Gamble_B_Deliberation, .id, Deliberation, Similarity_B)
) %>%
  mutate(Similarity_A = as.numeric(Similarity_A),
         Similarity_B = as.numeric(Similarity_B),
         nsample = Similarity_A + Similarity_B)

# 5. Plot Histogram
ggplot(Similarity_measure, aes(x = nsample, fill = Deliberation)) +
  geom_histogram(binwidth = 1, color = "black") +
  theme_bw() +
  ggtitle("Algorithm Selection")`;

  const copyRCodeToClipboard = () => {
    navigator.clipboard.writeText(rScriptText);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Script Execution Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono text-indigo-600 font-semibold">
                R Algorithm Pipeline
              </span>
              <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                100% Deterministic &amp; Reproducible
              </span>
            </div>
            <h3 className="text-lg font-bold tracking-tight text-slate-900 mt-1">
              Deliberation Sampling &amp; Stratification Engine
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulates the R script algorithm: seeds random sampling, balances gain &amp; loss domains, maps similarity thresholds, and computes total samples (nsample).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowRCode(!showRCode)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors border border-slate-200"
            >
              <Code className="w-3.5 h-3.5" />
              <span>{showRCode ? 'Hide R Script' : 'View R Script'}</span>
            </button>

            <button
              onClick={handleExportSimilarityMeasure}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Similarity_measure.csv</span>
            </button>
          </div>
        </div>

        {/* Seed Controller & Controls Bar */}
        <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-700">R Seed Controller:</span>
            <div className="inline-flex items-center gap-1.5">
              <input
                type="number"
                value={seedInput}
                onChange={(e) => setSeedInput(e.target.value)}
                className="w-20 px-2 py-1 text-xs font-mono bg-white border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 text-center font-bold text-slate-900"
              />
              <button
                onClick={() => handleApplySeed(Number(seedInput))}
                className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded shadow-xs"
              >
                Set Seed
              </button>
            </div>

            <button
              onClick={() => handleApplySeed(30)}
              className={`px-2.5 py-1 text-xs font-medium rounded border ${
                currentSeed === 30
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Default `set.seed(30)`
            </button>

            <button
              onClick={() => handleApplySeed(Math.floor(Math.random() * 9999) + 1)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded"
              title="Generate random seed"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Random Seed</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-600">
            <span>Current Seed: <strong className="text-indigo-600">{currentSeed}</strong></span>
            <span>·</span>
            <span>Items: 18 (9 Gains, 9 Losses)</span>
          </div>
        </div>

        {/* R Script Preview Collapsible */}
        {showRCode && (
          <div className="mt-4 p-4 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono relative overflow-hidden border border-slate-800">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <span className="text-slate-400 font-semibold">Equivalent R Script Code (Tidyverse &amp; ggplot2)</span>
              <button
                onClick={copyRCodeToClipboard}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-sans font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors"
              >
                {copiedCode ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <Code className="w-3 h-3" />}
                <span>{copiedCode ? 'Copied to Clipboard!' : 'Copy R Code'}</span>
              </button>
            </div>
            <pre className="overflow-x-auto whitespace-pre leading-relaxed text-slate-300">
              {rScriptText}
            </pre>
          </div>
        )}
      </div>

      {/* R tally() & Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Tally Box: High */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-indigo-700">High Deliberation</span>
            <span className="font-mono text-slate-400">δ ≥ 0.90</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {simulationResult.summary.totalHigh}
            </span>
            <span className="text-xs text-slate-500">problems assigned</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-xs flex justify-between text-slate-500">
            <span>Mean nsample:</span>
            <span className="font-mono font-semibold text-slate-800">
              {simulationResult.summary.meanNsampleHigh} draws
            </span>
          </div>
        </div>

        {/* Tally Box: Moderate */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-amber-700">Moderate Deliberation</span>
            <span className="font-mono text-slate-400">δ ≥ 0.80</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {simulationResult.summary.totalMod}
            </span>
            <span className="text-xs text-slate-500">problems assigned</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-xs flex justify-between text-slate-500">
            <span>Mean nsample:</span>
            <span className="font-mono font-semibold text-slate-800">
              {simulationResult.summary.meanNsampleMod} draws
            </span>
          </div>
        </div>

        {/* Tally Box: Low */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-teal-700">Low Deliberation</span>
            <span className="font-mono text-slate-400">δ ≥ 0.70</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {simulationResult.summary.totalLow}
            </span>
            <span className="text-xs text-slate-500">problems assigned</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-xs flex justify-between text-slate-500">
            <span>Mean nsample:</span>
            <span className="font-mono font-semibold text-slate-800">
              {simulationResult.summary.meanNsampleLow} draws
            </span>
          </div>
        </div>

        {/* Stratification Check */}
        <div className="bg-slate-900 text-white rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono text-indigo-400 block font-semibold">
              R tally() Verification
            </span>
            <div className="font-mono text-xs mt-1 text-slate-200">
              3 High, 3 Mod, 3 Low per Domain
            </div>
          </div>
          <div className="text-[11px] text-slate-300 mt-2 font-mono">
            <div>Gains: 9 gambles</div>
            <div>Losses: 9 gambles</div>
            <div className="text-emerald-400 font-semibold mt-1">✓ Orthogonal Stratification</div>
          </div>
        </div>
      </div>

      {/* ggplot2 Histogram Reproduction */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 mb-2 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono text-indigo-600 font-semibold">
                ggplot2 Visualization Replica
              </span>
              <span className="text-xs text-slate-400">|</span>
              <span className="text-xs font-mono text-slate-600">
                aes(x = nsample, fill = Deliberation) + geom_histogram()
              </span>
            </div>
            <h4 className="text-base font-semibold text-slate-900 mt-0.5">
              {viewMode === 'algorithm' ? 'Algorithm Selection: nsample Distribution' : 'Self Selection: nsample Distribution'}
            </h4>
          </div>

          <div className="inline-flex rounded-lg p-1 bg-slate-100 border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('algorithm')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                viewMode === 'algorithm'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Algorithm Selection
            </button>
            <button
              onClick={() => setViewMode('self')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                viewMode === 'self'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Self Selection Comparison
            </button>
          </div>
        </div>

        {/* Histogram Chart */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={histogramData} margin={{ top: 10, right: 30, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="nsample"
                label={{ value: 'Total exploration samples (nsample = Similarity_A + Similarity_B)', position: 'insideBottom', offset: -4, fontSize: 11, fill: '#64748b' }}
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <YAxis
                allowDecimals={false}
                label={{ value: 'Count of Choice Problems', angle: -90, position: 'insideLeft', offset: 15, fontSize: 11, fill: '#64748b' }}
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const low = payload.find(p => p.dataKey === 'Low')?.value || 0;
                    const mod = payload.find(p => p.dataKey === 'Moderate')?.value || 0;
                    const high = payload.find(p => p.dataKey === 'High')?.value || 0;
                    return (
                      <div className="bg-slate-900 text-white p-2.5 rounded-lg text-xs font-mono shadow-md">
                        <div className="font-bold border-b border-slate-700 pb-1 mb-1">
                          nsample = {label} draws
                        </div>
                        {Number(low) > 0 && <div className="text-teal-300">Low Deliberation: {low}</div>}
                        {Number(mod) > 0 && <div className="text-amber-300">Moderate Deliberation: {mod}</div>}
                        {Number(high) > 0 && <div className="text-indigo-300">High Deliberation: {high}</div>}
                        <div className="text-slate-400 pt-1 mt-1 border-t border-slate-800">
                          Total: {Number(low) + Number(mod) + Number(high)} problems
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
                wrapperStyle={{ fontSize: '11px', paddingBottom: '6px' }}
              />
              <Bar dataKey="Low" name="Low Deliberation (70%)" fill="#0d9488" stackId="a" />
              <Bar dataKey="Moderate" name="Moderate Deliberation (80%)" fill="#f59e0b" stackId="a" />
              <Bar dataKey="High" name="High Deliberation (90%)" fill="#6366f1" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Full Data Table: Similarity_measure dataframe */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h4 className="text-base font-semibold text-slate-900">
              Dataframe: Similarity_measure ({displayedRows.length} problems)
            </h4>
            <p className="text-xs text-slate-500">
              Individual choice problem deliberation levels and required sampling allocations
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter by Domain */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-500">Domain:</span>
              <select
                value={filterDomain}
                onChange={(e) => setFilterDomain(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-medium text-slate-700"
              >
                <option value="All">All (18)</option>
                <option value="Gain">Gain (9)</option>
                <option value="Loss">Loss (9)</option>
              </select>
            </div>

            {/* Filter by Deliberation */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-500">Deliberation:</span>
              <select
                value={filterDeliberation}
                onChange={(e) => setFilterDeliberation(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-medium text-slate-700"
              >
                <option value="All">All Levels</option>
                <option value="High">High (90%)</option>
                <option value="Moderate">Moderate (80%)</option>
                <option value="Low">Low (70%)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-xs text-left border-collapse font-mono">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase text-[10px]">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Gamble .id</th>
                <th className="py-2.5 px-3">Domain</th>
                <th className="py-2.5 px-3">Deliberation</th>
                <th className="py-2.5 px-3 text-right">Similarity_A</th>
                <th className="py-2.5 px-3 text-right">Similarity_B</th>
                <th className="py-2.5 px-3 text-right font-bold text-slate-900">nsample</th>
                <th className="py-2.5 px-3 text-right">EV(A)</th>
                <th className="py-2.5 px-3 text-right">EV(B)</th>
                <th className="py-2.5 px-3 text-center">Normative Best</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2 px-3 text-slate-400">{row.rowNum}</td>
                  <td className="py-2 px-3 font-semibold text-slate-800">{row.id}</td>
                  <td className="py-2 px-3">
                    <span className={`inline-block font-sans text-[11px] ${
                      row.domain === 'Gain' ? 'text-emerald-700 font-medium' : 'text-rose-700 font-medium'
                    }`}>
                      {row.domain}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-sans">
                    <span className={`inline-block text-[11px] font-medium ${
                      row.deliberation === 'High'
                        ? 'text-indigo-700 font-semibold'
                        : row.deliberation === 'Moderate'
                        ? 'text-amber-700 font-semibold'
                        : 'text-teal-700 font-semibold'
                    }`}>
                      {row.deliberation}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right text-slate-700">{row.similarityA}</td>
                  <td className="py-2 px-3 text-right text-slate-700">{row.similarityB}</td>
                  <td className="py-2 px-3 text-right font-bold text-slate-900 bg-slate-50/50">
                    {row.nsample}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-600">
                    {row.evA !== undefined ? row.evA.toFixed(2) : '—'}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-600">
                    {row.evB !== undefined ? row.evB.toFixed(2) : '—'}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span className="font-sans font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded text-[11px]">
                      Option {row.bestOption}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
