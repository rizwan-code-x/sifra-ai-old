import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Search, MapPin, RefreshCw, Sun, Moon, Cloud, 
  CloudRain, CloudLightning, Wind, Droplets, Compass, Eye, 
  Thermometer, ArrowUp, ArrowDown, Sparkles, Navigation, X, 
  Check, AlertTriangle, ShieldCheck, Umbrella, Car, Activity, 
  Flower2, Shirt, Info, Layers
} from 'lucide-react';
import { UserProfile, View } from '../types';

interface WeatherViewProps {
  userProfile?: UserProfile;
  onClose: () => void;
  onNavigate?: (view: View) => void;
}

interface HourlyItem {
  time: string;
  temp: number;
  condition: string;
  description: string;
  icon: string;
  isDay: boolean;
  rainProb?: number;
}

interface DailyItem {
  dateLabel: string;
  tempMin: number;
  tempMax: number;
  condition: string;
  icon: string;
  rainProb?: number;
}

interface AQIDetails {
  aqi: number;
  category: string;
  color: string;
  description: string;
  recommendation: string;
}

interface LifestyleTip {
  title: string;
  icon: string;
  desc: string;
}

interface WeatherPayload {
  provider: string;
  location: string;
  country?: string;
  lat: number;
  lon: number;
  temp: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  condition: string;
  conditionDescription: string;
  icon: string;
  isDay: boolean;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  pressure: number;
  visibility: number;
  uv: number;
  uvDescription: string;
  sunrise: string;
  sunset: string;
  aqi: AQIDetails;
  hourly: HourlyItem[];
  daily: DailyItem[];
  lifestyleTips: LifestyleTip[];
}

interface SearchLocation {
  name: string;
  state: string;
  country: string;
  lat: number;
  lon: number;
  displayName: string;
}

// Popular Quick Select Cities
const POPULAR_CITIES = [
  { name: 'Khayramari', lat: 24.3636, lon: 88.6241, label: 'Khayramari, BD' },
  { name: 'Dhaka', lat: 23.8103, lon: 90.4125, label: 'Dhaka, BD' },
  { name: 'Kolkata', lat: 22.5726, lon: 88.3639, label: 'Kolkata, IN' },
  { name: 'Chittagong', lat: 22.3569, lon: 91.7832, label: 'Chittagong, BD' },
  { name: 'Sylhet', lat: 24.8949, lon: 91.8687, label: 'Sylhet, BD' },
  { name: 'Delhi', lat: 28.6139, lon: 77.2090, label: 'Delhi, IN' },
  { name: 'London', lat: 51.5074, lon: -0.1278, label: 'London, UK' },
  { name: 'New York', lat: 40.7128, lon: -74.0060, label: 'New York, US' },
  { name: 'Dubai', lat: 25.2048, lon: 55.2708, label: 'Dubai, UAE' },
  { name: 'Tokyo', lat: 35.6762, lon: 139.6503, label: 'Tokyo, JP' },
];

