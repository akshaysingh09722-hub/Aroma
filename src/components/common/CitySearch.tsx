import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, X, ChevronDown } from 'lucide-react';
import { CityAirQualityRecord } from '../../types/airQuality';
import { CITIES_DATA } from '../../data/mockAirQualityData';
import { getAQIScale } from '../../utils/aqiUtils';

interface CitySearchProps {
  selectedCityId: string;
  onSelectCity: (city: CityAirQualityRecord) => void;
  className?: string;
}

export const CitySearch: React.FC<CitySearchProps> = ({
  selectedCityId,
  onSelectCity,
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedCity =
    CITIES_DATA.find((c) => c.id === selectedCityId) || CITIES_DATA[0];

  const filteredCities = CITIES_DATA.filter((city) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase().trim();
    return (
      city.name.toLowerCase().includes(q) ||
      city.country.toLowerCase().includes(q) ||
      city.region.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (city: CityAirQualityRecord) => {
    onSelectCity(city);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Input Box */}
      <div className="relative flex items-center">
        <div className="absolute left-3.5 pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={`Current: ${selectedCity.name}, ${selectedCity.country}...`}
          className="w-full pl-9 pr-10 py-2 sm:py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm transition-all"
        />

        <div className="absolute right-3 flex items-center gap-1">
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400 pointer-events-none" />
          )}
        </div>
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden max-h-80 overflow-y-auto">
          <div className="p-2 border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex justify-between">
            <span>Select Monitoring Location ({filteredCities.length})</span>
            <span>EPA AQI</span>
          </div>

          {filteredCities.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500">
              No cities match "{query}". Try searching for New York, Tokyo, or Delhi.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredCities.map((city) => {
                const scale = getAQIScale(city.currentAQI);
                const isSelected = city.id === selectedCityId;

                return (
                  <button
                    key={city.id}
                    onClick={() => handleSelect(city)}
                    className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors ${
                      isSelected ? 'bg-emerald-50/40 text-emerald-900' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <MapPin
                        className={`w-4 h-4 shrink-0 ${
                          isSelected ? 'text-emerald-600' : 'text-slate-400'
                        }`}
                      />
                      <div className="truncate">
                        <div className="text-sm font-semibold text-slate-900 truncate">
                          {city.name}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          {city.country} • {city.region}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className="px-2 py-0.5 rounded text-xs font-bold tabular-nums"
                        style={{
                          backgroundColor: `${scale.hex}18`,
                          color: scale.hex,
                        }}
                      >
                        {city.currentAQI}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
