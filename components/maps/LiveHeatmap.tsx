"use client"
import React, { useEffect, useState, useRef } from 'react';
import Map, { Marker, NavigationControl, FullscreenControl, GeolocateControl, Source, Layer, MapRef } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Navigation } from 'lucide-react';

const MAPBOX_TOKEN = 'pk.eyJ1IjoidGVqYXMwMzA4MDYiLCJhIjoiY21vNXNycDRhMTVwcjJ0czR3cXE3dW5uMyJ9.H8yLp4vnqiO54TYKJ4WsRg';

interface Task {
  _id: string;
  title: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  status: string;
}

export default function LiveHeatmap() {
  const mapRef = useRef<MapRef>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [viewState, setViewState] = useState({
    longitude: 72.8777, // Default to Mumbai
    latitude: 19.0760,
    zoom: 11
  });

  const mockTasks: Task[] = [
    { _id: 'm1', title: 'Urgent Medical Aid Required', location: { lat: 19.0820, lng: 72.8810, address: 'Kurla West, Mumbai' }, status: 'Open' },
    { _id: 'm2', title: 'Flood Relief Volunteer Match', location: { lat: 19.0550, lng: 72.8300, address: 'Bandra West, Mumbai' }, status: 'Open' },
    { _id: 'm3', title: 'Food & Supplies Distribution', location: { lat: 19.1136, lng: 72.8697, address: 'Andheri East, Mumbai' }, status: 'Open' },
    { _id: 'm4', title: 'Rescue Operation Coordinator', location: { lat: 19.0144, lng: 72.8479, address: 'Dadar West, Mumbai' }, status: 'Open' }
  ];

  useEffect(() => {
    // 1. Get current location initially
    goMyLoc();

    // 2. Fetch tasks for heatmap
    const fetchTasks = async () => {
      try {
        const res = await fetch('/api/tasks');
        const data = await res.json();
        // Combine DB tasks with mock tasks if DB is empty for demo purposes
        setTasks(data.length > 0 ? [...data, ...mockTasks] : mockTasks);
      } catch (err) {
        console.error('Map fetch error:', err);
        setTasks(mockTasks);
      }
    };
    fetchTasks();
  }, []);

  const goMyLoc = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setViewState({
          ...viewState,
          longitude: position.coords.longitude,
          latitude: position.coords.latitude,
          zoom: 13
        });
        mapRef.current?.flyTo({
          center: [position.coords.longitude, position.coords.latitude],
          zoom: 13,
          duration: 2000
        });
      });
    }
  }

  // Prepare GeoJSON for heatmap
  const geojsonData: any = {
    type: 'FeatureCollection',
    features: allTasks.map(t => ({
      type: 'Feature',
      properties: { urgency: 1 },
      geometry: {
        type: 'Point',
        coordinates: [task.location.lng, task.location.lat]
      }
    }))
  };

  const heatLayer: any = {
    id: 'heatmap-layer',
    type: 'heatmap',
    maxzoom: 13,
    paint: {
      'heatmap-weight': {
        property: 'urgency',
        type: 'exponential',
        stops: [[1, 1], [6, 3]]
      },
      'heatmap-intensity': {
        stops: [[11, 1], [15, 3]]
      },
      'heatmap-color': [
        'interpolate', ['linear'], ['heatmap-density'],
        0, 'rgba(0,0,0,0)',
        0.2, 'rgb(30, 64, 175)', // Blue
        0.4, 'rgb(14, 165, 233)', // Light Blue
        0.6, 'rgb(20, 184, 166)', // Teal
        0.8, 'rgb(245, 158, 11)', // Amber
        1, 'rgb(220, 38, 38)'      // Red
      ],
      'heatmap-radius': {
        stops: [[11, 15], [15, 40]]
      },
      'heatmap-opacity': 0.8
    }
  };

  if (!hasMapToken) {
    return (
      <div className="w-full h-full rounded-[3.5rem] overflow-hidden border border-slate-200 shadow-sm relative bg-white p-8 flex items-center justify-center">
        <p className="text-slate-500 text-sm font-medium">Map token is not configured. Add `NEXT_PUBLIC_MAPBOX_TOKEN` to enable the live heatmap.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-[2rem] overflow-hidden border border-slate-800 shadow-2xl relative group">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        onClick={() => setSelectedTask(null)}
      >
        <GeolocateControl position="top-right" />
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
          >
            <div className="group/marker relative cursor-pointer">
               <MapPin className="text-red-500 w-8 h-8 hover:scale-125 transition-transform drop-shadow-[0_0_12px_rgba(239,68,68,0.8)] fill-red-500/20" />
               <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/marker:block w-56 z-50">
                  <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-3 rounded-xl shadow-2xl text-xs leading-tight">
                    <p className="font-bold text-white mb-1.5">{task.title}</p>
                    <p className="text-slate-400 text-[10px]">{task.location.address}</p>
                    <div className="mt-2 text-[9px] font-black uppercase text-red-400 tracking-wider">Critical Priority</div>
                  </div>
               </div>
            </div>
          </Popup>
        )}
      </Map>
      
      <div className="absolute bottom-6 left-6 z-10 flex flex-col gap-3">
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 px-4 py-3 rounded-xl pointer-events-none shadow-xl">
          <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div> 
            Live Crisis Map
          </h4>
          <p className="text-xs text-slate-400">{tasks.length} Active Events Detected</p>
        </div>
      </div>

      {/* Dynamic current location button overlay */}
      <button 
        onClick={goMyLoc}
        className="absolute bottom-6 right-6 z-10 bg-primary hover:bg-primary/90 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 group/btn"
        title="My Location"
      >
        <Navigation className="w-6 h-6 group-hover/btn:animate-bounce" />
      </button>
    </div>
  );
}
