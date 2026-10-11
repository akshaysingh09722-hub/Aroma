import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { CityAirQualityRecord } from '../../types/airQuality';
import { getAQIScale } from '../../utils/aqiUtils';
import { Globe, RotateCcw } from 'lucide-react';

interface GlobalCityMapProps {
  cities: CityAirQualityRecord[];
  selectedCityId?: string;
  onSelectCity: (city: CityAirQualityRecord) => void;
  className?: string;
}

export const GlobalCityMap: React.FC<GlobalCityMapProps> = ({
  cities,
  selectedCityId,
  onSelectCity,
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [22.5937, 78.9629],
      zoom: 5,
      minZoom: 4,
      maxZoom: 12,
      scrollWheelZoom: false,
      zoomControl: true,
      attributionControl: true,
    });

    mapInstanceRef.current = map;

    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }
    ).addTo(map);

    cities.forEach((city) => {
      const scale = getAQIScale(city.currentAQI);
      const isSelected = city.id === selectedCityId;

      const customIcon = L.divIcon({
        className: 'custom-city-marker',
        html: `
          <div style="
            background-color: ${isSelected ? '#0f172a' : '#ffffff'};
            color: ${isSelected ? '#ffffff' : '#0f172a'};
            font-size: 11px;
            font-weight: 800;
            padding: 4px 10px;
            border-radius: 9999px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
            border: 2px solid ${scale.hex};
            display: flex;
            align-items: center;
            gap: 6px;
            cursor: pointer;
            transform: translate(-50%, -50%);
            white-space: nowrap;
            transition: transform 0.15s ease;
          ">
            <span style="
              width: 8px;
              height: 8px;
              border-radius: 9999px;
              background-color: ${scale.hex};
              box-shadow: 0 0 6px ${scale.hex};
            "></span>
            <span>${city.name}</span>
            <span style="
              background-color: ${scale.hex}25;
              color: ${scale.hex};
              padding: 1px 5px;
              border-radius: 4px;
              font-family: monospace;
            ">${city.currentAQI}</span>
          </div>
        `,
        iconSize: [80, 28],
        iconAnchor: [40, 14],
      });

      const marker = L.marker([city.latitude, city.longitude], {
        icon: customIcon,
      }).addTo(map);

      marker.on('click', () => {
        onSelectCity(city);
        map.setView([city.latitude, city.longitude], 7, { animate: true });
      });
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [cities, selectedCityId, onSelectCity]);

  const handleReset = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([22.5937, 78.9629], 5, { animate: true });
    }
  };

  return (
    <div className={`rounded-2xl bg-white border border-slate-200/90 shadow-card overflow-hidden flex flex-col ${className}`}>
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-600" />
          <span className="font-extrabold text-slate-900">
            National CAAQMS Air Quality Network ({cities.length} Indian Hubs)
          </span>
        </div>

        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold shadow-sm transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Reset India View</span>
        </button>
      </div>

      <div className="relative w-full h-[450px]">
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>
    </div>
  );
};
