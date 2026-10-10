import React, { useState } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { EnvironmentalCopilot } from '../copilot/EnvironmentalCopilot';
import { CITIES_DATA } from '../../data/mockAirQualityData';
import { Bot, Sparkles } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const cityParam = searchParams.get('city') || 'tokyo';

  const activeCity =
    CITIES_DATA.find((c) => c.id.toLowerCase() === cityParam.toLowerCase()) ||
    CITIES_DATA[0];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 relative">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>
      <Footer />

      {/* Floating Global Environmental Copilot Launcher */}
      <button
        onClick={() => setCopilotOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-slate-900 hover:bg-emerald-600 text-white shadow-2xl border border-slate-700/80 transition-all hover:scale-105 active:scale-95 group"
        title="Open AI Environmental Copilot"
        aria-label="Open AI Environmental Copilot"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
        </span>
        <Bot className="w-4 h-4 text-emerald-400 group-hover:text-white transition-colors" />
        <span className="text-xs font-bold tracking-tight">AI Copilot</span>
        <Sparkles className="w-3 h-3 text-cyan-400 opacity-70" />
      </button>

      {/* Global Environmental Copilot Modal */}
      <EnvironmentalCopilot
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        city={activeCity}
      />
    </div>
  );
};
