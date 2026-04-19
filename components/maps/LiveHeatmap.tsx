"use client"
import React, { useEffect, useState } from 'react';
import Map, { Marker, NavigationControl, FullscreenControl, GeolocateControl, Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin } from 'lucide-react';

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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [viewState, setViewState] = useState({
    longitude: 72.8777, // Default to Mumbai
    latitude: 19.0760,
    zoom: 11
  });

  useEffect(() => {
    // 1. Get current location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setViewState({
          ...viewState,
          longitude: position.coords.longitude,
          latitude: position.coords.latitude,
          zoom: 12
        });
      });
    }

    // 2. Fetch tasks for heatmap
    const fetchTasks = async () => {
      try {
        const res = await fetch('/api/tasks');
        const data = await res.json();
        setTasks(data);
      } catch (err) {
        console.error('Map fetch error:', err);
      }
    };
    fetchTasks();
  }, []);

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
        1, 'rgb(239, 68, 68)'      // Red
      ],
      'heatmap-radius': {
        stops: [[11, 15], [15, 30]]
      },
      'heatmap-opacity': 0.8
    }
  };

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative">
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
      >
        <GeolocateControl position="top-left" />
        <FullscreenControl position="top-left" />
        <NavigationControl position="top-left" />

        <Source id="tasks" type="geojson" data={geojsonData}>
          <Layer {...heatmapLayer} />
        </Source>

        {tasks.map(task => (
          <Marker 
            key={task._id} 
            longitude={task.location.lng} 
            latitude={task.location.lat} 
            anchor="bottom"
          >
            <div className="group relative">
               <MapPin className="text-secondary w-6 h-6 hover:scale-125 transition-transform cursor-pointer drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
               <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 z-50">
                  <div className="glass-card p-3 rounded-lg text-xs leading-tight">
                    <p className="font-bold text-white mb-1">{task.title}</p>
                    <p className="text-gray-400">{task.location.address}</p>
                  </div>
               </div>
            </div>
          </Marker>
        ))}
      </Map>
      
      <div className="absolute bottom-6 left-6 z-10 glass-card px-4 py-2 rounded-lg pointer-events-none">
        <h4 className="text-xs font-bold text-white mb-1 flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div> Live Crisis Heatmap
        </h4>
        <p className="text-[10px] text-gray-400">Centered on your location</p>
      </div>
    </div>
  );
}
