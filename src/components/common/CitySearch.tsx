import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, X, ChevronDown, Loader2, Globe } from 'lucide-react';
import { CityAirQualityRecord } from '../../types/airQuality';
import { CITIES_DATA } from '../../data/mockAirQualityData';
import { getAQIScale } from '../../utils/aqiUtils';
import { searchCitiesWorldwide } from '../../services/geocodingApi';
import { GeoLocation } from '../../services/environmentalApi';
import { useLocationContext } from '../../context/LocationContext';

interface CitySearchProps {
  selectedCityId?: string;
  onSelectCity?: (city: CityAirQualityRecord) => void;
  className?: string;
}

export const CitySearch: React.FC<CitySearchProps> = ({
  selectedCityId,
  onSelectCity,
  className = '',
}) => {
  const { selectedLocation, setSelectedLocation, recentLocations } = useLocationContext();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<GeoLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<number | null>(null);

  // Debounced search with Open-Meteo Geocoding API
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setIsSearching(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const results = await searchCitiesWorldwide(query, 8);
        setSearchResults(results);
      } catch (err) {
        console.warn('Geocoding search failed:', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query]);

  // Click outside to close dropdown
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

  const handleSelectLocation = (loc: GeoLocation) => {
    setSelectedLocation(loc);
    // Backward-compatibility: if parent provided onSelectCity callback, construct a record
    if (onSelectCity) {
      const match = CITIES_DATA.find((c) => c.id === loc.id || c.name.toLowerCase() === loc.name.toLowerCase());
      if (match) {
        onSelectCity(match);
      } else {
        const fallback = CITIES_DATA[0];
        onSelectCity({
          ...fallback,
          id: loc.id,
          name: loc.name,
          country: loc.country,
          region: loc.region,
          latitude: loc.latitude,
          longitude: loc.longitude,
        });
      }
    }
    setQuery('');
    setIsOpen(false);
  };

  const handleSelectMockCity = (city: CityAirQualityRecord) => {
    const loc: GeoLocation = {
      id: city.id,
      name: city.name,
      country: city.country,
      region: city.region,
      latitude: city.latitude,
      longitude: city.longitude,
    };
    setSelectedLocation(loc);
    if (onSelectCity) onSelectCity(city);
    setQuery('');
    setIsOpen(false);
  };

  // Local filtered curated list when query is short
  const filteredLocalCities = CITIES_DATA.filter((city) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase().trim();
    return (
      city.name.toLowerCase().includes(q) ||
      city.country.toLowerCase().includes(q) ||
      city.region.toLowerCase().includes(q)
    );
  });

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Input Box */}
      <div className="relative flex items-center">
        <div className="absolute left-3.5 pointer-events-none text-slate-400">
          {isSearching ? (
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={`Current: ${selectedLocation.name}, ${selectedLocation.country}...`}
          className="w-full pl-9 pr-10 py-2 sm:py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm transition-all"
        />

        <div className="absolute right-3 flex items-center gap-1">
          {query ? (
            <button
              onClick={() => {
                setQuery('');
                setSearchResults([]);
              }}
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
        <div className="absolute z-50 mt-1.5 w-full min-w-[320px] max-w-md bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden max-h-96 overflow-y-auto">
          {/* Header indicator */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex justify-between items-center">
            <span className="flex items-center gap-1.5">
              <Globe className="w-3 h-3 text-emerald-600" />
              <span>{query.trim() ? 'Worldwide Cities Search' : 'Recent & Major Cities'}</span>
            </span>
            <span className="text-[10px] text-slate-400">Open-Meteo Geocoding</span>
          </div>

          {/* If user searched and we have API results */}
          {query.trim().length >= 2 && searchResults.length > 0 && (
            <div className="divide-y divide-slate-100">
              <div className="px-3 py-1.5 bg-emerald-50/40 text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                Global Geocoded Matches ({searchResults.length})
              </div>
              {searchResults.map((loc) => {
                const isSelected =
                  loc.name.toLowerCase() === selectedLocation.name.toLowerCase() &&
                  loc.country.toLowerCase() === selectedLocation.country.toLowerCase();

                return (
                  <button
                    key={`${loc.latitude}-${loc.longitude}-${loc.id}`}
                    onClick={() => handleSelectLocation(loc)}
                    className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors ${
                      isSelected ? 'bg-emerald-50/60 text-emerald-900' : ''
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
                          {loc.name}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          {loc.region ? `${loc.region}, ` : ''}{loc.country}
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono shrink-0">
                      {loc.latitude.toFixed(2)}°, {loc.longitude.toFixed(2)}°
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* If searching or no results found */}
          {query.trim().length >= 2 && !isSearching && searchResults.length === 0 && (
            <div className="p-3 text-center text-xs text-slate-500">
              No worldwide matches found for "{query}".
            </div>
          )}

          {/* Quick Curated / Recent Locations Section */}
          {(!query.trim() || query.trim().length < 2) && (
            <div className="divide-y divide-slate-100">
              {recentLocations.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Recent Selections
                  </div>
                  {recentLocations.map((loc) => {
                    const isSelected =
                      loc.latitude === selectedLocation.latitude &&
                      loc.longitude === selectedLocation.longitude;

                    return (
                      <button
                        key={`recent-${loc.latitude}-${loc.longitude}-${loc.id}`}
                        onClick={() => handleSelectLocation(loc)}
                        className={`w-full px-3.5 py-2 text-left flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors ${
                          isSelected ? 'bg-emerald-50/50 text-emerald-900 font-semibold' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="text-xs text-slate-800 truncate">
                            {loc.name}, {loc.country}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {loc.latitude.toFixed(1)}°, {loc.longitude.toFixed(1)}°
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              <div>
                <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Curated Benchmarks
                </div>
                {filteredLocalCities.slice(0, 5).map((city) => {
                  const scale = getAQIScale(city.currentAQI);
                  const isSelected = city.id === selectedCityId || city.name.toLowerCase() === selectedLocation.name.toLowerCase();

                  return (
                    <button
                      key={`curated-${city.id}`}
                      onClick={() => handleSelectMockCity(city)}
                      className={`w-full px-3.5 py-2 text-left flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors ${
                        isSelected ? 'bg-emerald-50/40 text-emerald-900' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-xs text-slate-800 truncate">
                          {city.name}, {city.country}
                        </span>
                      </div>
                      <span
                        className="px-1.5 py-0.5 rounded text-[10px] font-bold tabular-nums"
                        style={{
                          backgroundColor: `${scale.hex}18`,
                          color: scale.hex,
                        }}
                      >
                        AQI {city.currentAQI}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
