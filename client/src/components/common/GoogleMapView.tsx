import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import { loadGoogleMaps } from '../../lib/googleMaps';

export interface MapCoordinates {
  lat: number;
  lng: number;
}

interface GoogleMapViewProps {
  center: MapCoordinates;
  className?: string;
  markerTitle?: string;
  onLocationChange?: (coordinates: MapCoordinates) => void;
}

export function GoogleMapView({
  center,
  className = '',
  markerTitle = 'Selected location',
  onLocationChange,
}: GoogleMapViewProps) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const onLocationChangeRef = useRef(onLocationChange);
  const centerRef = useRef(center);
  const [loadError, setLoadError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  centerRef.current = center;

  useEffect(() => {
    onLocationChangeRef.current = onLocationChange;
    markerRef.current?.setDraggable(Boolean(onLocationChange));
  }, [onLocationChange]);

  useEffect(() => {
    let disposed = false;
    let mapClickListener: google.maps.MapsEventListener | undefined;
    let markerDragListener: google.maps.MapsEventListener | undefined;
    const handleAuthFailure = () => {
      setLoadError('Google Maps rejected the key. Check that Maps JavaScript API is enabled and the key allows this website.');
      setIsLoading(false);
    };
    window.addEventListener('google-maps-auth-failure', handleAuthFailure);

    void loadGoogleMaps()
      .then(() => {
        if (disposed || !mapElementRef.current) return;

        const map = new google.maps.Map(mapElementRef.current, {
          center: centerRef.current,
          zoom: 16,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          clickableIcons: false,
          gestureHandling: 'cooperative',
        });
        const marker = new google.maps.Marker({
          map,
          position: centerRef.current,
          title: markerTitle,
          draggable: Boolean(onLocationChangeRef.current),
        });

        mapClickListener = map.addListener('click', (event: google.maps.MapMouseEvent) => {
          if (!event.latLng || !onLocationChangeRef.current) return;
          const next = { lat: event.latLng.lat(), lng: event.latLng.lng() };
          marker.setPosition(next);
          onLocationChangeRef.current(next);
        });

        markerDragListener = marker.addListener('dragend', () => {
          const position = marker.getPosition();
          if (!position || !onLocationChangeRef.current) return;
          onLocationChangeRef.current({ lat: position.lat(), lng: position.lng() });
        });

        mapRef.current = map;
        markerRef.current = marker;
        setIsLoading(false);
      })
      .catch((error: unknown) => {
        if (disposed) return;
        setLoadError(error instanceof Error ? error.message : 'Google Maps could not be loaded.');
        setIsLoading(false);
      });

    return () => {
      disposed = true;
      window.removeEventListener('google-maps-auth-failure', handleAuthFailure);
      mapClickListener?.remove();
      markerDragListener?.remove();
      markerRef.current?.setMap(null);
      markerRef.current = null;
      mapRef.current = null;
    };
  }, [markerTitle]);

  useEffect(() => {
    mapRef.current?.setCenter(center);
    markerRef.current?.setPosition(center);
  }, [center.lat, center.lng]);

  return (
    <div className={`relative overflow-hidden bg-slate-100 dark:bg-slate-800 ${className}`}>
      <div ref={mapElementRef} className="absolute inset-0" />
      {(isLoading || loadError) && (
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-slate-100 px-5 text-center dark:bg-slate-800"
          role={loadError ? 'alert' : 'status'}
        >
          <MapPin className={`h-5 w-5 ${loadError ? 'text-rose-600' : 'text-blue-600'}`} />
          <p className="max-w-sm text-xs font-medium text-slate-600 dark:text-slate-300">
            {loadError || 'Loading Google Maps…'}
          </p>
        </div>
      )}
    </div>
  );
}
