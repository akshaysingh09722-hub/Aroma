import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MonitoringStation } from '../../types/airQuality';
import { getAQIScale } from '../../utils/aqiUtils';
import { Layers, Radio, Compass, RotateCcw, MapPin } from 'lucide-react';

interface CityStationMapProps {
  cityName: string;
  stations: MonitoringStation[];
  latitude: number;
  longitude: number;
  className?: string;
  onSelectStation?: (station: MonitoringStation) => void;
}

export const CityStationMap: React.FC<CityStationMapProps> = ({
  cityName,
  stations,
  latitude,
  longitude,
  className = '',
  onSelectStation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [activeStation, setActiveStation] = useState<MonitoringStation | null>(
    stations[0] || null
  );

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up existing map instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize Leaflet map
    const map = L.map(mapContainerRef.current, {
      center: [latitude, longitude],
      zoom: 12,
      scrollWheelZoom: false,
      zoomControl: true,
      attributionControl: true,
    });

    mapInstanceRef.current = map;

    // Add high-clarity CartoDB Positron / OSM tiles
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }
    ).addTo(map);

    // Add station markers
    markersRef.current = [];
    stations.forEach((station) => {
      const scale = getAQIScale(station.currentAQI);

      // Custom styled HTML marker icon
      const customIcon = L.divIcon({
        className: 'custom-station-marker',
        html: `
          <div style="
            background-color: ${scale.hex};
            color: #ffffff;
            font-size: 11px;
            font-weight: 800;
            padding: 3px 8px;
            border-radius: 9999px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            border: 2px solid #ffffff;
            display: flex;
            align-items: center;
            gap: 4px;
            cursor: pointer;
            transform: translate(-50%, -50%);
            white-space: nowrap;
          ">
            <span style="width: 6px; height: 6px; border-radius: 9999px; background-color: #ffffff;"></span>
            <span>${station.currentAQI}</span>
          </div>
        `,
        iconSize: [40, 24],
        iconAnchor: [20, 12],
      });

      const marker = L.marker([station.latitude, station.longitude], {
        icon: customIcon,
      }).addTo(map);

      // Popup content
      const popupHtml = `
        <div style="font-family: system-ui, sans-serif; min-width: 170px; padding: 2px;">
          <div style="font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase; margin-bottom: 2px;">
            ${station.stationCode}
          </div>
          <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">
            ${station.name}
          </div>
          <div style="display: flex; align-items: baseline; gap: 6px; margin-bottom: 6px;">
            <span style="font-size: 18px; font-weight: 900; color: ${scale.hex};">${station.currentAQI}</span>
            <span style="font-size: 11px; font-weight: 600; color: #475569;">AQI • ${scale.category}</span>
          </div>
          <div style="font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 4px;">
            <div>Sensor: ${station.sensorType}</div>
            <div>Dominant: ${station.dominantPollutant.toUpperCase()}</div>
            <div>Reported: ${station.lastReported}</div>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        setActiveStation(station);
        if (onSelectStation) onSelectStation(station);
      });

      markersRef.current.push(marker);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [latitude, longitude, stations, onSelectStation]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([latitude, longitude], 12, { animate: true });
    }
  };

  const handleStationClick = (station: MonitoringStation) => {
    setActiveStation(station);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([station.latitude, station.longitude], 14, { animate: true });
      // Open popup
      const idx = stations.findIndex((s) => s.id === station.id);
      if (idx !== -1 && markersRef.current[idx]) {
        markersRef.current[idx].openPopup();
      }
    }
    if (onSelectStation) onSelectStation(station);
  };

  return (
    <div className={`rounded-2xl bg-white border border-slate-200/90 shadow-card overflow-hidden flex flex-col ${className}`}>
      {/* Top Header & Actions Bar */}
      <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
            <h3 className="font-extrabold text-slate-900 text-sm">
              Live Station Spatial Map — {cityName}
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {stations.length} Active Sensors
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-0.5">
            Interactive OpenStreetMap layer with ground monitoring stations and calibrated telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRecenter}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold shadow-sm transition-all"
            title="Recenter to city coordinates"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Recenter</span>
          </button>

          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-slate-500 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200">
            <Compass className="w-3 h-3 text-cyan-600" />
            {latitude.toFixed(2)}°, {longitude.toFixed(2)}°
          </span>
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div className="relative w-full h-80 sm:h-96 z-0">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Floating Layer Legend */}
        <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-md border border-slate-200 text-[11px] flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-bold text-slate-800">Ground Stations:</span>
          <span className="text-slate-500">Click any marker pin for sensor telemetry</span>
        </div>
      </div>

      {/* Quick Station Selection Chips Bar */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 overflow-x-auto flex items-center gap-2 text-xs">
        <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider shrink-0 mr-1 flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          Stations:
        </span>
        {stations.map((st) => {
          const scale = getAQIScale(st.currentAQI);
          const isSelected = activeStation?.id === st.id;

          return (
            <button
              key={st.id}
              onClick={() => handleStationClick(st)}
              className={`px-3 py-1.5 rounded-xl text-left border transition-all shrink-0 flex items-center gap-2 ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: scale.hex }}
              />
              <span className="font-bold text-xs truncate max-w-[150px]">{st.name}</span>
              <span className={`font-mono text-[11px] tabular-nums font-bold ${isSelected ? 'text-emerald-300' : 'text-slate-500'}`}>
                {st.currentAQI}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
