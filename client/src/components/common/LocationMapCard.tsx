import { Navigation, MapPin, ExternalLink, Compass } from 'lucide-react';
import { GoogleMapView } from './GoogleMapView';
import type { ComplaintLocation } from '../../types/complaint';
import { FIXED_CITY_LOCATION } from '../../lib/geoHelper';

interface LocationMapCardProps {
  location?: ComplaintLocation;
  title?: string;
  className?: string;
  showEmbedMap?: boolean;
}

export function LocationMapCard({
  location,
  title = 'Department Field GPS Location & Navigation',
  className = '',
  showEmbedMap = true,
}: LocationMapCardProps) {
  const lat = location?.coordinates?.lat ?? location?.latitude ?? FIXED_CITY_LOCATION.lat;
  const lng = location?.coordinates?.lng ?? location?.longitude ?? FIXED_CITY_LOCATION.lng;

  const areaStr = location?.area || 'BM Road Area';
  const wardStr = location?.ward || 'Ward 04';
  const cityStr = location?.city || 'Hassan';
  const stateStr = location?.state || 'Karnataka';
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return (
    <div
      className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 shadow-sm ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 font-bold shrink-0">
            <Compass className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              {title}
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Google Maps location
            </p>
          </div>
        </div>

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition shrink-0 hover:scale-105"
          title="Open exact location in Google Maps app or browser"
        >
          <Navigation className="h-3.5 w-3.5" />
          <span>Open in Google Maps</span>
          <ExternalLink className="h-3 w-3 opacity-70" />
        </a>
      </div>

      <div className="flex flex-wrap items-center justify-between text-xs gap-2">
        <div className="space-y-0.5 min-w-0 flex-1">
          <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1 truncate">
            <MapPin className="h-3.5 w-3.5 text-orange-500 shrink-0" />
            <span className="truncate">{areaStr}</span>
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
            {wardStr} · {cityStr}, {stateStr} {location?.pincode ? `(${location.pincode})` : ''}
          </span>
        </div>

        <div className="text-[10px] font-mono bg-slate-100 dark:bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
          <span>Lat: {lat.toFixed(4)}°</span> · <span>Lng: {lng.toFixed(4)}°</span>
        </div>
      </div>

      {showEmbedMap && (
        <GoogleMapView
          center={{ lat, lng }}
          markerTitle={`${areaStr}, ${wardStr}, ${cityStr}`}
          className="relative z-0 h-44 w-full rounded-xl border border-slate-200 dark:border-slate-800"
        />
      )}
    </div>
  );
}
