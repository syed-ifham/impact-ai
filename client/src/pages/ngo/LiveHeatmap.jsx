import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../auth/AuthContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Search, Link as LinkIcon, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CITY_COORDINATES = {
  "delhi": [28.6139, 77.2090],
  "new delhi": [28.6139, 77.2090],
  "mumbai": [19.0760, 72.8777],
  "bangalore": [12.9716, 77.5946],
  "bengaluru": [12.9716, 77.5946],
  "chennai": [13.0827, 80.2707],
  "kolkata": [22.5726, 88.3639],
  "hyderabad": [17.3850, 78.4867],
  "pune": [18.5204, 73.8567],
  "ahmedabad": [23.0225, 72.5714],
  "jaipur": [26.9124, 75.7873],
  "surat": [21.1702, 72.8311],
  "lucknow": [26.8467, 80.9462],
  "kanpur": [26.4499, 80.3319],
  "nagpur": [21.1458, 79.0882],
  "indore": [22.7196, 75.8577],
  "bhopal": [23.2599, 77.4126],
  "patna": [25.5941, 85.1376],
  "vadodara": [22.3072, 73.1812],
  "agra": [27.1767, 78.0081]
};

const CATEGORY_EMOJIS = {
  'Education': '📚',
  'Medical': '🏥',
  'Food': '🍲',
  'Environment': '🌱',
  'Disaster Relief': '🚨',
  'Housing': '🏠',
  'Animal Rescue': '🐾',
  'Tech Support': '💻',
  'Elder Care': '🧓',
  'Mentorship': '🤝',
  'Counseling': '🗣️',
  'Clean-up': '🧹',
  'Other': '📍'
};

const createEmojiIcon = (emoji) => {
  return L.divIcon({
    html: `<div style="font-size: 24px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3)); transform: translate(-50%, -100%); line-height: 1;">${emoji}</div>`,
    className: 'custom-emoji-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });
};

// Default focus to Kolkata, West Bengal
const MAP_CENTER = [22.5726, 88.3639];

const LiveHeatmap = () => {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState(new Set());

  const toggleCategory = (category) => {
    const newSet = new Set(selectedCategories);
    if (newSet.has(category)) newSet.delete(category);
    else newSet.add(category);
    setSelectedCategories(newSet);
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'tasks'), where('status', '==', 'open')));
        
        const cityCounts = {};

        // Add coordinates to each task based on city name matching
        const tasksWithCoords = snap.docs.map(doc => {
          const data = doc.data();
          let coords = null;
          
          if (data.location) {
            const locLower = data.location.toLowerCase();
            // Search dictionary
            for (const [city, latlng] of Object.entries(CITY_COORDINATES)) {
              if (locLower.includes(city)) {
                cityCounts[city] = (cityCounts[city] || 0) + 1;
                const count = cityCounts[city];
                
                // If multiple tasks are in the exact same city, spread them in a circle
                // so they don't overlap and hide each other
                if (count === 1) {
                  coords = [...latlng];
                } else {
                  // Creates a spiral/circle offset
                  const radius = 0.04 + (Math.floor(count / 8) * 0.02); 
                  const angle = count * (Math.PI / 3); 
                  coords = [
                    latlng[0] + (radius * Math.cos(angle)),
                    latlng[1] + (radius * Math.sin(angle))
                  ];
                }
                break;
              }
            }
          }
          
          return { id: doc.id, ...data, coords };
        });

        // Filter out tasks we couldn't geocode to keep map clean (or we could group them all at INDIA_CENTER)
        setTasks(tasksWithCoords.filter(t => t.coords));
      } catch (err) {
        console.error("Failed to load map data", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, [currentUser]);

  const displayedTasks = tasks.filter(task => {
    if (selectedCategories.size === 0) return true;
    const cat = task.category && CATEGORY_EMOJIS[task.category] ? task.category : 'Other';
    return selectedCategories.has(cat);
  });

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto w-full font-sans animate-in fade-in duration-500 pb-20">
      
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link to="/dashboard" className="hover:text-emerald-600 transition-colors">Dashboard</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-emerald-600 font-medium">Live Map</span>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl lg:text-4xl font-bold text-slate-900 mb-3 flex items-center gap-3">
            <MapPin className="w-8 h-8 text-rose-500" />
            Impact Live Map
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl">
            Real-time visualization of community needs across India. Pinpoints are automatically extracted from your active task locations.
          </p>
        </div>
        
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3 shrink-0">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Pins</span>
            <span className="text-xl font-black text-rose-600">{displayedTasks.length}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
            <MapPin className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="bg-slate-900 p-2 rounded-3xl shadow-xl border border-slate-800 relative overflow-hidden h-[600px] z-10 group">
        
        {loading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm">
            <div className="w-12 h-12 border-4 border-rose-500/30 border-t-rose-500 rounded-full animate-spin mb-4" />
            <p className="text-rose-400 font-medium animate-pulse">Mapping coordinates...</p>
          </div>
        )}

        {/* Dark Mode Mapbox style tiles using CartoDB */}
        <MapContainer 
          center={MAP_CENTER} 
          zoom={10} 
          style={{ height: "100%", width: "100%", borderRadius: "1.25rem" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          
          {displayedTasks.map(task => {
            const emoji = CATEGORY_EMOJIS[task.category] || CATEGORY_EMOJIS['Other'];
            return (
              <Marker 
                key={task.id} 
                position={task.coords} 
                icon={createEmojiIcon(emoji)}
              >
                <Popup className="custom-popup">
                  <div className="p-1 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{emoji}</span>
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-xs font-bold rounded-full">
                        {task.category || 'General'}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1 leading-snug">{task.title}</h3>
                    <p className="text-sm text-slate-500 mb-3 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {task.location}
                    </p>
                    <p className="text-xs font-medium text-slate-400 border-t border-slate-100 pt-2 line-clamp-2">
                      {task.description}
                    </p>
                    <p className="text-[10px] uppercase font-bold text-emerald-600 mt-2">
                      By {task.ngoName}
                    </p>
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
        
        {/* CSS override for leaflet popup to make it look modern */}
        <style dangerouslySetInnerHTML={{__html: `
          .custom-popup .leaflet-popup-content-wrapper {
            border-radius: 16px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
            border: 1px solid #f1f5f9;
          }
          .custom-popup .leaflet-popup-tip {
            background: white;
            border-bottom: 1px solid #f1f5f9;
            border-right: 1px solid #f1f5f9;
          }
          .custom-emoji-marker {
            background: none !important;
            border: none !important;
          }
        `}} />
      </div>
      
      {/* Legend / Filters */}
      <div className="mt-6 flex flex-wrap gap-3 items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mr-2">Filters:</span>
        {Object.entries(CATEGORY_EMOJIS).map(([cat, emoji]) => {
          const isSelected = selectedCategories.has(cat);
          return (
            <button 
              key={cat} 
              onClick={() => toggleCategory(cat)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
                isSelected 
                  ? 'bg-rose-500 text-white border-rose-500 shadow-sm shadow-rose-500/20' 
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-rose-300 hover:text-rose-600'
              }`}
            >
              <span>{emoji}</span>
              <span className="text-sm font-medium">{cat}</span>
            </button>
          );
        })}
        {selectedCategories.size > 0 && (
          <button 
            onClick={() => setSelectedCategories(new Set())}
            className="text-xs font-bold text-slate-400 hover:text-slate-700 underline underline-offset-2 ml-2 transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>
      
    </div>
  );
};

export default LiveHeatmap;
