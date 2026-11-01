import React, { useState } from 'react';
import { Search, MapPin, X, Navigation, Loader2 } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  locationFilter: string;
  onLocationChange: (location: string) => void;
  activeMode: 'general' | 'location' | 'qr';
  onModeChange: (mode: 'general' | 'location' | 'qr') => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  locationFilter,
  onLocationChange,
  activeMode,
  onModeChange,
}) => {
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          // Attempt reverse geocoding via public open-source geocoding API or fallback to coordinate string
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
            if (res.ok) {
              const data = await res.json();
              const city = data.address?.city || data.address?.town || data.address?.state || 'Nearby';
              onLocationChange(city);
              setGpsLoading(false);
              return;
            }
          } catch {
            // fallback
          }
          onLocationChange(`${lat.toFixed(2)}, ${lon.toFixed(2)}`);
        } catch {
          setGpsError('Could not resolve location name.');
        } finally {
          setGpsLoading(false);
        }
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError('Location permission was denied. You can still type your city manually below.');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setGpsError('Position unavailable. Please type your location manually.');
        } else {
          setGpsError('Location request timed out. Please type your location.');
        }
      },
      { timeout: 8000 }
    );
  };

  const getPlaceholder = () => {
    if (activeMode === 'location') return 'Enter city or region (e.g. Ahmedabad, Mumbai)...';
    if (activeMode === 'qr') return 'Search by QR destination link or domain...';
    return 'Search products, places, QR codes...';
  };

  return (
    <div className="w-full mb-6">
      {/* Search Input Box */}
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737373]">
            {activeMode === 'location' ? (
              <MapPin className="w-4 h-4 text-[#FF8C42]" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </div>

          <input
            type="text"
            value={activeMode === 'location' ? locationFilter : searchQuery}
            onChange={(e) => {
              if (activeMode === 'location') {
                onLocationChange(e.target.value);
              } else {
                onSearchChange(e.target.value);
              }
            }}
            placeholder={getPlaceholder()}
            className="w-full h-[46px] pl-10 pr-10 text-[14px] bg-white border border-[#DDDDDD] rounded-xl text-[#171717] placeholder:text-[#999999] focus:outline-hidden focus:border-[#171717] focus:ring-1 focus:ring-[#171717] transition-all shadow-xs"
            aria-label="Search content"
          />

          {((activeMode === 'location' ? locationFilter : searchQuery).length > 0) && (
            <button
              onClick={() => {
                if (activeMode === 'location') onLocationChange('');
                else onSearchChange('');
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#171717] p-1 rounded-full"
              aria-label="Clear input"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {activeMode === 'location' ? (
          <button
            onClick={handleUseGPS}
            disabled={gpsLoading}
            className="h-[46px] px-3.5 bg-[#F5F5F5] hover:bg-[#EAEAEA] active:scale-95 border border-[#E5E5E5] text-[#171717] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
            title="Use current GPS location"
          >
            {gpsLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Navigation className="w-3.5 h-3.5 text-[#5B8F2B]" />
            )}
            <span className="hidden sm:inline">Use GPS</span>
          </button>
        ) : (
          <button
            onClick={() => {}}
            className="h-[46px] px-5 bg-[#171717] hover:bg-[#2b2b2b] active:scale-95 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs"
          >
            Search
          </button>
        )}
      </div>

      {/* GPS Error feedback if denied */}
      {gpsError && (
        <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start justify-between gap-2">
          <span>{gpsError}</span>
          <button onClick={() => setGpsError(null)} className="text-amber-600 hover:text-amber-900 font-bold">×</button>
        </div>
      )}

      {/* Mode Indicator & Active Filter Tag */}
      {(searchQuery || locationFilter) && (
        <div className="mt-2.5 flex items-center gap-2 text-xs text-[#737373]">
          <span>Filtering by:</span>
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F5F5F5] text-[#171717] font-medium border border-[#E5E5E5]">
              "{searchQuery}"
              <button onClick={() => onSearchChange('')} className="hover:text-red-500 font-bold ml-1">×</button>
            </span>
          )}
          {locationFilter && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EFF9E5] text-[#3d681c] font-medium border border-[#B8D99A]">
              📍 {locationFilter}
              <button onClick={() => onLocationChange('')} className="hover:text-red-500 font-bold ml-1">×</button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
