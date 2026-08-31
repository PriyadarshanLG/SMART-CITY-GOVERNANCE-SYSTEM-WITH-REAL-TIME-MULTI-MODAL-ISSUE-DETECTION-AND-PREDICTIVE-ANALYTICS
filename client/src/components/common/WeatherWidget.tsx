import { useEffect, useState } from 'react';
import {
  Sun,
  CloudRain,
  Wind,
  CloudSun,
  Cloud,
  CloudLightning,
  CloudFog,
  CloudSnow,
  MapPin,
  RefreshCw,
  LocateFixed,
  Sparkles,
  PhoneCall,
  Droplets,
} from 'lucide-react';
import { HelpDeskModal } from './HelpDeskModal';

interface WeatherData {
  temp: number;
  feelsLike: number;
  condition: string;
  weatherCode: number;
  humidity: number;
  windSpeed: number;
  isWindy: boolean;
  lastUpdated: string;
}

interface WeatherWidgetProps {
  lat?: number;
  lng?: number;
  onLocationUpdate?: (lat: number, lng: number) => void;
}

export function WeatherWidget({ lat = 13.0042, lng = 76.1018, onLocationUpdate }: WeatherWidgetProps) {
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({ lat, lng });
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);
  const [locationName, setLocationName] = useState<string>('Hassan, Karnataka');
  const [isHelpDeskOpen, setIsHelpDeskOpen] = useState(false);

  useEffect(() => {
    if (lat && lng && (lat !== currentCoords.lat || lng !== currentCoords.lng)) {
      setCurrentCoords({ lat, lng });
    }
  }, [lat, lng]);

  const parseWeatherCode = (code: number, windSpeed: number) => {
    let condition = 'SUNNY';
    let Icon = Sun;
    let badgeBg = 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30';
    let iconColor = 'text-amber-500 dark:text-amber-400';
    let cardGradient = 'from-amber-500/10 via-orange-500/5 to-transparent';

    if (code === 0) {
      condition = 'SUNNY';
      Icon = Sun;
      badgeBg = 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30';
      iconColor = 'text-amber-500 dark:text-amber-400';
      cardGradient = 'from-amber-500/10 via-orange-500/5 to-transparent';
    } else if (code === 1 || code === 2) {
      condition = 'PARTLY CLOUDY';
      Icon = CloudSun;
      badgeBg = 'bg-sky-500/15 text-sky-600 dark:text-sky-300 border-sky-500/30';
      iconColor = 'text-sky-500 dark:text-sky-400';
      cardGradient = 'from-sky-500/10 via-blue-500/5 to-transparent';
    } else if (code === 3) {
      condition = 'CLOUDY';
      Icon = Cloud;
      badgeBg = 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30';
      iconColor = 'text-slate-500 dark:text-slate-400';
      cardGradient = 'from-slate-500/10 via-slate-600/5 to-transparent';
    } else if (code >= 45 && code <= 48) {
      condition = 'FOGGY';
      Icon = CloudFog;
      badgeBg = 'bg-teal-500/15 text-teal-600 dark:text-teal-300 border-teal-500/30';
      iconColor = 'text-teal-500 dark:text-teal-400';
      cardGradient = 'from-teal-500/10 via-emerald-500/5 to-transparent';
    } else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
      condition = 'RAINY';
      Icon = CloudRain;
      badgeBg = 'bg-blue-500/15 text-blue-600 dark:text-blue-300 border-blue-500/30';
      iconColor = 'text-blue-500 dark:text-blue-400';
      cardGradient = 'from-blue-500/10 via-indigo-500/5 to-transparent';
    } else if (code >= 71 && code <= 77) {
      condition = 'SNOWY';
      Icon = CloudSnow;
      badgeBg = 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border-indigo-500/30';
      iconColor = 'text-indigo-500 dark:text-indigo-400';
      cardGradient = 'from-indigo-500/10 via-blue-500/5 to-transparent';
    } else if (code >= 95) {
      condition = 'THUNDERSTORM';
      Icon = CloudLightning;
      badgeBg = 'bg-purple-500/15 text-purple-600 dark:text-purple-300 border-purple-500/30';
      iconColor = 'text-purple-500 dark:text-purple-400';
      cardGradient = 'from-purple-500/10 via-indigo-500/5 to-transparent';
    }

    if (windSpeed > 20 && !condition.includes('WINDY')) {
      condition = `${condition} & WINDY`;
    }

    return { condition, Icon, badgeBg, iconColor, cardGradient };
  };

  const fetchWeather = async (latitude: number, longitude: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,apparent_temperature`
      );
      if (!res.ok) throw new Error('Weather API call failed');
      const data = await res.json();
      const current = data.current;
      const windSpd = Math.round(current.wind_speed_10m || 0);

      setWeather({
        temp: Math.round(current.temperature_2m),
        feelsLike: Math.round(current.apparent_temperature ?? current.temperature_2m),
        condition: '',
        weatherCode: current.weather_code,
        humidity: current.relative_humidity_2m,
        windSpeed: windSpd,
        isWindy: windSpd > 18,
        lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });

      try {
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
        );
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          const city =
            geoData.address?.city ||
            geoData.address?.town ||
            geoData.address?.suburb ||
            geoData.address?.district ||
            'Hassan';
          const state = geoData.address?.state || 'Karnataka';
          setLocationName(`${city}, ${state}`);
        }
      } catch {
        // Keep default
      }
    } catch {
      setWeather({
        temp: 26,
        feelsLike: 27,
        condition: 'SUNNY',
        weatherCode: 0,
        humidity: 62,
        windSpeed: 14,
        isWindy: false,
        lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(currentCoords.lat, currentCoords.lng);
  }, [currentCoords.lat, currentCoords.lng]);

  const handleDetectLocation = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      setIsDetecting(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsDetecting(false);
          const newLat = pos.coords.latitude;
          const newLng = pos.coords.longitude;
          setCurrentCoords({ lat: newLat, lng: newLng });
          if (onLocationUpdate) onLocationUpdate(newLat, newLng);
        },
        () => {
          setIsDetecting(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  };

  const parsed = weather ? parseWeatherCode(weather.weatherCode, weather.windSpeed) : null;
  const WeatherIcon = parsed?.Icon || Sun;

  return (
    <>
      <div className="w-full h-full rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_8px_28px_rgba(15,23,42,0.05)] overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(15,23,42,0.1)]">
        
        {/* ================================================================= */}
        {/* UPPER SECTION: LIVE WEATHER MONITOR (LARGER READABLE TEXT)       */}
        {/* ================================================================= */}
        <div className={`p-4 sm:p-4.5 bg-gradient-to-b ${parsed?.cardGradient || 'from-amber-500/10 to-transparent'} border-b border-slate-100 dark:border-slate-800/80 space-y-3 flex-1 flex flex-col justify-between`}>
          
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-500 shrink-0 animate-pulse" />
              <span className="text-xs sm:text-[13px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">
                LIVE WEATHER MONITOR
              </span>
            </div>

            <div className="flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-300">
              <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
              <span className="truncate max-w-[120px]">{locationName}</span>
            </div>
          </div>

          {/* Temperature & Icon */}
          <div className="flex items-center justify-between gap-3 my-1">
            <div className="space-y-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight font-sans">
                  {loading ? '--' : `${weather?.temp}°C`}
                </span>
                <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-bold">
                  Feels {weather?.feelsLike ?? weather?.temp ?? '--'}°
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] sm:text-xs font-black uppercase tracking-wider border ${
                    parsed?.badgeBg || 'bg-amber-500/15 text-amber-600 border-amber-500/30'
                  }`}
                >
                  {loading ? 'CHECKING...' : parsed?.condition}
                </span>
              </div>
            </div>

            {/* Icon Box */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50/90 dark:bg-slate-800/90 border border-sky-100 dark:border-slate-700/80 shadow-inner">
              <WeatherIcon className={`h-6 w-6 ${parsed?.iconColor || 'text-amber-500'} animate-pulse`} />
            </div>
          </div>

          {/* Metrics & Controls Bar */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/60 text-xs font-bold text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1" title="Humidity">
                <Droplets className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                <strong className="text-slate-900 dark:text-white">{weather?.humidity ?? 62}%</strong>
              </div>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <div className="flex items-center gap-1" title="Wind Speed">
                <Wind className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
                <strong className="text-slate-900 dark:text-white">{weather?.windSpeed ?? 14}km/h</strong>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={isDetecting}
                className="flex items-center gap-1 rounded-xl border border-blue-500/20 bg-blue-500/10 px-2 py-1 text-xs font-black uppercase text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition disabled:opacity-50"
                title="Detect Current GPS Location"
              >
                <LocateFixed className={`h-3 w-3 text-blue-500 ${isDetecting ? 'animate-spin' : ''}`} />
                <span>GPS</span>
              </button>

              <button
                type="button"
                onClick={() => fetchWeather(currentCoords.lat, currentCoords.lng)}
                disabled={loading}
                className="flex h-7 w-7 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition shrink-0"
                title="Refresh Weather Data"
              >
                <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* LOWER SECTION: COMPACT GOLD HELPLINE STRIP                        */}
        {/* ================================================================= */}
        <div className="p-3.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 text-slate-950 flex flex-col justify-center items-center gap-1.5 border-t border-amber-500/40">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-950/80">
            24×7 Municipal Helpline
          </span>
          <button
            type="button"
            onClick={() => setIsHelpDeskOpen(true)}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-950 hover:bg-slate-900 text-amber-300 py-2.5 px-3.5 text-xs sm:text-sm font-black transition shadow-md border border-amber-500/30 group hover:scale-[1.02] active:scale-[0.99] helpline-glow"
            title="Open Emergency Department Helplines"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-slate-950 font-bold group-hover:animate-bounce">
              <PhoneCall className="h-3.5 w-3.5" />
            </div>
            <span className="tracking-wider uppercase text-white font-black">EMERGENCY DEPT</span>
          </button>
        </div>
      </div>

      {/* Help Desk Modal Dialog */}
      <HelpDeskModal isOpen={isHelpDeskOpen} onClose={() => setIsHelpDeskOpen(false)} />
    </>
  );
}
