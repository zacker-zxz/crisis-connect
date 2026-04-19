"use client"
import React, { useEffect, useState, useRef, useCallback } from 'react';
import Map, { Marker, NavigationControl, FullscreenControl, GeolocateControl, Source, Layer, MapRef, Popup } from 'react-map-gl';
import { MapPin, Navigation, Users, Clock, Flame, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoidGVqYXMwMzA4MDYiLCJhIjoiY21vNXNycDRhMTVwcjJ0czR3cXE3dW5uMyJ9.H8yLp4vnqiO54TYKJ4WsRg';

interface Task {
  _id: string;
  title: string;
  description?: string;
  ngoId?: string;
  priority?: string;
  status: string;
  requiredVolunteers: number;
  filledVolunteers: number;
  dateTime?: string;
  location: { lat: number; lng: number; address: string };
}

// Priority configs: color for mine (solid) and others (lighter)
const PRIORITY_PIN: Record<string, { mine: string; others: string; label: string }> = {
  Critical: { mine: '#dc2626', others: '#fca5a5', label: 'Critical' },  // red
  Urgent:   { mine: '#ea580c', others: '#fdba74', label: 'Urgent' },    // orange
  Medium:   { mine: '#d97706', others: '#fde68a', label: 'Medium' },    // amber
  Low:      { mine: '#16a34a', others: '#86efac', label: 'Low' },       // green
  default:  { mine: '#006060', others: '#5eead4', label: 'Unknown' },
};

const MOCK_OTHERS: Task[] = [
  { _id: 'o1', title: 'Nearby Flood Alert',        priority: 'Critical', status: 'Open', requiredVolunteers: 15, filledVolunteers: 4,  location: { lat: 19.0720, lng: 72.8600, address: 'Mahim, Mumbai' } },
  { _id: 'o2', title: 'Food Camp Setup',           priority: 'Medium',   status: 'Open', requiredVolunteers: 8,  filledVolunteers: 3,  location: { lat: 19.1020, lng: 72.8830, address: 'Jogeshwari, Mumbai' } },
  { _id: 'o3', title: 'Medical Outpost',           priority: 'Urgent',   status: 'In Progress', requiredVolunteers: 6, filledVolunteers: 6, location: { lat: 18.9650, lng: 72.8240, address: 'Colaba, Mumbai' } },
  { _id: 'o4', title: 'Debris Clearing Team',      priority: 'Low',      status: 'Open', requiredVolunteers: 10, filledVolunteers: 2,  location: { lat: 19.2180, lng: 72.9780, address: 'Thane West' } },
];

const MOCK_MINE: Task[] = [
  { _id: 'm1', title: 'Flood Relief Coordinator', priority: 'Critical', status: 'In Progress', requiredVolunteers: 10, filledVolunteers: 7,  location: { lat: 19.0550, lng: 72.8300, address: 'Bandra West, Mumbai' }, dateTime: new Date(Date.now() + 2 * 86400000).toISOString() },
  { _id: 'm2', title: 'Medical Supply Transport',  priority: 'Urgent',   status: 'Open',        requiredVolunteers: 5,  filledVolunteers: 2,  location: { lat: 19.1136, lng: 72.8697, address: 'Andheri East, Mumbai' }, dateTime: new Date(Date.now() + 5 * 86400000).toISOString() },
];

export default function LiveHeatmap() {
  const mapRef = useRef<MapRef>(null);
  const { user } = useAuthStore();

  const [myTasks,     setMyTasks]     = useState<Task[]>(MOCK_MINE);
  const [otherTasks,  setOtherTasks]  = useState<Task[]>(MOCK_OTHERS);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isMyTask,    setIsMyTask]    = useState(false);

  const [viewState, setViewState] = useState({ longitude: 72.8777, latitude: 19.0760, zoom: 11 });

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch('/api/tasks');
        const data: Task[] = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const mine   = data.filter(t => t.ngoId === user?.id);
          const others = data.filter(t => t.ngoId !== user?.id);
          if (mine.length > 0) setMyTasks([...mine, ...MOCK_MINE]);
          if (others.length > 0) setOtherTasks([...others, ...MOCK_OTHERS]);
        }
      } catch {}
    };
    fetchTasks();
  }, [user?.id]);

  const goMyLoc = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        const { longitude, latitude } = coords;
        setViewState({ longitude, latitude, zoom: 13 });
        mapRef.current?.flyTo({ center: [longitude, latitude], zoom: 13, duration: 1800 });
      });
    }
  };

  const openTask = (task: Task, mine: boolean) => {
    setSelectedTask(task);
    setIsMyTask(mine);
    mapRef.current?.flyTo({ center: [task.location.lng, task.location.lat], zoom: 14, duration: 900 });
  };

  const getPinCfg = (task: Task) => PRIORITY_PIN[task.priority || ''] || PRIORITY_PIN.default;

  // GeoJSON for heatmap layer (all tasks combined)
  const allTasks = [...myTasks, ...otherTasks];
  const geojson: any = {
    type: 'FeatureCollection',
    features: allTasks.map(t => ({
      type: 'Feature',
      properties: { weight: t.priority === 'Critical' ? 4 : t.priority === 'Urgent' ? 3 : t.priority === 'Medium' ? 2 : 1 },
      geometry: { type: 'Point', coordinates: [t.location.lng, t.location.lat] }
    }))
  };

  const heatLayer: any = {
    id: 'heatmap-layer',
    type: 'heatmap',
    maxzoom: 13,
    paint: {
      'heatmap-weight': ['interpolate', ['linear'], ['get', 'weight'], 1, 0.4, 4, 1],
      'heatmap-intensity': { stops: [[10, 1], [13, 2]] },
      'heatmap-color': [
        'interpolate', ['linear'], ['heatmap-density'],
        0, 'rgba(0,0,0,0)',
        0.2, 'rgba(86,198,189,0.6)',
        0.5, 'rgba(255,140,0,0.7)',
        0.8, 'rgba(220,38,38,0.8)',
        1,   'rgba(139,0,0,1)'
      ],
      'heatmap-radius': { stops: [[10,20], [13,45]] },
      'heatmap-opacity': 0.7,
    }
  };

  return (
    <div className="w-full h-full rounded-[2rem] overflow-hidden border border-gray-200 shadow-xl relative">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={e => setViewState(e.viewState)}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        onClick={() => setSelectedTask(null)}
      >
        <GeolocateControl position="top-right" />
        <FullscreenControl position="top-right" />
        <NavigationControl position="top-right" />

        {/* Heatmap */}
        <Source id="all-tasks" type="geojson" data={geojson}>
          <Layer {...heatLayer} />
        </Source>

        {/* OTHER orgs markers — smaller, lighter colour */}
        {otherTasks.map((task, idx) => {
          const cfg = getPinCfg(task);
          return (
            <Marker key={`other-${task._id}-${idx}`} longitude={task.location.lng} latitude={task.location.lat} anchor="bottom">
              <button onClick={e => { e.stopPropagation(); openTask(task, false); }} className="group/m focus:outline-none">
                <div className="relative">
                  {/* Smaller pin for others */}
                  <svg width="22" height="28" viewBox="0 0 24 32" className="drop-shadow hover:scale-125 transition-transform">
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 20 12 20S24 21 24 12C24 5.373 18.627 0 12 0z" fill={cfg.others} stroke="white" strokeWidth="2"/>
                    <circle cx="12" cy="12" r="4" fill="white" opacity="0.8"/>
                  </svg>
                </div>
              </button>
            </Marker>
          );
        })}

        {/* MY tasks markers — bigger, solid colour, starred */}
        {myTasks.map((task, idx) => {
          const cfg = getPinCfg(task);
          return (
            <Marker key={`mine-${task._id}-${idx}`} longitude={task.location.lng} latitude={task.location.lat} anchor="bottom">
              <button onClick={e => { e.stopPropagation(); openTask(task, true); }} className="group/m focus:outline-none">
                <div className="relative">
                  {/* Bigger distinctive pin for mine */}
                  <svg width="32" height="40" viewBox="0 0 24 32" className="drop-shadow-lg hover:scale-125 transition-transform">
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 20 12 20S24 21 24 12C24 5.373 18.627 0 12 0z" fill={cfg.mine} stroke="white" strokeWidth="2.5"/>
                    <text x="12" y="15" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">✦</text>
                  </svg>
                  {/* MY badge */}
                  <div className="absolute -top-2 -right-2 bg-white text-[8px] font-black text-slate-700 shadow-md px-1 rounded-full border border-gray-200 leading-tight">
                    MINE
                  </div>
                </div>
              </button>
            </Marker>
          );
        })}

        {/* Task Detail Popup */}
        {selectedTask && (
          <Popup
            longitude={selectedTask.location.lng}
            latitude={selectedTask.location.lat}
            anchor="bottom"
            offset={40}
            onClose={() => setSelectedTask(null)}
            closeButton={false}
            className="z-50"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 w-72 relative">
              <button onClick={() => setSelectedTask(null)} className="absolute top-3 right-3 p-1 hover:bg-slate-100 rounded-lg text-slate-400">
                <X className="w-4 h-4" />
              </button>
              {/* Ownership + priority header */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {isMyTask && (
                  <span className="text-[9px] font-black text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full uppercase tracking-widest">Your Mission</span>
                )}
                {selectedTask.priority && (() => {
                  const cfg = PRIORITY_PIN[selectedTask.priority];
                  return (
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest" style={{ background: cfg?.mine + '20', color: cfg?.mine, border: `1px solid ${cfg?.mine}50` }}>
                      <Flame className="w-2.5 h-2.5 inline mr-0.5" />{selectedTask.priority}
                    </span>
                  );
                })()}
              </div>
              <h3 className="font-black text-slate-800 text-sm mb-1 pr-5 leading-tight">{selectedTask.title}</h3>
              {selectedTask.description && <p className="text-xs text-slate-500 mb-3 leading-relaxed">{selectedTask.description}</p>}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                  {selectedTask.location.address}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Users className="w-3.5 h-3.5 text-secondary shrink-0" />
                  {selectedTask.filledVolunteers} / {selectedTask.requiredVolunteers} volunteers
                </div>
                {selectedTask.dateTime && (
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {new Date(selectedTask.dateTime).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                  </div>
                )}
              </div>
              {/* Vol progress bar */}
              <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all"
                  style={{ width: `${Math.min(100, (selectedTask.filledVolunteers / selectedTask.requiredVolunteers) * 100)}%` }} />
              </div>
              <span className={`mt-2 inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                selectedTask.status === 'Open' ? 'text-secondary border-secondary/30 bg-secondary/10' :
                selectedTask.status === 'In Progress' ? 'text-primary border-primary/30 bg-primary/10' :
                'text-emerald-600 border-emerald-300 bg-emerald-50'
              }`}>{selectedTask.status}</span>
            </div>
          </Popup>
        )}
      </Map>

      {/* Legend */}
      <div className="absolute bottom-6 left-6 z-10">
        <div className="bg-white/95 backdrop-blur-md border border-gray-200 px-4 py-4 rounded-2xl shadow-lg space-y-3 min-w-[180px]">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(0,128,128,0.6)]"></div>
            <p className="text-xs font-black text-slate-800">Live Crisis Map</p>
          </div>
          <p className="text-[10px] text-slate-500">{allTasks.length} events detected</p>
          <hr className="border-gray-100" />
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Priority Scale</p>
          {Object.entries(PRIORITY_PIN).filter(([k]) => k !== 'default').map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2 border-white shadow-sm" style={{ background: cfg.mine }}></div>
              <span className="text-[10px] font-bold text-slate-600">{cfg.label}</span>
            </div>
          ))}
          <hr className="border-gray-100" />
          <div className="flex items-center gap-2">
            <svg width="14" height="17" viewBox="0 0 24 32"><path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 20 12 20S24 21 24 12C24 5.373 18.627 0 12 0z" fill="#dc2626" stroke="white" strokeWidth="2.5"/><text x="12" y="15" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">✦</text></svg>
            <span className="text-[10px] font-bold text-slate-600">Your missions</span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="11" height="14" viewBox="0 0 24 32"><path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 20 12 20S24 21 24 12C24 5.373 18.627 0 12 0z" fill="#fca5a5" stroke="white" strokeWidth="2"/></svg>
            <span className="text-[10px] font-bold text-slate-600">Other orgs</span>
          </div>
        </div>
      </div>

      <button
        onClick={goMyLoc}
        className="absolute bottom-6 right-6 z-10 bg-primary hover:bg-primary/90 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
        title="My Location"
      >
        <Navigation className="w-6 h-6" />
      </button>
    </div>
  );
}
