import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Navigation, MapPin, ExternalLink, Compass } from 'lucide-react';

import type { ComplaintLocation } from '../../types/complaint';

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
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const lat = location?.coordinates?.lat ?? location?.latitude ?? 13.0042;
  const lng = location?.coordinates?.lng ?? location?.longitude ?? 76.1018;

  const areaStr = location?.area || 'BM Road Area';
  const wardStr = location?.ward || 'Ward 04';
  const cityStr = location?.city || 'Hassan';
  const stateStr = location?.state || 'Karnataka';
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  useEffect(() => {
    if (!showEmbedMap || !mapContainerRef.current) return;

    // Cleanup existing map instance if present
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    try {
      // Leaflet Pin Icon matching ComplaintFormPage style
      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            position: relative;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              position: absolute;
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background: rgba(37, 99, 235, 0.35);
              animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
            "></div>
            <div style="
              width: 22px;
              height: 22px;
              border-radius: 50%;
              background: #2563eb;
              border: 3px solid #ffffff;
              box-shadow: 0 4px 12px rgba(0,0,0,0.4);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
            ">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 16,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
      marker.bindPopup(`<b>${areaStr}</b><br/>${wardStr}, ${cityStr}`).openPopup();

      mapInstanceRef.current = map;
      markerRef.current = marker;
    } catch {
      // Fallback
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng, showEmbedMap, areaStr, wardStr, cityStr]);

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
              Interactive Leaflet OpenStreetMap Engine
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
        <div
          ref={mapContainerRef}
          className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 h-44 w-full relative bg-slate-950 z-0"
        />
      )}
    </div>
  );
}
