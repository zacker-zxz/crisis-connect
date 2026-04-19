"use client"
import React, { useEffect, useState, useRef } from 'react';
import Map, { Marker, NavigationControl, GeolocateControl, Source, Layer, MapRef } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Info, X, Clock, Users, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MAPBOX_TOKEN =
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
  'pk.eyJ1IjoidGVqYXMwMzA4MDYiLCJhIjoiY21vNXNycDRhMTVwcjJ0czR3cXE3dW5uMyJ9.H8yLp4vnqiO54TYKJ4WsRg';

interface Task {
  _id: string;
  title: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  urgency: 'Critical' | 'High' | 'Medium' | 'Low';
  volunteersNeeded: number;
  time: string;
  category: string;
}

const mockTasks: Task[] = [
  { _id: 'm1', title: 'Medical Aid Dispatch', description: 'Emergency medical supplies delivery required for local clinics in Kurla.', location: { lat: 19.0820, lng: 72.8810, address: 'Kurla West, Mumbai' }, urgency: 'Critical', volunteersNeeded: 5, time: '2h ago', category: 'Medical' },
  { _id: 'm2', title: 'Flood Relief Match', description: 'Assisting families affected by flash floods with temporary shelter in Bandra.', location: { lat: 19.0550, lng: 72.8300, address: 'Bandra West, Mumbai' }, urgency: 'High', volunteersNeeded: 12, time: '1h ago', category: 'Rescue' },
  { _id: 'm3', title: 'Food Distribution', description: 'Organizing community kitchen for daily wage workers in Andheri.', location: { lat: 19.1136, lng: 72.8697, address: 'Andheri East, Mumbai' }, urgency: 'Medium', volunteersNeeded: 8, time: '4h ago', category: 'Food' },
  { _id: 'm4', title: 'Rescue Coordination', description: 'Logistics support for specialized rescue teams in Dadar.', location: { lat: 19.0144, lng: 72.8479, address: 'Dadar West, Mumbai' }, urgency: 'Critical', volunteersNeeded: 3, time: '30m ago', category: 'Logistics' },
  { _id: 'm5', title: 'Water Supply Logistics', description: 'Drinking water distribution in areas with pipeline damage in Vashi.', location: { lat: 19.0330, lng: 73.0297, address: 'Vashi, Navi Mumbai' }, urgency: 'High', volunteersNeeded: 15, time: '5h ago', category: 'Distro' },
  { _id: 'm6', title: 'Elderly Care Support', description: 'Home visits and health checks for isolated seniors in Belapur.', location: { lat: 19.0473, lng: 73.0197, address: 'Belapur, Navi Mumbai' }, urgency: 'Medium', volunteersNeeded: 4, time: '6h ago', category: 'Health' },
  { _id: 'm7', title: 'Debris Clearance', description: 'Clearing main roads for emergency vehicle access in Thane.', location: { lat: 19.2183, lng: 72.9781, address: 'Thane West' }, urgency: 'High', volunteersNeeded: 20, time: '8h ago', category: 'Infra' },
  { _id: 'm8', title: 'Sanitation Kit Drive', description: 'Distributing hygiene products in temporary settlements in Ghatkopar.', location: { lat: 19.0728, lng: 72.8998, address: 'Ghatkopar East, Mumbai' }, urgency: 'Medium', volunteersNeeded: 6, time: '12h ago', category: 'Hygiene' },
  { _id: 'm9', title: 'Shelter Management', description: 'Overseeing operations at the community relief center in Malad.', location: { lat: 19.1828, lng: 72.8596, address: 'Malad East, Mumbai' }, urgency: 'High', volunteersNeeded: 10, time: '10h ago', category: 'Admin' },
  { _id: 'm10', title: 'First Aid Workshop', description: 'Training new recruits in basic emergency response in Juhu.', location: { lat: 19.1254, lng: 72.8354, address: 'Juhu, Mumbai' }, urgency: 'Medium', volunteersNeeded: 25, time: '1d ago', category: 'Training' },
  { _id: 'm11', title: 'Oxygen Cylinder Logistics', description: 'Urgent transport of O2 tanks to suburban hospital in Mulund.', location: { lat: 19.1663, lng: 72.9333, address: 'Mulund West, Mumbai' }, urgency: 'Critical', volunteersNeeded: 4, time: '1h ago', category: 'Medical' },
  { _id: 'm12', title: 'Search & Recovery', description: 'Assisting local authorities in coastal search operations in Colaba.', location: { lat: 18.9220, lng: 72.8347, address: 'Colaba, Mumbai' }, urgency: 'Critical', volunteersNeeded: 15, time: '3h ago', category: 'Security' },
  { _id: 'm13', title: 'Blanket Distribution', description: 'Night-time outreach for homeless populations in Chembur.', location: { lat: 19.0600, lng: 72.8900, address: 'Chembur, Mumbai' }, urgency: 'Medium', volunteersNeeded: 10, time: '7h ago', category: 'Direct Aid' },
  { _id: 'm14', title: 'Animal Rescue Support', description: 'Caring for displaced pets and stray animals in Kharghar.', location: { lat: 19.0300, lng: 73.0600, address: 'Kharghar, Navi Mumbai' }, urgency: 'Low', volunteersNeeded: 5, time: '9h ago', category: 'Animals' },
  { _id: 'm15', title: 'Volunteer Registration Desk', description: 'Processing on-site help requests and volunteer IDs in BKC.', location: { lat: 19.0760, lng: 72.8777, address: 'BKC, Mumbai' }, urgency: 'Medium', volunteersNeeded: 8, time: '2h ago', category: 'Support' },
  { _id: 'm16', title: 'Flash Flood Monitoring', description: 'Setting up sensors in low-lying areas of Kalina.', location: { lat: 19.071, lng: 72.868, address: 'Kalina, Mumbai' }, urgency: 'High', volunteersNeeded: 4, time: '45m ago', category: 'Monitoring' },
  { _id: 'm17', title: 'Bridge Safety Inspection', description: 'Visual inspection of railway bridge integrity in Sion.', location: { lat: 19.039, lng: 72.861, address: 'Sion, Mumbai' }, urgency: 'Critical', volunteersNeeded: 2, time: '15m ago', category: 'Safety' },
  { _id: 'm18', title: 'Mobile Clinic Setup', description: 'Temporary medical tent assembly in Govandi.', location: { lat: 19.055, lng: 72.915, address: 'Govandi, Mumbai' }, urgency: 'High', volunteersNeeded: 10, time: '3h ago', category: 'Medical' },
  { _id: 'm19', title: 'Crowd Control Support', description: 'Assisting police during religious gathering nearby.', location: { lat: 19.02, lng: 72.855, address: 'Lower Parel, Mumbai' }, urgency: 'Medium', volunteersNeeded: 30, time: '5h ago', category: 'Security' },
  { _id: 'm20', title: 'Storm Drain Clearing', description: 'Preventing waterlogging by clearing trash from drains.', location: { lat: 19.14, lng: 72.83, address: 'Versova, Mumbai' }, urgency: 'High', volunteersNeeded: 12, time: '1h ago', category: 'Environment' },
  { _id: 'm21', title: 'Solar Lantern Distribution', description: 'Providing light to areas with power outages.', location: { lat: 19.18, lng: 72.95, address: 'Kanjurmarg, Mumbai' }, urgency: 'Low', volunteersNeeded: 6, time: '12h ago', category: 'Power' },
  { _id: 'm22', title: 'Fire Safety Education', description: 'Teaching school kids evacuation techniques.', location: { lat: 19.23, lng: 72.85, address: 'Borivali, Mumbai' }, urgency: 'Low', volunteersNeeded: 4, time: '1d ago', category: 'Education' },
  { _id: 'm23', title: 'Mental Health Hotline', description: 'Remotely supporting trauma victims after incident.', location: { lat: 19.04, lng: 73.04, address: 'Nerul, Navi Mumbai' }, urgency: 'High', volunteersNeeded: 5, time: '10m ago', category: 'Remote' },
  { _id: 'm24', title: 'Medication Delivery', description: 'Delivering insulin and heart meds to homebound.', location: { lat: 19.09, lng: 72.94, address: 'Airoli, Navi Mumbai' }, urgency: 'Medium', volunteersNeeded: 3, time: '2h ago', category: 'Medical' },
  { _id: 'm25', title: 'Structure Stabilization', description: 'Propping up wall at risk of collapse after rain.', location: { lat: 19.2, lng: 72.82, address: 'Kandivali, Mumbai' }, urgency: 'Critical', volunteersNeeded: 8, time: '3h ago', category: 'Infra' },
  { _id: 'm26', title: 'Coastal Erosion Alert', description: 'Placing sandbags to prevent tidal flooding in Worli.', location: { lat: 19.01, lng: 72.81, address: 'Worli Sea Face, Mumbai' }, urgency: 'High', volunteersNeeded: 15, time: '2h ago', category: 'Rescue' },
  { _id: 'm27', title: 'School Building Safety', description: 'Structural assessment of old municipal school in Parel.', location: { lat: 19.00, lng: 72.84, address: 'Parel, Mumbai' }, urgency: 'Medium', volunteersNeeded: 4, time: '5h ago', category: 'Safety' },
  { _id: 'm28', title: 'Slum Sanitation Drive', description: 'Cleaning open drains and disinfecting alleys in Dharavi.', location: { lat: 19.04, lng: 72.85, address: 'Dharavi, Mumbai' }, urgency: 'High', volunteersNeeded: 25, time: '1h ago', category: 'Health' },
  { _id: 'm29', title: 'Landslide Risk Zone', description: 'Monitoring soil stability near hill settlements in Powai.', location: { lat: 19.12, lng: 72.90, address: 'Powai, Mumbai' }, urgency: 'Critical', volunteersNeeded: 6, time: '30m ago', category: 'Safety' },
  { _id: 'm30', title: 'Industrial Leak Response', description: 'Evacuation support near chemical plant in Taloja.', location: { lat: 19.06, lng: 73.10, address: 'Taloja, Navi Mumbai' }, urgency: 'Critical', volunteersNeeded: 50, time: '10m ago', category: 'Rescue' },
  { _id: 'm31', title: 'Railway Station First Aid', description: 'Supporting medics at Panvel station after monsoon rush.', location: { lat: 18.99, lng: 73.11, address: 'Panvel, Navi Mumbai' }, urgency: 'Medium', volunteersNeeded: 10, time: '4h ago', category: 'Medical' },
  { _id: 'm32', title: 'Elderly Food Delivery', description: 'Delivering warm meals to seniors in Seawoods.', location: { lat: 19.02, lng: 73.01, address: 'Seawoods, Navi Mumbai' }, urgency: 'Low', volunteersNeeded: 8, time: '6h ago', category: 'Food' },
  { _id: 'm33', title: 'Water Tanker Logistics', description: 'Coordinating water tankers for drought-hit area in Uran.', location: { lat: 18.88, lng: 72.94, address: 'Uran, Navi Mumbai' }, urgency: 'High', volunteersNeeded: 5, time: '8h ago', category: 'Logistics' },
  { _id: 'm34', title: 'Dengue Awareness Camp', description: 'Educating residents on stagnant water in Kopar Khairane.', location: { lat: 19.11, lng: 73.00, address: 'Kopar Khairane, Navi Mumbai' }, urgency: 'Medium', volunteersNeeded: 12, time: '1d ago', category: 'Health' },
  { _id: 'm35', title: 'Stray Animal Shelter', description: 'Temporary housing for street dogs during heavy rains in Sanpada.', location: { lat: 19.06, lng: 73.01, address: 'Sanpada, Navi Mumbai' }, urgency: 'Low', volunteersNeeded: 4, time: '12h ago', category: 'Animals' }
];

