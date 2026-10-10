import React from 'react';
import {
  Wind,
  BrainCircuit,
  Database,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  Code2,
  FileCode,
  Users,
} from 'lucide-react';
import { DemoNotice } from '../components/common/DemoNotice';

export const AboutPage: React.FC = () => {
  const teamMembers = [
    {
      role: 'Team Member 1',
      title: 'Frontend Pages, Shared Components & UI/UX',
      focus: 'Design systems, responsive components, chart integrations, interactive search and layouts.',
      files: [
        'src/components/layout/*',
        'src/components/common/*',
        'src/pages/*',
        'src/styles/*',
      ],
      status: 'Phase 1 Complete (Foundation ready)',
      color: 'border-emerald-300 bg-emerald-50/50 text-emerald-800',
    },
    {
      role: 'Team Member 2',
      title: 'Backend APIs & Real AQI Data Integration',
      focus: 'FastAPI/Node service, OpenAQ API proxy, Redis caching, and real-time station ingestion.',
      files: [
        'src/services/api.ts',
        'docs/API_CONTRACT.md',
        'server/ (Backend Repo)',
      ],
      status: 'Ready for Backend Hookup (Contract defined)',
      color: 'border-cyan-300 bg-cyan-50/50 text-cyan-800',
    },
    {
      role: 'Team Member 3',
      title: 'AI / ML Forecasting Module',
      focus: 'Temporal Fusion Transformer (TFT) training, feature engineering, and inference service.',
      files: [
        'src/pages/ForecastPage.tsx',
        'src/data/mockAirQualityData.ts',
        'ml/ (Notebooks/Models)',
      ],
      status: 'Ready for Inference Service (Props defined)',
      color: 'border-purple-300 bg-purple-50/50 text-purple-800',
    },
    {
      role: 'Team Member 4',
      title: 'Spatial / 3D Visualization & Testing',
      focus: 'Leaflet GIS vector layers, Three.js 3D pollution dispersion prototypes, and integration tests.',
      files: [
        'src/components/dashboard/CityMapPlaceholder.tsx',
        'src/components/maps/*',
        'src/components/three/*',
      ],
      status: 'Ready for WebGL / Map Layer (Containers ready)',
      color: 'border-amber-300 bg-amber-50/50 text-amber-800',
    },
  ];

  return (
    <div className="space-y-12 sm:space-y-16 py-4">
      {/* Demo Notice Banner */}
      <DemoNotice message="Methodology and hackathon architecture documentation. All frontend interfaces are structured for seamless team collaboration." />

      {/* Header Section */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
          <Wind className="w-3.5 h-3.5" />
          <span>About AeroSense AI</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
          Intelligent Air Quality Monitoring & Forecasting Platform
        </h1>

        <p className="text-base text-slate-600 leading-relaxed">
          AeroSense AI was created for an environmental hackathon to bridge the gap between static, retrospective air-quality readings and predictive, spatiotemporal health intelligence.
        </p>
      </section>

      {/* The Role of AI in Forecasting */}
      <section className="rounded-2xl bg-white border border-slate-200/90 shadow-card p-6 sm:p-10 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              The Role of AI in Air-Quality Forecasting
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Moving from simple interpolation to physical-informed neural prediction
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 text-xs sm:text-sm text-slate-600">
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">
              1. Multi-Modal Sensor Ingestion
            </h3>
            <p className="leading-relaxed">
              Ground monitors (BAM and optical sensors) offer high local accuracy but low spatial coverage. Our models ingest ground telemetry alongside NASA satellite Aerosol Optical Depth (AOD) to fill geographical gaps.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">
              2. Meteorological Coupling
            </h3>
            <p className="leading-relaxed">
              Pollution spikes are strongly driven by weather anomalies: nocturnal temperature inversions, wind stagnation, and photochemical sunlight. AeroSense pairs chemical fields with NOAA GFS atmospheric dynamics.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">
              3. Uncertainty Quantification
            </h3>
            <p className="leading-relaxed">
              Rather than providing point predictions that can mislead decision makers, the Temporal Fusion Transformer estimates 95% Bayesian confidence intervals to communicate forecasting certainty.
            </p>
          </div>
        </div>
      </section>

      {/* Team Handoff & Architecture Breakdown */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Team Development Handoff & Architecture
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Phase 1 establishes clean interfaces so all four team members can develop simultaneously without merge collisions.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teamMembers.map((member) => (
            <div
              key={member.role}
              className={`rounded-2xl border p-6 space-y-4 shadow-sm bg-white hover:shadow-card transition-all`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {member.role}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {member.title}
                  </h3>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${member.color}`}
                >
                  {member.status}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {member.focus}
              </p>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Assigned Project Directories:
                </span>
                <div className="flex flex-wrap gap-1.5 font-mono text-[11px] text-slate-700">
                  {member.files.map((file) => (
                    <span
                      key={file}
                      className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200"
                    >
                      {file}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Data Sources & Attributions */}
      <section className="rounded-2xl bg-white border border-slate-200/90 shadow-card p-6 sm:p-8 space-y-4">
        <h3 className="text-base sm:text-lg font-bold text-slate-900">
          Scientific Standards & Attributions
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          AeroSense AI calibrates all air-quality categorizations against the US Environmental Protection Agency (EPA) AQI scale (40 CFR Part 58) and reference standards published by the World Health Organization (WHO 2021 Air Quality Guidelines).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50">
            <span className="font-bold text-slate-900 block mb-0.5">OpenAQ API</span>
            <span className="text-slate-500">Global open-source community ground sensor telemetry.</span>
          </div>
          <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50">
            <span className="font-bold text-slate-900 block mb-0.5">Copernicus CAMS</span>
            <span className="text-slate-500">European atmospheric composition and aerosol reanalysis.</span>
          </div>
          <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50">
            <span className="font-bold text-slate-900 block mb-0.5">NASA EOSDIS</span>
            <span className="text-slate-500">MODIS and VIIRS satellite Aerosol Optical Depth (AOD).</span>
          </div>
        </div>
      </section>
    </div>
  );
};
