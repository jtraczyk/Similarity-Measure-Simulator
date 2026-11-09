import React from 'react';
import { Activity, Play, BarChart3, BookOpen, Sliders, Database, Download } from 'lucide-react';

export type ActiveTab = 'simulator' | 'algorithm' | 'empirical' | 'experiment' | 'ftt' | 'custom';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onExportCurrentData?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onExportCurrentData }) => {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  Deliberation & Similarity Measure Simulator
                </h1>
                <span className="text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200/60 rounded px-2 py-0.5">
                  Mondal & Traczyk (SWPS)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Simulating δ(n) exploration, algorithmic deliberation sampling, and Fuzzy Trace Theory interventions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onExportCurrentData && (
              <button
                onClick={onExportCurrentData}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors border border-slate-200"
                title="Download generated research datasets as CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSVs</span>
              </button>
            )}
            <div className="text-right hidden sm:block pl-2 border-l border-slate-200 text-xs text-slate-400">
              <div className="font-mono text-slate-700">18 Problems · N = 600</div>
              <div>Table 3 &amp; R Code v4.5.2</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 overflow-x-auto pb-2 scrollbar-none border-t border-slate-100 pt-2">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'simulator'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Similarity Measure δ(n)</span>
          </button>

          <button
            onClick={() => setActiveTab('algorithm')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'algorithm'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>R Script &amp; Algorithm Workbench</span>
          </button>

          <button
            onClick={() => setActiveTab('empirical')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'empirical'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Empirical Findings (Studies 1–3)</span>
          </button>

          <button
            onClick={() => setActiveTab('experiment')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'experiment'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Interactive DfE Task</span>
          </button>

          <button
            onClick={() => setActiveTab('ftt')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'ftt'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Fuzzy Trace Theory &amp; Numeracy</span>
          </button>

          <button
            onClick={() => setActiveTab('custom')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'custom'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Custom Gamble Simulator</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