export default function LiveHeatmap() {
  const mapRef = useRef<MapRef>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [distanceByTask, setDistanceByTask] = useState<Record<string, number>>({});
  const [viewState, setViewState] = useState({
    longitude: 72.9000,
    latitude: 19.0760,
    zoom: 10.5
  });
  const hasMapToken = Boolean(MAPBOX_TOKEN);

  useEffect(() => {
    goMyLoc();
    const fetchTasks = async () => {
      try {
        const res = await fetch('/api/tasks');
        const data = await res.json();
        const normalized = Array.isArray(data)
          ? data.map((task: any) => ({
              _id: task._id,
              title: task.title || 'Untitled Task',
              description: task.description || 'No description provided.',
              location: task.location,
              urgency: task.urgency || 'Medium',
              volunteersNeeded: task.requiredVolunteers || task.volunteersNeeded || 0,
              time: task.createdAt ? new Date(task.createdAt).toLocaleString() : 'Recently',
              category: 'Relief',
            }))
          : [];
        setTasks(normalized.length > 0 ? [...normalized, ...mockTasks] : mockTasks);
      } catch (err) {
        setTasks(mockTasks);
      }
    };
    fetchTasks();
  }, []);

  useEffect(() => {
    if (!currentLocation || tasks.length === 0) return;
    const distances: Record<string, number> = {};
    tasks.forEach((task) => {
      const km = haversineDistance(
        currentLocation.lat,
        currentLocation.lng,
        task.location.lat,
        task.location.lng
      );
      distances[task._id] = km;
    });
    setDistanceByTask(distances);
  }, [currentLocation, tasks]);

  const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const earthRadiusKm = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((earthRadiusKm * c).toFixed(2));
  };

  const goMyLoc = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = { lng: position.coords.longitude, lat: position.coords.latitude };
          setCurrentLocation({ lat: coords.lat, lng: coords.lng });
          setViewState(prev => ({ ...prev, ...coords, zoom: 12 }));
          mapRef.current?.flyTo({ center: [coords.lng, coords.lat], zoom: 12, duration: 2000 });
        },
        () => {
          // Keep current view if permission denied or unavailable.
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    }
  }

  const geojsonData: any = {
    type: 'FeatureCollection',
    features: tasks.map(task => ({
      type: 'Feature',
      properties: { urgency: task.urgency === 'Critical' ? 5 : 2 },
      geometry: { type: 'Point', coordinates: [task.location.lng, task.location.lat] }
    }))
  };

  const heatmapLayer: any = {
    id: 'heatmap',
    type: 'heatmap',
    maxzoom: 15,
    paint: {
      'heatmap-weight': { property: 'urgency', type: 'exponential', stops: [[1, 1], [6, 3]] },
      'heatmap-intensity': { stops: [[11, 1], [15, 3]] },
      'heatmap-color': [
        'interpolate', ['linear'], ['heatmap-density'],
        0, 'rgba(0,0,0,0)',
        0.2, 'rgba(20, 184, 166, 0.4)',
        0.4, 'rgba(52, 211, 153, 0.6)',
        0.6, 'rgba(251, 191, 36, 0.7)',
        0.8, 'rgba(251, 146, 60, 0.8)',
        1, 'rgba(239, 68, 68, 0.9)'
      ],
      'heatmap-radius': { stops: [[11, 20], [15, 50]] },
      'heatmap-opacity': 0.7
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
    <div className="w-full h-full rounded-[3.5rem] overflow-hidden border border-slate-100 shadow-sm relative group bg-white">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
      >
        <GeolocateControl position="top-right" />
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
            onClick={e => {
              e.originalEvent.stopPropagation();
              setSelectedTask(task);
            }}
          >
            <div className="cursor-pointer group/marker transition-all hover:scale-125 z-10">
               <div className="relative">
                  <MapPin className={`w-10 h-10 drop-shadow-2xl ${
                    task.urgency === 'Critical' ? 'text-red-500 fill-red-500/30' : 
                    task.urgency === 'High' ? 'text-orange-500 fill-orange-500/30' : 
                    task.urgency === 'Medium' ? 'text-yellow-500 fill-yellow-500/30' : 
                    'text-green-500 fill-green-500/30'
                  }`} />
                  <div className={`absolute top-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${
                    task.urgency === 'Critical' ? 'bg-red-500 animate-pulse' : 
                    task.urgency === 'High' ? 'bg-orange-500' : 
                    task.urgency === 'Medium' ? 'bg-yellow-500' : 
                    'bg-green-500'
                  }`} />
               </div>
            </div>
          </Marker>
        ))}
      </Map>

      {/* Side Info Panel */}
      <AnimatePresence>
        {selectedTask && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="absolute top-0 right-0 h-full w-full sm:w-96 bg-white/95 backdrop-blur-xl border-l border-slate-200 z-50 p-8 shadow-2xl flex flex-col"
          >
            <div className="flex justify-between items-center mb-8">
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                selectedTask.urgency === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/20' :
                selectedTask.urgency === 'High' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/20' :
                'bg-blue-500/20 text-blue-400 border border-blue-500/20'
              }`}>
                {selectedTask.urgency} Urgency
              </span>
              <button 
                onClick={() => setSelectedTask(null)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-8 pr-2 no-scrollbar">
              <div>
                <h3 className="text-3xl font-black text-slate-950 mb-3 leading-tight uppercase tracking-tighter">{selectedTask.title}</h3>
                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold tracking-widest uppercase">
                  <MapPin className="w-4 h-4 text-primary" />
                  {selectedTask.location.address}
                </div>
              </div>

              <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 shadow-sm transition-all hover:shadow-md">
                <p className="text-slate-600 leading-relaxed text-sm font-medium">
                  {selectedTask.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <Clock className="w-5 h-5 text-secondary mb-2" />
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Reported</p>
                  <p className="text-slate-900 font-bold">{selectedTask.time}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <Users className="w-5 h-5 text-primary mb-2" />
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Requested</p>
                  <p className="text-slate-900 font-bold">{selectedTask.volunteersNeeded} Help</p>
                </div>
              </div>

              {distanceByTask[selectedTask._id] !== undefined && (
                <div className="bg-slate-950 p-6 rounded-[2rem] border border-slate-800 shadow-xl">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-primary" />
                         </div>
                         <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Proximity</p>
                            <p className="text-white font-black text-xl">{distanceByTask[selectedTask._id]} <span className="text-xs text-slate-400 font-bold">KM</span></p>
                         </div>
                      </div>
                      <div className="h-10 w-[1px] bg-slate-800 mx-2"></div>
                      <div className="flex-1">
                         <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-right">Route</p>
                         <a 
                           href={`https://www.google.com/maps/dir/?api=1&destination=${selectedTask.location.lat},${selectedTask.location.lng}${currentLocation ? `&origin=${currentLocation.lat},${currentLocation.lng}` : ''}`}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="text-primary font-black text-xs text-right cursor-pointer hover:underline block"
                         >
                           VIEW MAPS
                         </a>
                      </div>
                   </div>
                </div>
              )}

              <div className="pt-4">
                <div className="flex items-center gap-3 p-4 bg-primary/10 border border-primary/20 rounded-2xl mb-8">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                  <p className="text-xs text-slate-400 font-medium leading-tight">
                    This event is verified by authorized NGO coordinators. Respond responsibly.
                  </p>
                </div>

                <button className="w-full bg-primary hover:bg-primary/90 text-white font-black py-5 rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest text-sm">
                  Accept Mission
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="absolute bottom-10 left-10 z-10 hidden sm:flex flex-col gap-3">
        <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800 p-5 rounded-3xl pointer-events-none shadow-2xl ring-1 ring-white/5">
          <h4 className="text-base font-black text-white mb-1.5 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)]"></div> 
            Live Crisis Map
          </h4>
          <p className="text-xs text-slate-400 font-medium">Monitoring {tasks.length} active emergency reports in your region.</p>
        </div>
      </div>

    </div>
  );
}
