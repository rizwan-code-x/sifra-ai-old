/// <reference types="google.maps" />
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  Pin, 
  InfoWindow, 
  useMap, 
  useMapsLibrary 
} from '@vis.gl/react-google-maps';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Search, MapPin, Navigation, Compass, Layers, 
  Plus, Minus, Star, Heart, Share2, Phone, Clock, ArrowRight, 
  Car, Footprints, Bike, Bus, Volume2, VolumeX, X, Crosshair, 
  Sparkles, Check, AlertCircle, Bookmark, ExternalLink, Route as RouteIcon,
  Building, Hospital, Pill, Utensils, Fuel, GraduationCap, DollarSign,
  LocateFixed, Radio, Eye
} from 'lucide-react';
import { UserProfile } from '../types';

interface MapsViewProps {
  userProfile?: UserProfile;
  onClose: () => void;
  initialDestination?: string;
  initialSearchQuery?: string;
}

interface PlaceResult {
  id: string;
  name: string;
  address: string;
  location: { lat: number; lng: number };
  rating?: number;
  userRatingCount?: number;
  isOpen?: boolean;
  types?: string[];
  photoUrl?: string;
  phoneNumber?: string;
  category?: string;
}

interface SavedPlace {
  id: string;
  name: string;
  address: string;
  location: { lat: number; lng: number };
  tag: 'home' | 'work' | 'favorite' | 'custom';
  createdAt: number;
}

interface RouteStep {
  instruction: string;
  distance: string;
  duration: string;
  maneuver?: string;
}

interface RouteInfo {
  distanceText: string;
  distanceMeters: number;
  durationText: string;
  durationSeconds: number;
  startAddress: string;
  endAddress: string;
  steps: RouteStep[];
}

const GOOGLE_MAPS_API_KEY = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyCS6YAiZcSjhgchCKu-cMmCy1wA18B98WI';

// Default Location: Dhaka, Bangladesh (or Khayramari/Rajshahi)
const DEFAULT_CENTER = { lat: 23.8103, lng: 90.4125 };

// Quick Nearby Search Categories
const NEARBY_CATEGORIES = [
  { id: 'hospital', label: 'হাসপাতাল (Hospitals)', icon: <Hospital className="w-4 h-4 text-rose-400" />, type: 'hospital' },
  { id: 'pharmacy', label: 'ফার্মেসি (Pharmacy)', icon: <Pill className="w-4 h-4 text-emerald-400" />, type: 'pharmacy' },
  { id: 'restaurant', label: 'রেস্তোরাঁ (Food)', icon: <Utensils className="w-4 h-4 text-amber-400" />, type: 'restaurant' },
  { id: 'atm', label: 'এটিএম / ব্যাংক', icon: <DollarSign className="w-4 h-4 text-teal-400" />, type: 'bank' },
  { id: 'gas_station', label: 'পেট্রোল পাম্প', icon: <Fuel className="w-4 h-4 text-orange-400" />, type: 'gas_station' },
  { id: 'school', label: 'স্কুল / কলেজ', icon: <GraduationCap className="w-4 h-4 text-blue-400" />, type: 'school' },
];

