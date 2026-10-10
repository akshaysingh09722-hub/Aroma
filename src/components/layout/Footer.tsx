import React from 'react';
import { Link } from 'react-router-dom';
import { Wind, Shield, Database, Cpu, Compass } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 text-white">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold">
                <Wind className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-white">
                AeroSense <span className="text-emerald-400">AI</span>
              </span>
            </Link>
            <p className="text-slate-400 text-xs leading-relaxed">
              Intelligent air-quality monitoring, spatiotemporal forecasting, and multi-city environmental health analytics.
            </p>
            <div className="pt-1 text-[11px] text-slate-500 font-mono">
              Phase 1 Frontend Foundation • v0.1.0-alpha
            </div>
          </div>

          {/* Quick Nav */}
          <div>
            <h4 className="text-slate-200 font-semibold uppercase tracking-wider text-[11px] mb-3">
              Platform Pages
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-emerald-400 transition-colors">
                  Home Landing
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-emerald-400 transition-colors">
                  Air Quality Dashboard
                </Link>
              </li>
              <li>
                <Link to="/forecast" className="hover:text-emerald-400 transition-colors">
                  AI Forecast Engine
                </Link>
              </li>
              <li>
                <Link to="/cities" className="hover:text-emerald-400 transition-colors">
                  Global City Explorer
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-emerald-400 transition-colors">
                  Methodology & Architecture
                </Link>
              </li>
            </ul>
          </div>

          {/* Team Roles */}
          <div>
            <h4 className="text-slate-200 font-semibold uppercase tracking-wider text-[11px] mb-3">
              Team Modules
            </h4>
            <ul className="space-y-2 text-[11px]">
              <li className="flex items-center gap-1.5 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Member 1: UI/UX & Frontend</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>Member 2: Backend API Services</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                <span>Member 3: AI/ML Forecasting</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Member 4: Spatial/3D Prototypes</span>
              </li>
            </ul>
          </div>

          {/* Attributions & Science */}
          <div>
            <h4 className="text-slate-200 font-semibold uppercase tracking-wider text-[11px] mb-3">
              Data & Standards
            </h4>
            <p className="text-slate-400 text-xs leading-relaxed mb-3">
              Calibrated to US EPA AQI breakpoints and WHO Global Air Quality Guidelines.
            </p>
            <div className="flex flex-wrap gap-2 text-[10px] text-slate-400 font-mono">
              <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">OpenAQ</span>
              <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">Copernicus</span>
              <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">EPA AirNow</span>
            </div>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>© 2026 AeroSense AI. Hackathon Development Foundation.</p>
          <p className="text-center sm:text-right">
            Sample data active for UI prototyping. Not for medical diagnosis or life-safety critical operations.
          </p>
        </div>
      </div>
    </footer>
  );
};