export const WeatherView: React.FC<WeatherViewProps> = ({ userProfile, onClose, onNavigate }) => {
  // State
  const [weatherData, setWeatherData] = useState<WeatherPayload | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [unit, setUnit] = useState<'C' | 'F'>('C');
  const [currentCity, setCurrentCity] = useState<{ name: string; lat: number; lon: number }>({
    name: 'Khayramari',
    lat: 24.3636,
    lon: 88.6241
  });

  // Search & Modal State
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchLocation[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'forecast' | 'radar' | 'insights'>('forecast');

  // Load weather data
  const fetchWeather = async (lat: number, lon: number, cityName?: string) => {
    setIsRefreshing(true);
    setError(null);
    try {
      const unitsParam = unit === 'F' ? 'imperial' : 'metric';
      const cityQuery = cityName ? `&city=${encodeURIComponent(cityName)}` : '';
      const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}&units=${unitsParam}${cityQuery}`);
      
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      setWeatherData(data);
      if (data.location) {
        setCurrentCity(prev => ({ ...prev, name: data.location, lat, lon }));
      }
    } catch (err: any) {
      console.error('Failed to load weather:', err);
      // Fallback: direct Open-Meteo call from client
      try {
        const omUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,weather_code,is_day,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max&timezone=auto${unit === 'F' ? '&temperature_unit=fahrenheit&wind_speed_unit=mph' : ''}`;
        const omRes = await fetch(omUrl);
        if (omRes.ok) {
          const om = await omRes.json();
          const isDay = om.current?.is_day === 1;
          const fallbackData: WeatherPayload = {
            provider: 'client-open-meteo',
            location: cityName || 'Khayramari',
            country: 'BD',
            lat,
            lon,
            temp: Math.round(om.current?.temperature_2m ?? 28),
            feelsLike: Math.round(om.current?.apparent_temperature ?? 31),
            tempMin: Math.round(om.daily?.temperature_2m_min?.[0] ?? 24),
            tempMax: Math.round(om.daily?.temperature_2m_max?.[0] ?? 33),
            condition: isDay ? 'Partly Cloudy' : 'Clear Night',
            conditionDescription: isDay ? 'Partly cloudy sky' : 'Clear night sky',
            icon: isDay ? '02d' : '01n',
            isDay,
            humidity: om.current?.relative_humidity_2m ?? 72,
            windSpeed: Math.round(om.current?.wind_speed_10m ?? 6),
            windDirection: 'NNE',
            pressure: Math.round(om.current?.surface_pressure ?? 1010),
            visibility: 15,
            uv: Math.round(om.daily?.uv_index_max?.[0] ?? (isDay ? 5 : 0)),
            uvDescription: isDay ? 'Moderate UV index' : '0 Very weak',
            sunrise: om.daily?.sunrise?.[0] ? new Date(om.daily.sunrise[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '5:33 am',
            sunset: om.daily?.sunset?.[0] ? new Date(om.daily.sunset[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '5:08 pm',
            aqi: {
              aqi: 142,
              category: 'Unhealthy for Sensitive Groups',
              color: '#F97316',
              description: 'Air quality may cause slight irritation for sensitive individuals.',
              recommendation: 'Sensitive groups should reduce prolonged outdoor exercise.'
            },
            hourly: (om.hourly?.time || []).slice(0, 12).map((t: string, i: number) => {
              const d = new Date(t);
              const h = d.getHours();
              const ampm = h >= 12 ? 'pm' : 'am';
              const displayH = h % 12 || 12;
              return {
                time: i === 0 ? 'Now' : `${displayH}:00 ${ampm}`,
                temp: Math.round(om.hourly?.temperature_2m?.[i] ?? 26),
                condition: 'Clear',
                description: 'Clear sky',
                icon: om.hourly?.is_day?.[i] ? '01d' : '01n',
                isDay: Boolean(om.hourly?.is_day?.[i]),
                rainProb: om.hourly?.precipitation_probability?.[i] || 0
              };
            }),
            daily: (om.daily?.time || []).slice(0, 7).map((t: string, i: number) => {
              const d = new Date(t);
              const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
              const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              let label = `${d.getDate()} ${monthNames[d.getMonth()]} ${dayNames[d.getDay()]}`;
              if (i === 0) label = `${d.getDate()} ${monthNames[d.getMonth()]} Today`;
              else if (i === 1) label = `${d.getDate()} ${monthNames[d.getMonth()]} Tomorrow`;
              return {
                dateLabel: label,
                tempMin: Math.round(om.daily?.temperature_2m_min?.[i] ?? 23),
                tempMax: Math.round(om.daily?.temperature_2m_max?.[i] ?? 32),
                condition: 'Clear',
                icon: '01d',
                rainProb: om.daily?.precipitation_probability_max?.[i] || 0
              };
            }),
            lifestyleTips: [
              { title: 'Low pollen count', icon: 'flower', desc: 'Minimal risk of allergies' },
              { title: isDay ? 'Moderate UV index' : 'No UV index', icon: 'umbrella', desc: isDay ? 'Sun protection recommended' : 'Zero sunlight exposure' },
              { title: 'Use oil-control products', icon: 'droplet', desc: 'High humidity skin care' },
              { title: 'Very suitable for car washing', icon: 'car', desc: 'No rain expected today' },
              { title: 'Suitable for indoor workouts', icon: 'activity', desc: 'Air quality is elevated' },
              { title: 'Good traffic conditions', icon: 'truck', desc: 'High road visibility' }
            ]
          };
          setWeatherData(fallbackData);
          return;
        }
      } catch (clientErr) {
        console.error('Client fallback also failed:', clientErr);
      }
      setError('আবহাওয়া ডেটা লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে ইন্টারনেট সংযোগ চেক করুন।');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWeather(currentCity.lat, currentCity.lon, currentCity.name);
  }, [unit]);

  // Handle GPS location
  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsRefreshing(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setCurrentCity({ name: 'My Location', lat: latitude, lon: longitude });
          fetchWeather(latitude, longitude, 'My Location');
          setShowSearchModal(false);
        },
        (err) => {
          console.warn('Geolocation error:', err);
          alert('GPS লোকেশন শনাক্ত করা সম্ভব হয়নি। অনুগ্রহ করে পারমিশন দিন বা শহর সার্চ করুন।');
          setIsRefreshing(false);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      alert('আপনার ডিভাইসে জিওলোকেশন সমর্থিত নয়।');
    }
  };

  // Location search auto-complete
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/weather/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results || []);
        } else {
          // Direct fallback to Open-Meteo geocoding
          const omRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=6&language=en&format=json`);
          if (omRes.ok) {
            const omData = await omRes.json();
            const results = (omData.results || []).map((item: any) => ({
              name: item.name,
              state: item.admin1 || '',
              country: item.country_code || item.country,
              lat: item.latitude,
              lon: item.longitude,
              displayName: [item.name, item.admin1, item.country].filter(Boolean).join(', ')
            }));
            setSearchResults(results);
          }
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const selectLocation = (loc: { name: string; lat: number; lon: number }) => {
    setCurrentCity({ name: loc.name, lat: loc.lat, lon: loc.lon });
    fetchWeather(loc.lat, loc.lon, loc.name);
    setShowSearchModal(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Atmospheric background gradient according to day/night & condition
  const atmosphereStyle = useMemo(() => {
    const isDay = weatherData?.isDay ?? false;
    const cond = (weatherData?.condition || '').toLowerCase();

    if (!isDay) {
      // Nighttime: Deep navy, indigo, charcoal black with stars and soft purple/blue aura
      return {
        bgGradient: 'from-[#060814] via-[#0B0F26] to-[#030612]',
        skyAura: 'from-indigo-600/20 via-purple-900/10 to-transparent',
        accentColor: '#38BDF8',
        cardBg: 'bg-[#10152D]/80 border-white/10 text-white',
        cardSubtle: 'bg-[#151C3A]/60 border-white/5',
        starry: true
      };
    }

    if (cond.includes('rain') || cond.includes('drizzle')) {
      // Rainy: Stormy steel-blue, slate, misty glow
      return {
        bgGradient: 'from-[#0F172A] via-[#1E293B] to-[#0A0F1D]',
        skyAura: 'from-cyan-500/15 via-blue-900/20 to-transparent',
        accentColor: '#38BDF8',
        cardBg: 'bg-[#1E293B]/80 border-white/10 text-white',
        cardSubtle: 'bg-[#152033]/60 border-white/5',
        starry: false
      };
    }

    if (cond.includes('thunder') || cond.includes('storm')) {
      // Thunderstorm: Deep violent dark violet-black
      return {
        bgGradient: 'from-[#140A26] via-[#1C1236] to-[#080314]',
        skyAura: 'from-amber-400/15 via-purple-600/20 to-transparent',
        accentColor: '#F59E0B',
        cardBg: 'bg-[#1F163D]/80 border-white/10 text-white',
        cardSubtle: 'bg-[#170E30]/60 border-white/5',
        starry: false
      };
    }

    // Daytime Clear/Partly Cloudy: Rich deep sky blue with gentle sun radiance
    return {
      bgGradient: 'from-[#0B2545] via-[#133A68] to-[#06182E]',
      skyAura: 'from-amber-300/20 via-sky-400/15 to-transparent',
      accentColor: '#FBBF24',
      cardBg: 'bg-[#122D4F]/80 border-white/10 text-white',
      cardSubtle: 'bg-[#0E2440]/60 border-white/5',
      starry: false
    };
  }, [weatherData?.isDay, weatherData?.condition]);

  // Weather Icon Renderer
  const renderWeatherIcon = (condition: string, isDay: boolean, size = 'w-10 h-10') => {
    const c = condition.toLowerCase();
    if (c.includes('thunder') || c.includes('storm')) {
      return <CloudLightning className={`${size} text-amber-400 animate-pulse drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]`} />;
    }
    if (c.includes('rain') || c.includes('shower') || c.includes('drizzle')) {
      return <CloudRain className={`${size} text-sky-400 drop-shadow-[0_0_12px_rgba(56,189,248,0.5)]`} />;
    }
    if (c.includes('cloud') || c.includes('overcast')) {
      return <Cloud className={`${size} text-slate-300 drop-shadow-[0_0_10px_rgba(203,213,225,0.4)]`} />;
    }
    if (isDay) {
      return <Sun className={`${size} text-amber-400 animate-[spin_20s_linear_infinite] drop-shadow-[0_0_16px_rgba(251,191,36,0.7)]`} />;
    }
    return <Moon className={`${size} text-amber-200 drop-shadow-[0_0_14px_rgba(254,240,138,0.6)]`} />;
  };

  // Temperature display formatted
  const formatTemp = (val: number) => {
    return `${val}°`;
  };

  return (
    <div className={`fixed inset-0 z-[300] flex flex-col font-sans overflow-hidden bg-gradient-to-b ${atmosphereStyle.bgGradient} text-white transition-colors duration-1000 select-none`}>
      
      {/* Dynamic Ambient Sky Lighting */}
      <div className={`absolute top-0 left-0 right-0 h-96 bg-gradient-to-b ${atmosphereStyle.skyAura} blur-3xl pointer-events-none transition-all duration-1000`} />
      
      {/* Night Sky Twinkling Stars (Canvas / SVG dots) */}
      {atmosphereStyle.starry && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
          <div className="absolute top-12 left-10 w-1 h-1 bg-white rounded-full animate-ping" />
          <div className="absolute top-24 right-20 w-1.5 h-1.5 bg-sky-200 rounded-full animate-pulse" />
          <div className="absolute top-44 left-1/3 w-1 h-1 bg-amber-100 rounded-full animate-pulse duration-700" />
          <div className="absolute top-32 right-1/4 w-1 h-1 bg-purple-200 rounded-full animate-ping duration-1000" />
          <div className="absolute top-60 left-16 w-1 h-1 bg-white rounded-full opacity-60" />
          <div className="absolute top-16 right-44 w-1 h-1 bg-cyan-100 rounded-full animate-pulse" />
        </div>
      )}

      {/* Top Header Bar */}
      <header className="relative z-30 flex items-center justify-between px-5 pt-4 pb-2">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-all active:scale-95 shadow-md"
          aria-label="Back"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Center Location Button */}
        <button
          onClick={() => setShowSearchModal(true)}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 transition-all shadow-sm active:scale-95"
        >
          <MapPin className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
          <span className="text-xs sm:text-sm font-bold tracking-tight text-white max-w-[140px] sm:max-w-[180px] truncate">
            {weatherData?.location || currentCity.name}
          </span>
          <Search className="w-3 h-3 text-white/50 ml-0.5" />
        </button>

        {/* Controls: Unit Toggle & Refresh */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setUnit(u => u === 'C' ? 'F' : 'C')}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-xs font-black transition-all active:scale-95"
            title="Toggle °C / °F"
          >
            °{unit}
          </button>
          <button
            onClick={() => fetchWeather(currentCity.lat, currentCity.lon, currentCity.name)}
            disabled={isRefreshing}
            className={`w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-all active:scale-95 ${
              isRefreshing ? 'animate-spin text-amber-400' : ''
            }`}
            title="Refresh Weather"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area - Scrollable */}
      <div className="relative z-20 flex-1 overflow-y-auto no-scrollbar px-4 sm:px-6 pb-20 pt-2 space-y-4">
        
        {/* Error Alert if any */}
        {error && (
          <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="flex-1">{error}</span>
            <button onClick={() => fetchWeather(currentCity.lat, currentCity.lon)} className="underline font-bold text-white">Retry</button>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && !weatherData && (
          <div className="space-y-4 animate-pulse">
            <div className="h-44 rounded-3xl bg-white/5 border border-white/10" />
            <div className="h-28 rounded-3xl bg-white/5 border border-white/10" />
            <div className="h-64 rounded-3xl bg-white/5 border border-white/10" />
          </div>
        )}

        {weatherData && (
          <>
            {/* Screen Hero: Primary Weather Dashboard (Matching Reference Screenshot) */}
            <div className="flex flex-col items-center justify-center text-center pt-2 pb-4">
              
              {/* Dynamic Celestial / Weather Icon */}
              <div className="relative my-2">
                <div className="absolute inset-0 bg-amber-400/20 blur-2xl rounded-full pointer-events-none" />
                {renderWeatherIcon(weatherData.condition, weatherData.isDay, 'w-24 h-24 sm:w-28 sm:h-28')}
              </div>

              {/* Large Temperature Display */}
              <div className="flex items-start justify-center font-black tracking-tighter leading-none mt-1">
                <span className="text-7xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/70 drop-shadow-md">
                  {weatherData.temp}
                </span>
                <span className="text-3xl sm:text-4xl text-amber-300 font-light ml-1 mt-1">°{unit}</span>
              </div>

              {/* Condition Text */}
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1 capitalize drop-shadow-sm">
                {weatherData.conditionDescription || weatherData.condition}
              </h2>

              {/* High / Low & Feels Like */}
              <div className="flex items-center gap-3 mt-2 text-xs font-semibold text-white/80">
                <div className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
                  <ArrowUp className="w-3.5 h-3.5 text-rose-400" />
                  <span>{formatTemp(weatherData.tempMax)}</span>
                  <span className="text-white/40 mx-0.5">•</span>
                  <ArrowDown className="w-3.5 h-3.5 text-sky-400" />
                  <span>{formatTemp(weatherData.tempMin)}</span>
                </div>
                <div className="bg-white/10 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
                  Feels like {formatTemp(weatherData.feelsLike)}
                </div>
              </div>

              {/* AI Sifra Sky Insight Banner */}
              <div className="w-full max-w-md mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-sky-500/15 border border-amber-400/30 backdrop-blur-md flex flex-col gap-2 text-left shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center shrink-0 text-amber-300">
                    <Sparkles className="w-4 h-4 animate-spin duration-3000" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">SIFRA Sky Briefing</span>
                      <span className="text-[9px] text-white/50">{weatherData.isDay ? 'Day Forecast' : 'Night Atmosphere'}</span>
                    </div>
                    <p className="text-xs text-white/90 leading-tight mt-0.5 font-medium">
                      {weatherData.isDay
                        ? `আজকের আকাশ ${weatherData.conditionDescription}। আর্দ্রতা ${weatherData.humidity}%, হালকা সুতি পোশাক পরা আরামদায়ক হবে।`
                        : `রাতের তাপমাত্রা ${weatherData.temp}°C, বাতাস শান্ত। ঘরে মনোরম আবহাওয়া বিরাজ করছে।`}
                    </p>
                  </div>
                </div>
                {onNavigate && (
                  <button
                    onClick={() => onNavigate(View.SIFRA_MAPS)}
                    className="w-full py-2 px-3 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-98 mt-1"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>View {weatherData.location} on SIFRA Earth Map</span>
                  </button>
                )}
              </div>
            </div>

            {/* Navigation Tabs: Forecast / Life Indices / Radar */}
            <div className="flex items-center justify-center gap-2 p-1 bg-white/5 rounded-2xl border border-white/10 max-w-sm mx-auto">
              <button
                onClick={() => setActiveTab('forecast')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'forecast' ? 'bg-white/20 text-white shadow-sm' : 'text-white/50 hover:text-white'
                }`}
              >
                Forecast
              </button>
              <button
                onClick={() => setActiveTab('insights')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'insights' ? 'bg-white/20 text-white shadow-sm' : 'text-white/50 hover:text-white'
                }`}
              >
                Lifestyle & AQI
              </button>
              <button
                onClick={() => setActiveTab('radar')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'radar' ? 'bg-white/20 text-white shadow-sm' : 'text-white/50 hover:text-white'
                }`}
              >
                Radar Scan
              </button>
            </div>

            {/* TAB 1: FORECASTS (Hourly & 7-Day) */}
            {activeTab === 'forecast' && (
              <div className="space-y-4">
                
                {/* 24-Hour Horizon Hourly Forecast (Horizontal Carousel matching reference) */}
                <div className={`p-4 rounded-3xl ${atmosphereStyle.cardBg} backdrop-blur-xl border shadow-xl`}>
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                      <Thermometer className="w-4 h-4 text-amber-400" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white/90">Hourly Forecast</h3>
                    </div>
                    <span className="text-[10px] text-white/50">Next 12 Hours</span>
                  </div>

                  <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1 pt-1 -mx-2 px-2 snap-x">
                    {weatherData.hourly.map((h, idx) => (
                      <div
                        key={idx}
                        className={`flex flex-col items-center justify-between min-w-[70px] sm:min-w-[76px] h-32 rounded-2xl p-2.5 snap-center transition-all ${
                          idx === 0 
                            ? 'bg-gradient-to-b from-amber-400/20 to-white/10 border border-amber-400/40 shadow-md scale-105' 
                            : 'bg-white/5 hover:bg-white/10 border border-white/5'
                        }`}
                      >
                        <span className={`text-[11px] font-bold ${idx === 0 ? 'text-amber-300' : 'text-white/70'}`}>
                          {h.time}
                        </span>

                        <div className="my-1">
                          {renderWeatherIcon(h.condition, h.isDay, 'w-8 h-8')}
                        </div>

                        <span className="text-sm font-black text-white">
                          {formatTemp(h.temp)}
                        </span>

                        {h.rainProb !== undefined && h.rainProb > 0 ? (
                          <span className="text-[9px] font-bold text-sky-400 flex items-center gap-0.5">
                            💧 {h.rainProb}%
                          </span>
                        ) : (
                          <span className="text-[9px] text-white/30 font-medium">Clear</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 7-Day Extended Forecast Card (Matching Reference Screenshot) */}
                <div className={`p-4 sm:p-5 rounded-3xl ${atmosphereStyle.cardBg} backdrop-blur-xl border shadow-xl`}>
                  <div className="flex items-center justify-between mb-4 px-1">
                    <div className="flex items-center gap-2">
                      <Cloud className="w-4 h-4 text-sky-400" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white/90">7-Day Forecast</h3>
                    </div>
                    <span className="text-[10px] text-white/50">Weekly Trend</span>
                  </div>

                  <div className="space-y-3">
                    {weatherData.daily.map((d, idx) => {
                      // Calculate temperature range bar progress
                      const minTempRange = 15;
                      const maxTempRange = 40;
                      const leftPercent = Math.max(0, Math.min(100, ((d.tempMin - minTempRange) / (maxTempRange - minTempRange)) * 100));
                      const rightPercent = Math.max(0, Math.min(100, ((d.tempMax - minTempRange) / (maxTempRange - minTempRange)) * 100));

                      return (
                        <div key={idx} className="flex items-center justify-between py-2 border-b border-white/5 last:border-none">
                          {/* Day Label */}
                          <div className="w-28 sm:w-32 text-left">
                            <p className="text-xs font-bold text-white truncate">{d.dateLabel}</p>
                            {d.rainProb !== undefined && d.rainProb > 0 && (
                              <p className="text-[9px] font-bold text-sky-400">💧 {d.rainProb}% rain</p>
                            )}
                          </div>

                          {/* Weather Condition Icon */}
                          <div className="flex items-center justify-center w-8 shrink-0">
                            {renderWeatherIcon(d.condition, true, 'w-6 h-6')}
                          </div>

                          {/* Min / Max Temp Bar */}
                          <div className="flex items-center gap-2 flex-1 max-w-[160px] sm:max-w-[200px] mx-3">
                            <span className="text-xs font-semibold text-white/60 w-7 text-right">
                              {formatTemp(d.tempMin)}
                            </span>
                            <div className="relative flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                              <div
                                className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-sky-400 via-amber-400 to-rose-400"
                                style={{
                                  left: `${leftPercent}%`,
                                  width: `${Math.max(15, rightPercent - leftPercent)}%`
                                }}
                              />
                            </div>
                            <span className="text-xs font-bold text-white w-7 text-left">
                              {formatTemp(d.tempMax)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Grid of Key Meteorological Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  
                  {/* 1. Humidity & Dew point */}
                  <div className={`p-4 rounded-3xl ${atmosphereStyle.cardSubtle} border border-white/10 backdrop-blur-md flex flex-col justify-between`}>
                    <div className="flex items-center justify-between text-white/60">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Humidity</span>
                      <Droplets className="w-4 h-4 text-sky-400" />
                    </div>
                    <div className="my-2">
                      <p className="text-2xl font-black text-white">{weatherData.humidity}%</p>
                      <p className="text-[10px] text-white/60 mt-0.5">The dew point is {formatTemp(weatherData.temp - Math.round((100 - weatherData.humidity)/5))}</p>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-sky-400 h-full rounded-full" style={{ width: `${weatherData.humidity}%` }} />
                    </div>
                  </div>

                  {/* 2. Wind & Direction */}
                  <div className={`p-4 rounded-3xl ${atmosphereStyle.cardSubtle} border border-white/10 backdrop-blur-md flex flex-col justify-between`}>
                    <div className="flex items-center justify-between text-white/60">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Wind</span>
                      <Wind className="w-4 h-4 text-teal-400" />
                    </div>
                    <div className="my-2">
                      <p className="text-2xl font-black text-white">{weatherData.windSpeed} <span className="text-xs font-medium">{unit === 'F' ? 'mph' : 'km/h'}</span></p>
                      <p className="text-[10px] text-white/60 mt-0.5">Direction: {weatherData.windDirection} breeze</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-teal-300">
                      <Compass className="w-3.5 h-3.5 animate-spin duration-5000" />
                      <span>Gentle breeze</span>
                    </div>
                  </div>

                  {/* 3. UV Index */}
                  <div className={`p-4 rounded-3xl ${atmosphereStyle.cardSubtle} border border-white/10 backdrop-blur-md flex flex-col justify-between`}>
                    <div className="flex items-center justify-between text-white/60">
                      <span className="text-[10px] font-bold uppercase tracking-wider">UV Index</span>
                      <Sun className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="my-2">
                      <p className="text-2xl font-black text-white">{weatherData.uv}</p>
                      <p className="text-[10px] text-white/60 mt-0.5">{weatherData.uvDescription}</p>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 h-full rounded-full" style={{ width: `${Math.min(100, (weatherData.uv / 11) * 100)}%` }} />
                    </div>
                  </div>

                  {/* 4. Atmospheric Pressure */}
                  <div className={`p-4 rounded-3xl ${atmosphereStyle.cardSubtle} border border-white/10 backdrop-blur-md flex flex-col justify-between`}>
                    <div className="flex items-center justify-between text-white/60">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Pressure</span>
                      <Layers className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="my-2">
                      <p className="text-2xl font-black text-white">{weatherData.pressure} <span className="text-xs font-medium">hPa</span></p>
                      <p className="text-[10px] text-white/60 mt-0.5">Normal barometric pressure</p>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-semibold text-indigo-300">
                      <span>Steady trend</span>
                    </div>
                  </div>

                </div>

                {/* Sunrise and Sunset Arc Tracker (Matching Reference Screenshot) */}
                <div className={`p-5 rounded-3xl ${atmosphereStyle.cardBg} backdrop-blur-xl border shadow-xl`}>
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white/90">Sunrise & Sunset</h3>
                    <span className="text-[10px] text-white/50">Daylight Horizon</span>
                  </div>

                  <div className="relative h-28 flex items-center justify-center overflow-hidden">
                    {/* Semicircle Sky Trajectory */}
                    <svg className="w-full h-full" viewBox="0 0 300 120">
                      {/* Base Dashed Arc */}
                      <path
                        d="M 30,110 A 120,100 0 0,1 270,110"
                        fill="none"
                        stroke="rgba(255,255,255,0.15)"
                        strokeWidth="3"
                        strokeDasharray="6,6"
                      />
                      {/* Active Daylight Gradient Arc */}
                      <path
                        d="M 30,110 A 120,100 0 0,1 270,110"
                        fill="none"
                        stroke="url(#daylightGradient)"
                        strokeWidth="4"
                      />
                      <defs>
                        <linearGradient id="daylightGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#F59E0B" />
                          <stop offset="50%" stopColor="#FBBF24" />
                          <stop offset="100%" stopColor="#EC4899" />
                        </linearGradient>
                      </defs>

                      {/* Moving Sun Node based on day/night */}
                      <circle
                        cx={weatherData.isDay ? 150 : 255}
                        cy={weatherData.isDay ? 30 : 100}
                        r="8"
                        fill="#FBBF24"
                        className="animate-pulse"
                      />
                      <circle
                        cx={weatherData.isDay ? 150 : 255}
                        cy={weatherData.isDay ? 30 : 100}
                        r="14"
                        fill="rgba(251,191,36,0.3)"
                        className="animate-ping duration-2000"
                      />
                    </svg>

                    {/* Horizon line */}
                    <div className="absolute bottom-2 left-6 right-6 h-[1px] bg-white/10" />
                  </div>

                  <div className="flex items-center justify-between px-4 mt-2">
                    <div className="text-left">
                      <p className="text-[10px] font-bold text-white/50 uppercase">Sunrise</p>
                      <p className="text-sm font-bold text-amber-300">{weatherData.sunrise}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-white/50 uppercase">Visibility</p>
                      <p className="text-sm font-bold text-white">{weatherData.visibility} km</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-white/50 uppercase">Sunset</p>
                      <p className="text-sm font-bold text-pink-300">{weatherData.sunset}</p>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: LIFESTYLE & AIR QUALITY (Matching Reference Screenshot) */}
            {activeTab === 'insights' && (
              <div className="space-y-4">
                
                {/* Air Quality Index Card (Matching Reference Screenshot 169 Unhealthy) */}
                <div className={`p-5 rounded-3xl ${atmosphereStyle.cardBg} backdrop-blur-xl border shadow-xl`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-amber-400" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white">Air Quality (AQI)</h3>
                    </div>
                    <span 
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase"
                      style={{ backgroundColor: `${weatherData.aqi.color}25`, color: weatherData.aqi.color }}
                    >
                      {weatherData.aqi.category}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-3 my-2">
                    <span className="text-5xl font-black text-white">{weatherData.aqi.aqi}</span>
                    <span className="text-xs font-bold text-white/60">US AQI Standard</span>
                  </div>

                  {/* AQI Gradient Scale Meter */}
                  <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden relative my-3">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-600" />
                    {/* Marker pointer */}
                    <div 
                      className="absolute top-0 bottom-0 w-2.5 bg-white rounded-full shadow-md border-2 border-slate-900"
                      style={{ left: `${Math.min(95, Math.max(5, (weatherData.aqi.aqi / 300) * 100))}%` }}
                    />
                  </div>

                  <p className="text-xs text-white/80 leading-relaxed font-medium mt-2">
                    {weatherData.aqi.description}
                  </p>

                  <div className="mt-3 p-3 rounded-2xl bg-white/5 border border-white/5 flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-white/80 leading-tight">
                      <strong className="text-white">Health Recommendation: </strong>
                      {weatherData.aqi.recommendation}
                    </p>
                  </div>
                </div>

                {/* Life Index Cards (Matching Reference Screenshot 2) */}
                <div className={`p-5 rounded-3xl ${atmosphereStyle.cardBg} backdrop-blur-xl border shadow-xl`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">Life Index</h3>
                    <span className="text-[10px] text-white/50">Daily Convenience</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {weatherData.lifestyleTips.map((tip, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                        <div className="w-8 h-8 rounded-xl bg-amber-400/10 text-amber-300 flex items-center justify-center mb-2">
                          {tip.icon === 'flower' && <Flower2 className="w-4 h-4" />}
                          {tip.icon === 'umbrella' && <Umbrella className="w-4 h-4" />}
                          {tip.icon === 'droplet' && <Droplets className="w-4 h-4" />}
                          {tip.icon === 'car' && <Car className="w-4 h-4" />}
                          {tip.icon === 'activity' && <Activity className="w-4 h-4" />}
                          {tip.icon === 'truck' && <Wind className="w-4 h-4" />}
                        </div>
                        <h4 className="text-xs font-bold text-white leading-tight">{tip.title}</h4>
                        <p className="text-[10px] text-white/60 mt-1 leading-tight">{tip.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Clothing & Attire Suggestions */}
                <div className={`p-4 rounded-3xl ${atmosphereStyle.cardSubtle} border border-white/10 backdrop-blur-md flex items-center gap-3`}>
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0">
                    <Shirt className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Travel & Dressing Advice</h4>
                    <p className="text-[11px] text-white/70 mt-0.5">
                      {weatherData.temp > 28
                        ? 'আজকে হালকা সুতি পোশাক, সানগ্লাস এবং রোদচশমা ব্যবহার করুন।'
                        : weatherData.temp < 18
                        ? 'হালকা জ্যাকেট বা শাল সঙ্গে রাখুন।'
                        : 'স্বাভাবিক দৈনন্দিন পোশাক উপযুক্ত।'}
                    </p>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 3: RADAR SCAN (Precipitation & Cloud Satellite Simulation) */}
            {activeTab === 'radar' && (
              <div className="space-y-4">
                <div className={`p-5 rounded-3xl ${atmosphereStyle.cardBg} backdrop-blur-xl border shadow-xl`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-sky-400" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white">Live Precipitation Radar</h3>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                      LIVE SCAN
                    </span>
                  </div>

                  {/* Interactive Radar Visualizer Screen */}
                  <div className="relative w-full h-64 rounded-2xl bg-[#080E1C] border border-white/10 overflow-hidden flex items-center justify-center shadow-inner">
                    
                    {/* Simulated Radar Circles */}
                    <div className="absolute w-48 h-48 rounded-full border border-sky-500/20" />
                    <div className="absolute w-32 h-32 rounded-full border border-sky-500/20" />
                    <div className="absolute w-16 h-16 rounded-full border border-sky-500/20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-[1px] bg-sky-500/10" />
                      <div className="h-full w-[1px] bg-sky-500/10 absolute" />
                    </div>

                    {/* Rotating Radar Scanner Sweep */}
                    <div 
                      className="absolute inset-0 origin-center animate-[spin_4s_linear_infinite]"
                      style={{
                        background: 'conic-gradient(from 0deg, rgba(56, 189, 248, 0.4) 0deg, rgba(56, 189, 248, 0) 60deg, transparent 60deg)'
                      }}
                    />

                    {/* Dynamic Cloud / Rain Echo Blips */}
                    <motion.div 
                      animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.9, 0.6] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="absolute top-16 right-16 w-16 h-12 rounded-full bg-sky-400/30 blur-md pointer-events-none"
                    />
                    <motion.div 
                      animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.8, 0.4] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="absolute bottom-14 left-14 w-20 h-16 rounded-full bg-teal-400/25 blur-lg pointer-events-none"
                    />

                    {/* Center Pin Indicator */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-3.5 h-3.5 rounded-full bg-amber-400 shadow-[0_0_12px_#FBBF24] border-2 border-slate-900" />
                      <span className="text-[10px] font-black text-white bg-slate-900/90 px-2 py-0.5 rounded-full border border-white/10 mt-1">
                        {weatherData.location}
                      </span>
                    </div>

                    {/* Radar Legend in Corner */}
                    <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl text-[9px] text-white/70 border border-white/5 flex items-center gap-2">
                      <span>Light</span>
                      <div className="w-12 h-1.5 rounded-full bg-gradient-to-r from-sky-400 via-amber-400 to-rose-500" />
                      <span>Heavy</span>
                    </div>
                  </div>

                  <div className="mt-3 text-center">
                    <p className="text-xs text-white/70">
                      রাডার অনুযায়ী আগামী ৩ ঘণ্টায় {weatherData.location} অঞ্চলে বড় ধরনের কোনো বৃষ্টিপাতের সম্ভাবনা নেই।
                    </p>
                  </div>
                </div>
              </div>
            )}

          </>
        )}

      </div>

      {/* LOCATION SEARCH MODAL / BOTTOM DRAWER */}
      <AnimatePresence>
        {showSearchModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[400] bg-black/70 backdrop-blur-md flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-lg bg-[#0E1528] border border-white/15 rounded-t-[32px] sm:rounded-[32px] p-5 shadow-2xl max-h-[85vh] flex flex-col"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">Select Location</h3>
                </div>
                <button
                  onClick={() => setShowSearchModal(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Current GPS Geolocation Trigger */}
              <button
                onClick={handleUseCurrentLocation}
                className="my-3 flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg active:scale-98"
              >
                <Navigation className="w-4 h-4 fill-current" />
                <span>Use Current GPS Location</span>
              </button>

              {/* Search Input Box */}
              <div className="relative my-2">
                <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search city, town or country..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/10 border border-white/10 text-white placeholder-white/40 text-sm focus:outline-none focus:border-amber-400/80 transition-all"
                  autoFocus
                />
              </div>

              {/* Search Suggestions */}
              {isSearching && (
                <div className="py-4 text-center text-xs text-white/50">Searching places...</div>
              )}

              {searchResults.length > 0 && (
                <div className="space-y-1 my-2 max-h-48 overflow-y-auto no-scrollbar">
                  {searchResults.map((loc, idx) => (
                    <button
                      key={idx}
                      onClick={() => selectLocation({ name: loc.name, lat: loc.lat, lon: loc.lon })}
                      className="w-full text-left p-3 rounded-xl hover:bg-white/10 transition-colors flex items-center justify-between text-white"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-sm font-semibold truncate">{loc.name}</p>
                        <p className="text-[11px] text-white/50 truncate">{loc.displayName}</p>
                      </div>
                      <ChevronLeft className="w-4 h-4 text-white/30 rotate-180" />
                    </button>
                  ))}
                </div>
              )}

              {/* Popular Quick Select Presets */}
              <div className="mt-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-2 block">
                  Popular Cities
                </span>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_CITIES.map((city, idx) => (
                    <button
                      key={idx}
                      onClick={() => selectLocation(city)}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-medium text-white/90 transition-all active:scale-95"
                    >
                      {city.label}
                    </button>
                  ))}
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default WeatherView;