// Inner Map Controller component to access useMap() and libraries
const MapContent: React.FC<{
  currentLocation: { lat: number; lng: number } | null;
  selectedPlace: PlaceResult | null;
  setSelectedPlace: (p: PlaceResult | null) => void;
  placesList: PlaceResult[];
  routeInfo: RouteInfo | null;
  setRouteInfo: (r: RouteInfo | null) => void;
  travelMode: google.maps.TravelMode;
  destinationCoords: { lat: number; lng: number } | null;
  trafficEnabled: boolean;
  mapType: string;
}> = ({
  currentLocation,
  selectedPlace,
  setSelectedPlace,
  placesList,
  routeInfo,
  setRouteInfo,
  travelMode,
  destinationCoords,
  trafficEnabled,
  mapType
}) => {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const placesLib = useMapsLibrary('places');
  const trafficLayerRef = useRef<google.maps.TrafficLayer | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

  // Manage Traffic Layer
  useEffect(() => {
    if (!map) return;
    if (trafficEnabled) {
      if (!trafficLayerRef.current) {
        trafficLayerRef.current = new google.maps.TrafficLayer();
      }
      trafficLayerRef.current.setMap(map);
    } else {
      if (trafficLayerRef.current) {
        trafficLayerRef.current.setMap(null);
      }
    }
  }, [map, trafficEnabled]);

  // Set Map Type (Roadmap, Satellite, Terrain, Hybrid)
  useEffect(() => {
    if (!map) return;
    map.setMapTypeId(mapType);
  }, [map, mapType]);

  // Handle Route Calculation when destination is provided
  useEffect(() => {
    if (!map || !routesLib || !currentLocation || !destinationCoords) {
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
      }
      setRouteInfo(null);
      return;
    }

    if (!directionsRendererRef.current) {
      directionsRendererRef.current = new google.maps.DirectionsRenderer({
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#F59E0B',
          strokeWeight: 6,
          strokeOpacity: 0.85
        }
      });
    }
    directionsRendererRef.current.setMap(map);

    const directionsService = new routesLib.DirectionsService();

    directionsService.route(
      {
        origin: currentLocation,
        destination: destinationCoords,
        travelMode: travelMode,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result && result.routes[0]) {
          directionsRendererRef.current?.setDirections(result);
          const route = result.routes[0];
          const leg = route.legs[0];

          if (leg) {
            const steps: RouteStep[] = leg.steps.map(s => ({
              instruction: s.instructions.replace(/<[^>]*>/g, ''), // Strip HTML tags
              distance: s.distance?.text || '',
              duration: s.duration?.text || '',
              maneuver: (s as any).maneuver || ''
            }));

            setRouteInfo({
              distanceText: leg.distance?.text || '',
              distanceMeters: leg.distance?.value || 0,
              durationText: leg.duration?.text || '',
              durationSeconds: leg.duration?.value || 0,
              startAddress: leg.start_address || '',
              endAddress: leg.end_address || '',
              steps
            });
          }
        } else {
          console.warn('Directions request failed due to ' + status);
        }
      }
    );

    return () => {
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
      }
    };
  }, [map, routesLib, currentLocation, destinationCoords, travelMode]);

  return (
    <>
      {/* User's Live Position Pulse Marker */}
      {currentLocation && (
        <AdvancedMarker position={currentLocation} title="Your Location">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-8 h-8 rounded-full bg-sky-500/30 animate-ping" />
            <div className="w-5 h-5 rounded-full bg-sky-500 border-2 border-white shadow-lg flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
          </div>
        </AdvancedMarker>
      )}

      {/* Markers for Searched / Nearby Places */}
      {placesList.map(place => (
        <AdvancedMarker
          key={place.id}
          position={place.location}
          title={place.name}
          onClick={() => setSelectedPlace(place)}
        >
          <div className="relative group cursor-pointer transition-transform hover:scale-110">
            <div className={`p-2 rounded-2xl shadow-xl flex items-center justify-center border ${
              selectedPlace?.id === place.id 
                ? 'bg-amber-500 text-slate-950 border-white scale-110 shadow-[0_0_20px_rgba(245,158,11,0.6)]' 
                : 'bg-slate-900/90 text-amber-400 border-amber-500/40 backdrop-blur-md'
            }`}>
              <MapPin className="w-4 h-4 fill-current" />
            </div>
            {/* Tooltip on marker */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap shadow-md pointer-events-none border border-white/10">
              {place.name}
            </div>
          </div>
        </AdvancedMarker>
      ))}

      {/* InfoWindow for Selected Place */}
      {selectedPlace && (
        <InfoWindow
          position={selectedPlace.location}
          onCloseClick={() => setSelectedPlace(null)}
          headerContent={
            <div className="font-bold text-xs text-slate-900 pr-2">
              {selectedPlace.name}
            </div>
          }
        >
          <div className="text-xs text-slate-600 max-w-xs space-y-1">
            <p className="text-[11px] leading-tight text-slate-700">{selectedPlace.address}</p>
            {selectedPlace.rating && (
              <div className="flex items-center gap-1 text-amber-600 font-bold text-[11px]">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span>{selectedPlace.rating} ({selectedPlace.userRatingCount || 0} reviews)</span>
              </div>
            )}
          </div>
        </InfoWindow>
      )}
    </>
  );
};

