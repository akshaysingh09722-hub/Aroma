import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  Wind,
  LayoutDashboard,
  TrendingUp,
  MapPin,
  Info,
  Menu,
  X,
  Boxes,
  Database,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import { api, DataSourceMode } from '../../services/api';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dataMode, setDataMode] = useState<DataSourceMode>(api.getMode());
  const location = useLocation();

  useEffect(() => {
    return api.subscribeModeChange(setDataMode);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleDataMode = () => {
    const next = dataMode === 'mock' ? 'live' : 'mock';
    api.setMode(next);
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: Wind },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/forecast', label: 'Forecast', icon: TrendingUp },
    { to: '/cities', label: 'City Explorer', icon: MapPin },
    { to: '/experience-3d', label: '3D Simulation', icon: Boxes },
    { to: '/scenario-lab', label: 'Scenario Lab', icon: SlidersHorizontal },
    { to: '/about', label: 'About', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Wind className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-slate-900">
                AeroSense
              </span>
              <span className="font-extrabold text-lg text-emerald-600">AI</span>
            </div>
            <p className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase -mt-1 hidden sm:block">
              Environmental Intelligence
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right side controls: Mode Pill & Mobile Toggle */}
        <div className="flex items-center gap-2.5">
          {/* Data Mode Switcher Pill */}
          <button
            onClick={toggleDataMode}
            title={`Currently in ${dataMode.toUpperCase()} mode. Click to toggle.`}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              dataMode === 'mock'
                ? 'bg-amber-50 text-amber-800 border-amber-200/80 hover:bg-amber-100/70'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200/80 hover:bg-emerald-100/70'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span className="uppercase text-[10px] tracking-wider font-bold">
              {dataMode === 'mock' ? 'Demo Data' : 'Live API'}
            </span>
            <Sparkles className="w-3 h-3 text-cyan-600 opacity-60" />
          </button>

          {/* Quick Dashboard Action on desktop */}
          <Link
            to="/dashboard"
            className="hidden lg:inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-sm transition-all"
          >
            Open Dashboard
          </Link>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-1.5 shadow-lg">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}

          <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={toggleDataMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                dataMode === 'mock'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Mode: {dataMode === 'mock' ? 'Demo Mock Data' : 'Live API'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
