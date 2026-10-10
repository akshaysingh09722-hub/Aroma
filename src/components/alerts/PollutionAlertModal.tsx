import React, { useState, useEffect } from 'react';
import { CityAirQualityRecord } from '../../types/airQuality';
import { getAQIScale } from '../../utils/aqiUtils';
import {
  Bell,
  X,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Mail,
  Smartphone,
  Webhook,
  ShieldAlert,
} from 'lucide-react';

interface PollutionAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  city: CityAirQualityRecord;
}

export const PollutionAlertModal: React.FC<PollutionAlertModalProps> = ({
  isOpen,
  onClose,
  city,
}) => {
  const [threshold, setThreshold] = useState<number>(100);
  const [notifyEmail, setNotifyEmail] = useState(false);
  const [notifyPush, setNotifyPush] = useState(true);
  const [notifyWebhook, setNotifyWebhook] = useState(false);
  const [forecastAlerts, setForecastAlerts] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load from localStorage if present
  useEffect(() => {
    const saved = localStorage.getItem(`aerosense_alert_${city.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setThreshold(parsed.threshold ?? 100);
        setNotifyEmail(parsed.notifyEmail ?? false);
        setNotifyPush(parsed.notifyPush ?? true);
        setNotifyWebhook(parsed.notifyWebhook ?? false);
        setForecastAlerts(parsed.forecastAlerts ?? true);
      } catch (e) {
        // ignore JSON parse error
      }
    }
  }, [city.id]);

  if (!isOpen) return null;

  const thresholdScale = getAQIScale(threshold);
  const isCurrentlyTriggered = city.currentAQI >= threshold;

  // Check if upcoming 24h forecast exceeds threshold
  const forecastExceedances = city.forecast24h.filter(
    (pt) => pt.predictedAQI >= threshold
  );

  const handleSave = () => {
    const config = {
      threshold,
      notifyEmail,
      notifyPush,
      notifyWebhook,
      forecastAlerts,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(`aerosense_alert_${city.id}`, JSON.stringify(config));
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            aria-label="Close alert modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-300">
              <Bell className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-semibold text-emerald-300 uppercase tracking-wider">
              Early Warning Sentinel
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Pollution Alert Preferences
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure automated health threshold warnings for <strong>{city.name}, {city.country}</strong>.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto">
          {/* Active Status Banner */}
          <div
            className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
              isCurrentlyTriggered
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}
          >
            {isCurrentlyTriggered ? (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold text-sm">
                {isCurrentlyTriggered
                  ? `Threshold Exceeded (Current AQI: ${city.currentAQI})`
                  : `Air Quality Safe (Current AQI: ${city.currentAQI})`}
              </div>
              <p className="mt-1 leading-relaxed opacity-90">
                {isCurrentlyTriggered
                  ? `Current ambient pollution in ${city.name} exceeds your custom limit of ${threshold}. Immediate health advisories apply.`
                  : `Ambient AQI is currently below your alert threshold of ${threshold} (${thresholdScale.category}).`}
              </p>
            </div>
          </div>

          {/* Threshold Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-slate-500" />
                <span>Alert Trigger Threshold</span>
              </label>
              <div className="flex items-center gap-2">
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-bold border"
                  style={{
                    backgroundColor: `${thresholdScale.hex}20`,
                    color: thresholdScale.hex,
                    borderColor: `${thresholdScale.hex}40`,
                  }}
                >
                  AQI {threshold} • {thresholdScale.category}
                </span>
              </div>
            </div>

            <input
              type="range"
              min={25}
              max={300}
              step={5}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />

            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>Good (50)</span>
              <span>Moderate (100)</span>
              <span>Sensitive (150)</span>
              <span>Unhealthy (200)</span>
              <span>Hazardous (300)</span>
            </div>
          </div>

          {/* Forecast-Based Warning Toggle */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-bold text-slate-800">
                Predictive Forecast Alerts (Upcoming 24h)
              </span>
              <input
                type="checkbox"
                checked={forecastAlerts}
                onChange={(e) => setForecastAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
            </label>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Triggers proactive notification if the AI model projects pollution crossing your limit within the next 24 hours.
            </p>

            {forecastAlerts && forecastExceedances.length > 0 && (
              <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] text-amber-800 flex items-center gap-1.5 font-semibold">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Forecast warning: {forecastExceedances.length} upcoming time windows project AQI &ge; {threshold}.
                </span>
              </div>
            )}
          </div>

          {/* Delivery Channels */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Notification Channels
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <label
                className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                  notifyPush
                    ? 'border-emerald-500 bg-emerald-50/50 text-slate-900'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <input
                    type="checkbox"
                    checked={notifyPush}
                    onChange={(e) => setNotifyPush(e.target.checked)}
                    className="accent-emerald-600"
                  />
                </div>
                <span className="font-bold mt-2">Browser Push</span>
                <span className="text-[10px] text-slate-400">Desktop & mobile</span>
              </label>

              <label
                className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                  notifyEmail
                    ? 'border-emerald-500 bg-emerald-50/50 text-slate-900'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Mail className="w-4 h-4 text-cyan-600" />
                  <input
                    type="checkbox"
                    checked={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.checked)}
                    className="accent-emerald-600"
                  />
                </div>
                <span className="font-bold mt-2">Email Digest</span>
                <span className="text-[10px] text-slate-400">Daily health briefing</span>
              </label>

              <label
                className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                  notifyWebhook
                    ? 'border-emerald-500 bg-emerald-50/50 text-slate-900'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Webhook className="w-4 h-4 text-purple-600" />
                  <input
                    type="checkbox"
                    checked={notifyWebhook}
                    onChange={(e) => setNotifyWebhook(e.target.checked)}
                    className="accent-emerald-600"
                  />
                </div>
                <span className="font-bold mt-2">API Webhook</span>
                <span className="text-[10px] text-slate-400">Smart HVAC trigger</span>
              </label>
            </div>
          </div>

          {/* Scientific Disclaimer */}
          <p className="text-[10px] text-slate-400 border-t border-slate-100 pt-3 leading-relaxed">
            * Delivery simulation active. In Phase 1, alert preferences are persisted to local device storage. Web Push dispatch requires Member 2 backend push service connection.
          </p>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Preferences Saved!</span>
              </>
            ) : (
              <>
                <Bell className="w-4 h-4" />
                <span>Save Alert Rules</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