export const MapsView: React.FC<MapsViewProps> = ({
  userProfile,
  onClose,
  initialDestination,
  initialSearchQuery
}) => {
  // Navigation & UI States
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>(DEFAULT_CENTER);
  const [zoomLevel, setZoomLevel] = useState<number>(14);
  const [mapType, setMapType] = useState<string>('roadmap');
  const [trafficEnabled, setTrafficEnabled] = useState<boolean>(false);
  
  // Search & Places
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery || initialDestination || '');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [placesList, setPlacesList] = useState<PlaceResult[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Directions & Navigation
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [destinationName, setDestinationName] = useState<string>('');
  const [travelMode, setTravelMode] = useState<google.maps.TravelMode>('DRIVING' as google.maps.TravelMode);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [isVoiceGuidanceOn, setIsVoiceGuidanceOn] = useState<boolean>(true);
  const [showDirectionsDrawer, setShowDirectionsDrawer] = useState<boolean>(false);

  // Saved Favorites
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [showSavedDrawer, setShowSavedDrawer] = useState<boolean>(false);
  const [isQuotaExceeded, setIsQuotaExceeded] = useState<boolean>(false);

  useEffect(() => {
    const handleQuota = () => setIsQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  // Load Saved Places
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('sifra_saved_places') || '[]');
      setSavedPlaces(saved);
    } catch (e) {
      console.warn('Failed to load saved places');
    }
  }, []);

  // Save place to localStorage
  const handleSavePlace = (place: PlaceResult) => {
    const isAlreadySaved = savedPlaces.some(p => p.id === place.id);
    let updated: SavedPlace[];
    if (isAlreadySaved) {
      updated = savedPlaces.filter(p => p.id !== place.id);
    } else {
      const newPlace: SavedPlace = {
        id: place.id,
        name: place.name,
        address: place.address,
        location: place.location,
        tag: 'favorite',
        createdAt: Date.now()
      };
      updated = [newPlace, ...savedPlaces];
    }
    setSavedPlaces(updated);
    localStorage.setItem('sifra_saved_places', JSON.stringify(updated));
  };

  // Get Live Geolocation
  const requestCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCurrentLocation(coords);
          setMapCenter(coords);
          setZoomLevel(15);
        },
        (err) => {
          console.warn('Location permission issue:', err);
          // Fallback to Dhaka center
          setCurrentLocation(DEFAULT_CENTER);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setCurrentLocation(DEFAULT_CENTER);
    }
  }, []);

  useEffect(() => {
    requestCurrentLocation();
  }, [requestCurrentLocation]);

  // Voice Guidance: Reads out the active maneuver or next direction
  const speakDirection = useCallback((text: string) => {
    if (!isVoiceGuidanceOn || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'bn-BD';
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  }, [isVoiceGuidanceOn]);

  // Handle Search Submission
  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSelectedPlace(null);
    try {
      // 1. Geocode search query
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchQuery)}&key=${GOOGLE_MAPS_API_KEY}`;
      
      // Client-side direct Geocoding via google.maps if loaded, else fallback fetch
      if (window.google?.maps?.Geocoder) {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: searchQuery }, (results, status) => {
          setIsSearching(false);
          if (status === 'OK' && results && results[0]) {
            const loc = results[0].geometry.location;
            const newCenter = { lat: loc.lat(), lng: loc.lng() };
            setMapCenter(newCenter);
            setZoomLevel(15);

            const resultPlace: PlaceResult = {
              id: results[0].place_id || `place-${Date.now()}`,
              name: searchQuery,
              address: results[0].formatted_address,
              location: newCenter,
              category: 'Search Result'
            };

            setPlacesList([resultPlace]);
            setSelectedPlace(resultPlace);
          } else {
            alert('কোনো ফলাফল পাওয়া যায়নি। অনুগ্রহ করে অন্য নাম লিখে খুঁজুন।');
          }
        });
      } else {
        // Fallback Open-Meteo geocoding search for universal zero-fail experience
        const omRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=5&language=en&format=json`);
        if (omRes.ok) {
          const omData = await omRes.json();
          if (omData.results && omData.results.length > 0) {
            const best = omData.results[0];
            const newCoords = { lat: best.latitude, lng: best.longitude };
            setMapCenter(newCoords);
            setZoomLevel(15);

            const fallbackPlace: PlaceResult = {
              id: `om-${best.id}`,
              name: best.name,
              address: [best.name, best.admin1, best.country].filter(Boolean).join(', '),
              location: newCoords,
              category: 'Location'
            };
            setPlacesList([fallbackPlace]);
            setSelectedPlace(fallbackPlace);
          }
        }
        setIsSearching(false);
      }
    } catch (err) {
      console.error('Search error:', err);
      setIsSearching(false);
    }
  };

  // Nearby Search (Hospitals, ATMs, Restaurants, etc.)
  const handleCategorySearch = (catId: string, label: string) => {
    setActiveCategory(catId);
    setIsSearching(true);
    setSelectedPlace(null);

    const center = currentLocation || mapCenter;

    // Use PlacesService if available
    if (window.google?.maps?.places?.PlacesService) {
      const dummyElem = document.createElement('div');
      const service = new google.maps.places.PlacesService(dummyElem);

      service.textSearch(
        {
          location: center,
          radius: 4000,
          query: catId
        },
        (results, status) => {
          setIsSearching(false);
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            const parsed: PlaceResult[] = results.slice(0, 10).map((r, i) => ({
              id: r.place_id || `place-${i}`,
              name: r.name || 'Unnamed Place',
              address: r.formatted_address || r.vicinity || '',
              location: {
                lat: r.geometry?.location?.lat() || center.lat,
                lng: r.geometry?.location?.lng() || center.lng
              },
              rating: r.rating,
              userRatingCount: r.user_ratings_total,
              isOpen: r.opening_hours?.isOpen?.(),
              types: r.types,
              category: label
            }));

            setPlacesList(parsed);
            if (parsed.length > 0) {
              setSelectedPlace(parsed[0]);
              setMapCenter(parsed[0].location);
              setZoomLevel(14);
            }
          }
        }
      );
    } else {
      setIsSearching(false);
    }
  };

  // Start Route Directions to a place
  const handleGetDirections = (place: PlaceResult) => {
    if (!currentLocation) {
      requestCurrentLocation();
    }
    setDestinationCoords(place.location);
    setDestinationName(place.name);
    setShowDirectionsDrawer(true);
  };

  // Clear active route
  const handleClearRoute = () => {
    setDestinationCoords(null);
    setDestinationName('');
    setRouteInfo(null);
    setIsNavigating(false);
    setShowDirectionsDrawer(false);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  return (
    <APIProvider 
      apiKey={GOOGLE_MAPS_API_KEY} 
      libraries={['places', 'routes', 'marker', 'geometry']}
      solutionChannel="GMP_VISGL_reactgooglemaps_v1.0.0"
    >
      <div className="fixed inset-0 z-[300] flex flex-col font-sans overflow-hidden bg-[#0A0D14] text-white select-none">
        
        {/* Quota Defense Banner */}
        {isQuotaExceeded && (
          <div className="bg-amber-500/90 text-slate-950 px-4 py-2 text-xs text-center sticky top-0 z-50 shadow-md font-bold flex items-center justify-center gap-1">
            <span>
              Google Maps Platform quota reached. Visit{' '}
              <a
                href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-black font-extrabold"
              >
                maps developer site
              </a>{' '}
              for details.
            </span>
          </div>
        )}
        
        {/* Top Header & Search Bar Overlay */}
        <div className="absolute top-0 left-0 right-0 z-30 p-3 sm:p-5 pointer-events-none safe-area-top">
          <div className="max-w-md mx-auto flex flex-col gap-2 pointer-events-auto">
            
            {/* Search Box Card */}
            <div className="flex items-center gap-2 p-1.5 sm:p-2 rounded-2xl bg-[#0F172A]/90 backdrop-blur-xl border border-white/15 shadow-2xl">
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all active:scale-95 shrink-0"
                aria-label="Back"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center relative">
                <Search className="w-4 h-4 text-amber-400 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search hospital, ATM, school, place..."
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 text-xs sm:text-sm focus:outline-none focus:border-amber-400/80 transition-all font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setPlacesList([]); setSelectedPlace(null); }}
                    className="absolute right-2.5 p-1 rounded-full text-white/40 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>

              {/* Saved Places Trigger */}
              <button
                onClick={() => setShowSavedDrawer(true)}
                title="Saved Places"
                className="w-9 h-9 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 transition-all active:scale-95"
              >
                <Bookmark className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Categories Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 px-0.5">
              {NEARBY_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySearch(cat.id, cat.label)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap backdrop-blur-md transition-all active:scale-95 shadow-sm border ${
                    activeCategory === cat.id 
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]' 
                      : 'bg-[#0F172A]/85 text-white/90 border-white/15 hover:bg-white/15'
                  }`}
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* Floating Map Action Controls (Right Side) */}
        <div className="absolute right-3 sm:right-5 top-28 sm:top-32 z-30 flex flex-col gap-2 pointer-events-auto">
          
          {/* Map Layer Switcher (Roadmap / Satellite / Terrain) */}
          <button
            onClick={() => {
              const types = ['roadmap', 'satellite', 'terrain'];
              const next = types[(types.indexOf(mapType) + 1) % types.length];
              setMapType(next);
            }}
            title={`Layer: ${mapType.toUpperCase()}`}
            className="w-10 h-10 rounded-2xl bg-[#0F172A]/90 hover:bg-[#1E293B] backdrop-blur-xl border border-white/20 text-white flex items-center justify-center shadow-xl active:scale-95 transition-all group"
          >
            <Layers className="w-5 h-5 text-amber-400 group-hover:rotate-45 transition-transform" />
          </button>

          {/* Traffic Toggle */}
          <button
            onClick={() => setTrafficEnabled(!trafficEnabled)}
            title="Toggle Live Traffic"
            className={`w-10 h-10 rounded-2xl backdrop-blur-xl border flex items-center justify-center shadow-xl active:scale-95 transition-all ${
              trafficEnabled 
                ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.5)]' 
                : 'bg-[#0F172A]/90 text-white border-white/20 hover:bg-[#1E293B]'
            }`}
          >
            <Radio className="w-5 h-5" />
          </button>

          {/* Recenter / Live Location Button */}
          <button
            onClick={requestCurrentLocation}
            title="My Live Location"
            className="w-10 h-10 rounded-2xl bg-[#0F172A]/90 hover:bg-[#1E293B] backdrop-blur-xl border border-white/20 text-sky-400 flex items-center justify-center shadow-xl active:scale-95 transition-all"
          >
            <LocateFixed className="w-5 h-5 animate-pulse" />
          </button>

          {/* Zoom In */}
          <button
            onClick={() => setZoomLevel(z => Math.min(20, z + 1))}
            title="Zoom In"
            className="w-10 h-10 rounded-2xl bg-[#0F172A]/90 hover:bg-[#1E293B] backdrop-blur-xl border border-white/20 text-white flex items-center justify-center shadow-xl active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5" />
          </button>

          {/* Zoom Out */}
          <button
            onClick={() => setZoomLevel(z => Math.max(3, z - 1))}
            title="Zoom Out"
            className="w-10 h-10 rounded-2xl bg-[#0F172A]/90 hover:bg-[#1E293B] backdrop-blur-xl border border-white/20 text-white flex items-center justify-center shadow-xl active:scale-95 transition-all"
          >
            <Minus className="w-5 h-5" />
          </button>

          {/* Clear Route Button if route is active */}
          {destinationCoords && (
            <button
              onClick={handleClearRoute}
              title="Clear Route"
              className="w-10 h-10 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white border border-rose-300 flex items-center justify-center shadow-xl active:scale-95 transition-all animate-bounce"
            >
              <X className="w-5 h-5" />
            </button>
          )}

        </div>

        {/* Live Interactive Google Map Canvas */}
        <div className="flex-1 w-full h-full relative">
          <Map
            mapId="DEMO_MAP_ID"
            defaultCenter={DEFAULT_CENTER}
            center={mapCenter}
            zoom={zoomLevel}
            onCenterChanged={(e) => setMapCenter(e.detail.center)}
            onZoomChanged={(e) => setZoomLevel(e.detail.zoom)}
            gestureHandling="greedy"
            disableDefaultUI={true}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{ width: '100%', height: '100%' }}
          >
            <MapContent
              currentLocation={currentLocation}
              selectedPlace={selectedPlace}
              setSelectedPlace={setSelectedPlace}
              placesList={placesList}
              routeInfo={routeInfo}
              setRouteInfo={setRouteInfo}
              travelMode={travelMode}
              destinationCoords={destinationCoords}
              trafficEnabled={trafficEnabled}
              mapType={mapType}
            />
          </Map>
        </div>

        {/* BOTTOM SHEET 1: Selected Place Card */}
        <AnimatePresence>
          {selectedPlace && !showDirectionsDrawer && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="absolute bottom-5 left-4 right-4 max-w-md mx-auto z-40 pointer-events-auto"
            >
              <div className="p-4 sm:p-5 rounded-3xl bg-[#0F172A]/95 backdrop-blur-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-white">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 pr-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                      {selectedPlace.category || 'Point of Interest'}
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-white tracking-tight truncate mt-0.5">
                      {selectedPlace.name}
                    </h3>
                    <p className="text-xs text-white/70 line-clamp-2 mt-0.5">
                      {selectedPlace.address}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedPlace(null)}
                    className="p-1 rounded-full text-white/50 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Rating & Status */}
                <div className="flex items-center gap-3 my-3 text-xs">
                  {selectedPlace.rating && (
                    <div className="flex items-center gap-1 text-amber-400 font-bold bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{selectedPlace.rating}</span>
                      <span className="text-white/40">({selectedPlace.userRatingCount || 0})</span>
                    </div>
                  )}
                  {selectedPlace.isOpen !== undefined && (
                    <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                      selectedPlace.isOpen ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {selectedPlace.isOpen ? 'Open Now' : 'Closed'}
                    </span>
                  )}
                </div>

                {/* Action Buttons: Directions, Save, Call */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                  <button
                    onClick={() => handleGetDirections(selectedPlace)}
                    className="py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
                  >
                    <RouteIcon className="w-4 h-4" />
                    <span>Get Directions</span>
                  </button>

                  <button
                    onClick={() => handleSavePlace(selectedPlace)}
                    className={`py-3 px-4 rounded-2xl border flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ${
                      savedPlaces.some(p => p.id === selectedPlace.id)
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                        : 'bg-white/5 hover:bg-white/10 border-white/15 text-white'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${savedPlaces.some(p => p.id === selectedPlace.id) ? 'fill-current' : ''}`} />
                    <span>{savedPlaces.some(p => p.id === selectedPlace.id) ? 'Saved' : 'Save'}</span>
                  </button>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* BOTTOM SHEET 2: Route & Turn-by-Turn Navigation Drawer */}
        <AnimatePresence>
          {showDirectionsDrawer && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 z-50 max-w-lg mx-auto bg-[#0E1528] border-t border-white/20 rounded-t-[32px] p-5 shadow-2xl max-h-[80vh] flex flex-col pointer-events-auto text-white"
            >
              {/* Drawer Handle & Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                    Route Guidance & Navigation
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white truncate max-w-xs">
                    To {destinationName || 'Destination'}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsVoiceGuidanceOn(!isVoiceGuidanceOn)}
                    title={isVoiceGuidanceOn ? 'Mute Voice Guidance' : 'Enable Voice Guidance'}
                    className={`p-2 rounded-xl border transition-all ${
                      isVoiceGuidanceOn ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-white/5 border-white/10 text-white/40'
                    }`}
                  >
                    {isVoiceGuidanceOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setShowDirectionsDrawer(false)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Travel Mode Selector: Driving, Walking, Bicycling, Transit */}
              <div className="grid grid-cols-4 gap-2 my-3">
                {[
                  { mode: 'DRIVING' as google.maps.TravelMode, label: 'Drive', icon: <Car className="w-4 h-4" /> },
                  { mode: 'WALKING' as google.maps.TravelMode, label: 'Walk', icon: <Footprints className="w-4 h-4" /> },
                  { mode: 'BICYCLING' as google.maps.TravelMode, label: 'Cycle', icon: <Bike className="w-4 h-4" /> },
                  { mode: 'TRANSIT' as google.maps.TravelMode, label: 'Transit', icon: <Bus className="w-4 h-4" /> },
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={() => setTravelMode(item.mode)}
                    className={`py-2 rounded-xl flex flex-col items-center gap-1 border text-xs font-bold transition-all ${
                      travelMode === item.mode 
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md scale-102' 
                        : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {item.icon}
                    <span className="text-[10px]">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Route Summary Overview (ETA & Distance) */}
              {routeInfo ? (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-sky-500/15 to-purple-500/20 border border-amber-500/30 my-2 flex items-center justify-between">
                  <div>
                    <span className="text-3xl font-black text-amber-400 tracking-tight">
                      {routeInfo.durationText}
                    </span>
                    <p className="text-xs text-white/70 font-semibold mt-0.5">
                      Distance: <strong className="text-white">{routeInfo.distanceText}</strong>
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setIsNavigating(true);
                      if (routeInfo.steps[0]) {
                        speakDirection(`যাত্রা শুরু হচ্ছে। ${routeInfo.steps[0].instruction}`);
                      }
                    }}
                    className={`py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-lg ${
                      isNavigating ? 'bg-emerald-500 text-slate-950' : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                    }`}
                  >
                    {isNavigating ? 'Active Nav' : 'Start Nav'}
                  </button>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-white/50">
                  Calculating route options...
                </div>
              )}

              {/* Step-by-Step Directions List */}
              {routeInfo && routeInfo.steps.length > 0 && (
                <div className="flex-1 overflow-y-auto no-scrollbar space-y-2.5 my-2 pr-1 max-h-48">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 block">
                    Turn-by-Turn Steps
                  </span>
                  {routeInfo.steps.map((step, idx) => (
                    <div 
                      key={idx}
                      onClick={() => speakDirection(step.instruction)}
                      className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-start gap-3 cursor-pointer transition-colors"
                    >
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                        {idx + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-white leading-snug">
                          {step.instruction}
                        </p>
                        <span className="text-[10px] text-white/50 font-mono mt-0.5 block">
                          {step.distance} • {step.duration}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>

        {/* BOTTOM SHEET 3: Saved Favorite Places Drawer */}
        <AnimatePresence>
          {showSavedDrawer && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 z-50 max-w-lg mx-auto bg-[#0E1528] border-t border-white/20 rounded-t-[32px] p-5 shadow-2xl max-h-[75vh] flex flex-col pointer-events-auto text-white"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">Saved Locations ({savedPlaces.length})</h3>
                </div>
                <button
                  onClick={() => setShowSavedDrawer(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar space-y-2.5 my-3 pr-1">
                {savedPlaces.length === 0 ? (
                  <div className="py-12 text-center text-white/40 flex flex-col items-center justify-center">
                    <Heart className="w-12 h-12 text-white/20 mb-2" />
                    <p className="text-sm font-bold text-white/70">No Saved Places Yet</p>
                    <p className="text-xs text-white/40 mt-1 max-w-xs">
                      Search any hospital, restaurant or address and tap "Save" to keep it here.
                    </p>
                  </div>
                ) : (
                  savedPlaces.map(p => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setMapCenter(p.location);
                        setZoomLevel(15);
                        setSelectedPlace({
                          id: p.id,
                          name: p.name,
                          address: p.address,
                          location: p.location,
                          category: 'Saved Favorite'
                        });
                        setShowSavedDrawer(false);
                      }}
                      className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                            {p.name}
                          </h4>
                          <p className="text-[11px] text-white/50 truncate mt-0.5">
                            {p.address}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const updated = savedPlaces.filter(item => item.id !== p.id);
                          setSavedPlaces(updated);
                          localStorage.setItem('sifra_saved_places', JSON.stringify(updated));
                        }}
                        className="p-2 text-white/40 hover:text-rose-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </APIProvider>
  );
};

export default MapsView;
