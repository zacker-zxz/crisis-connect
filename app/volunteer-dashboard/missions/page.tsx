"use client"
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  ChevronRight,
  Search,
  Users,
  AlertCircle,
  Route,
  ExternalLink,
  X,
  Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Map, { Marker, Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';

const MAPBOX_TOKEN =
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
  'pk.eyJ1IjoidGVqYXMwMzA4MDYiLCJhIjoiY21vNXNycDRhMTVwcjJ0czR3cXE3dW5uMyJ9.H8yLp4vnqiO54TYKJ4WsRg';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: string;
  requiredVolunteers: number;
  filledVolunteers: number;
  location: { address: string; lat?: number; lng?: number };
  requiredSkills: string[];
  dateTime?: string;
}

export default function MissionsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [routeGeoJson, setRouteGeoJson] = useState<any>(null);
  const [accepting, setAccepting] = useState<string | null>(null);

  const { token, user } = useAuthStore();
  const addNotification = useNotificationStore((state) => state.addNotification);
  const router = useRouter();

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      const userId = user?.id || user?._id;
      const available = Array.isArray(data)
        ? data.filter((t: any) => t.status === 'Open' && !t.assignedVolunteers?.includes(userId))
        : [];
      setTasks(available);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user?.id, user?._id]);

  const reachByKey = (userId: string, taskId: string) => `reachBy:${userId}:${taskId}`;

  const haversineKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
  };

  const setReachByForAcceptedMission = (task: Task) => {
    try {
      const userId = String(user?.id || user?._id || "");
      if (!userId) return;

      // try to guess travel time, fall back to default SLA if we can't
      let etaMinutes = 60;
      const hasCoords =
        currentLocation &&
        typeof task.location?.lat === "number" &&
        typeof task.location?.lng === "number";
      if (hasCoords) {
        const km = haversineKm(
          currentLocation!.lat,
          currentLocation!.lng,
          task.location.lat as number,
          task.location.lng as number
        );
        // rough guess: ~30 km/h avg, clamped between 15min and 3hrs
        etaMinutes = Math.max(15, Math.min(180, Math.round((km / 30) * 60)));
      }

      const reachByTs = Date.now() + etaMinutes * 60_000;
      localStorage.setItem(reachByKey(userId, task._id), String(reachByTs));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => {
    const fetchRoute = async () => {
      if (!selectedTask?.location?.lat || !selectedTask?.location?.lng || !currentLocation || !MAPBOX_TOKEN) {
        setRouteGeoJson(null);
        return;
      }

      try {
        const url =
          `https://api.mapbox.com/directions/v5/mapbox/driving/` +
          `${currentLocation.lng},${currentLocation.lat};${selectedTask.location.lng},${selectedTask.location.lat}` +
          `?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`;
        const res = await fetch(url);
        const data = await res.json();
        const geometry = data?.routes?.[0]?.geometry;
        if (geometry) {
          setRouteGeoJson({
            type: 'FeatureCollection',
            features: [{ type: 'Feature', properties: {}, geometry }],
          });
        } else {
          setRouteGeoJson(null);
        }
      } catch {
        setRouteGeoJson(null);
      }
    };
    fetchRoute();
  }, [selectedTask, currentLocation]);

  const handleAccept = async (task: Task) => {
    if (!token) return;

    if (!user?.phone) {
      alert("Please update your contact number in Settings before accepting a mission.");
      router.push('/volunteer-dashboard/settings');
      return;
    }

    setAccepting(task._id);
    try {
      const res = await fetch(`/api/tasks/${task._id}/accept`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to accept mission');
        return;
      }

      addNotification({
        title: 'Mission Accepted',
        message: `You are now assigned to "${task.title}".`,
        type: 'mission',
      });
      setReachByForAcceptedMission(task);
      router.push(`/volunteer-dashboard/missions/${task._id}`);
    } finally {
      setAccepting(null);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const q = searchTerm.toLowerCase();
    return (
      (t.title || '').toLowerCase().includes(q) ||
      (t.location?.address || '').toLowerCase().includes(q) ||
      (t.requiredSkills || []).some((skill) => skill.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Available Missions</h2>
          <p className="text-slate-500">Discover where your skills are needed most.</p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Filter missions..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-800 focus:outline-none focus:border-primary transition shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          [1, 2, 3, 4].map((i) => <div key={i} className="h-48 bg-white rounded-3xl border border-slate-200 animate-pulse" />)
        ) : filteredTasks.length === 0 ? (
          <div className="lg:col-span-2 bg-white p-20 rounded-[2rem] text-center border border-slate-200 shadow-sm">
            <AlertCircle className="w-16 h-16 text-slate-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No available missions</h3>
            <p className="text-slate-500">Try a different search term or check back shortly.</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <motion.div
              key={task._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-[2rem] border border-slate-200 hover:border-primary/30 transition-all group flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
                    <Users className="w-7 h-7" />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-semibold text-slate-500 mb-1">Status</p>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full border text-secondary border-secondary/30 bg-secondary/10">
                      {task.status}
                    </span>
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">{task.title}</h3>
                <p className="text-slate-500 text-sm line-clamp-2 mb-6 leading-relaxed">{task.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2.5 text-xs text-slate-600">
                    <MapPin className="w-4 h-4 text-primary" /> {task.location.address}
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-600">
                    <Users className="w-4 h-4 text-primary" /> {task.filledVolunteers}/{task.requiredVolunteers} Assigned
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {task.requiredSkills.map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-10">
                <button
                  onClick={() => setSelectedTask(task)}
                  className="py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black transition-all flex items-center justify-center gap-2"
                >
                  <Route className="w-4 h-4" /> Map
                </button>
                <button
                  onClick={() => handleAccept(task)}
                  disabled={!!accepting}
                  className="py-4 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {accepting === task._id ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Accept <ChevronRight className="w-5 h-5" /></>}
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {selectedTask && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedTask.title}</h3>
                <p className="text-xs text-slate-500">{selectedTask.location.address}</p>
              </div>
              <button onClick={() => setSelectedTask(null)} className="p-2 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="h-[420px]">
              <Map
                mapboxAccessToken={MAPBOX_TOKEN}
                mapStyle="mapbox://styles/mapbox/streets-v12"
                initialViewState={{
                  longitude: selectedTask.location.lng || 72.8777,
                  latitude: selectedTask.location.lat || 19.076,
                  zoom: 10,
                }}
                style={{ width: '100%', height: '100%' }}
              >
                {currentLocation && <Marker longitude={currentLocation.lng} latitude={currentLocation.lat} color="#2563eb" />}
                {selectedTask.location.lng && selectedTask.location.lat && (
                  <Marker longitude={selectedTask.location.lng} latitude={selectedTask.location.lat} color="#ef4444" />
                )}
                {routeGeoJson && (
                  <Source id="route" type="geojson" data={routeGeoJson}>
                    <Layer id="route-line" type="line" paint={{ 'line-color': '#0ea5e9', 'line-width': 4, 'line-opacity': 0.9 }} />
                  </Source>
                )}
              </Map>
            </div>

            <div className="p-5 border-t border-slate-200 flex justify-end">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedTask.location.lat},${selectedTask.location.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90"
              >
                Open in Google Maps <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
