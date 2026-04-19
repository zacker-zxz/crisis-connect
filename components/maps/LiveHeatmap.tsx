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
    features: tasks.map(task => ({
      type: 'Feature',
      properties: { urgency: 1 },
      geometry: {
        type: 'Point',
        coordinates: [task.location.lng, task.location.lat]
      }
    }))
  };

  const heatmapLayer: any = {
    id: 'heatmap',
    type: 'heatmap',
    maxzoom: 15,
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
        'interpolate',
        ['linear'],
        ['heatmap-density'],
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

  return (
    <div className="w-full h-full rounded-[2rem] overflow-hidden border border-slate-800 shadow-2xl relative group">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
      >
        <GeolocateControl position="top-right" />
        <FullscreenControl position="top-right" />
        <NavigationControl position="top-right" />

        <Source id="tasks" type="geojson" data={geojsonData}>
          <Layer {...heatmapLayer} />
        </Source>

        {tasks.map((task, idx) => (
          <Marker 
            key={`marker-${task._id}-${idx}`} 
            longitude={task.location.lng} 
            latitude={task.location.lat} 
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
          </Marker>
        ))}
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
