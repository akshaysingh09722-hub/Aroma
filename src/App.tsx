import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ForecastPage } from './pages/ForecastPage';
import { CityExplorerPage } from './pages/CityExplorerPage';
import { Experience3DPage } from './pages/Experience3DPage';
import { ScenarioLabPage } from './pages/ScenarioLabPage';
import { AboutPage } from './pages/AboutPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/forecast" element={<ForecastPage />} />
          <Route path="/cities" element={<CityExplorerPage />} />
          <Route path="/experience-3d" element={<Experience3DPage />} />
          <Route path="/scenario-lab" element={<ScenarioLabPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
