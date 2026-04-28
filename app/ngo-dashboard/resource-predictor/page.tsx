"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, { Marker, Popup, MapRef } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { AlertTriangle, Droplets, HeartPulse, Navigation, Shield, Stethoscope, Warehouse } from "lucide-react";

const MAPBOX_TOKEN =
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
  process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

type ResourceType = "hospital" | "clinic" | "pharmacy" | "police" | "veterinary" | "warehouse" | "blackstore";
interface NearbyResource {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: ResourceType;
  address?: string;
  phone?: string;
  description?: string;
}

interface Task {
  _id: string;
  status: string;
  priority?: string;
}

const inventory = [
  { item: "Water Purification Tablets", inStock: 5400, burnRatePerMissionHour: 95 },
  { item: "Dog Food", inStock: 1200, burnRatePerMissionHour: 12 },
  { item: "First Aid Kits", inStock: 360, burnRatePerMissionHour: 5 },
  { item: "Food Box", inStock: 140, burnRatePerMissionHour: 1.4 },
];

const typeStyles: Record<ResourceType, { color: string; label: string }> = {
  hospital: { color: "#dc2626", label: "Hospital" },
  clinic: { color: "#ea580c", label: "Clinic" },
  pharmacy: { color: "#16a34a", label: "Medical / Pharmacy" },
  police: { color: "#1d4ed8", label: "Police Station" },
  veterinary: { color: "#9333ea", label: "Animal Care" },
  warehouse: { color: "#0f766e", label: "Warehouse" },
  blackstore: { color: "#111827", label: "Blackstore Reserve" },
};

export default function ResourcePredictorPage() {
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState({
    longitude: 72.93,
    latitude: 19.06,
    zoom: 10.2,
  });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [resources, setResources] = useState<NearbyResource[]>([]);
  const [selected, setSelected] = useState<NearbyResource | null>(null);
  const [requestSent, setRequestSent] = useState(false);
  const [loc, setLoc] = useState({ lat: 19.076, lng: 72.8777 });

  useEffect(() => {
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((d) => setTasks(Array.isArray(d) ? d : []))
      .catch(() => setTasks([]));
  }, []);

  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const lat = p.coords.latitude;
        const lng = p.coords.longitude;
        setLoc({ lat, lng });
        setViewState((vs) => ({ ...vs, latitude: lat, longitude: lng, zoom: Math.max(vs.zoom, 11) }));
      },
      () => {}
    );
  }, []);

  const zoomToMyLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      alert("Geolocation is not supported in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const lat = p.coords.latitude;
        const lng = p.coords.longitude;
        setLoc({ lat, lng });
        setViewState((vs) => ({ ...vs, latitude: lat, longitude: lng, zoom: 14 }));
        mapRef.current?.flyTo({ center: [lng, lat], zoom: 14, duration: 1200 });
      },
      () => alert("Could not read your location. Allow location access and try again."),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    );
  }, []);

  useEffect(() => {
    fetch(`/api/nearby-resources?lat=${loc.lat}&lng=${loc.lng}`)
      .then((r) => r.json())
      .then((d) => setResources(Array.isArray(d.resources) ? d.resources : []))
      .catch(() => setResources([]));
  }, [loc.lat, loc.lng]);

  const activeMissions = tasks.filter((t) => t.status === "In Progress" || t.status === "Open");
  const activeFactor = Math.max(1, activeMissions.length);

  const getDistanceKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const rad = (x: number) => (x * Math.PI) / 180;
    const R = 6371;
    const dLat = rad(lat2 - lat1);
    const dLng = rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const predictions = useMemo(
    () =>
      inventory.map((entry) => {
        const burnPerHour = entry.burnRatePerMissionHour * activeFactor;
        const hoursLeft = entry.inStock / burnPerHour;
        return { ...entry, burnPerHour, hoursLeft };
      }),
    [activeFactor]
  );

  const mostCritical = [...predictions].sort((a, b) => a.hoursLeft - b.hoursLeft)[0];

  return (
    <div className="space-y-8 pb-20">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-3xl font-black tracking-tight text-slate-900">Smart Inventory Oracle</h2>
        <p className="mt-1 text-slate-500">Logistics AI predicts depletion windows based on active missions.</p>
      </div>

      <div className="rounded-[2rem] border border-orange-200 bg-orange-50 p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-6 w-6 text-orange-600" />
          <div>
            <p className="text-sm font-black uppercase tracking-wider text-orange-700">Live Warning</p>
            <p className="mt-1 text-sm text-orange-900">
              Based on {activeMissions.length} active missions, you may run out of{" "}
              <span className="font-bold">{mostCritical.item}</span> in approximately{" "}
              <span className="font-bold">{Math.max(1, Math.round(mostCritical.hoursLeft))} hours</span>.
            </p>
            <button
              onClick={() => {
                setRequestSent(true);
                setTimeout(() => setRequestSent(false), 2200);
              }}
              className="mt-3 rounded-xl bg-orange-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-orange-700"
            >
              Auto-generate donation request
            </button>
          </div>
        </div>
      </div>

      {requestSent && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700 shadow-sm">
          Request sent successfully to partner donor network.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {predictions.map((p) => (
          <div key={p.item} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">{p.item}</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{Math.round(p.hoursLeft)}h</p>
            <p className="text-xs text-slate-500">Burn rate: {p.burnPerHour.toFixed(1)} / hour</p>
          </div>
        ))}
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-slate-900">Nearby Emergency Resources</h3>
            <p className="text-sm text-slate-500">Hospitals, clinics, police, veterinary points, and reserve supply stores.</p>
          </div>
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          {Object.entries(typeStyles).map(([type, meta]) => (
            <span key={type} className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-700">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
              {meta.label}
            </span>
          ))}
        </div>

        <div className="relative h-[520px] overflow-hidden rounded-2xl border border-slate-200">
          <Map
            ref={mapRef}
            mapboxAccessToken={MAPBOX_TOKEN}
            mapStyle="mapbox://styles/mapbox/streets-v12"
            {...viewState}
            onMove={(evt) => setViewState(evt.viewState)}
            style={{ width: "100%", height: "100%" }}
            onClick={() => setSelected(null)}
          >
            <Marker longitude={loc.lng} latitude={loc.lat} anchor="bottom">
              <div className="rounded-full border-2 border-white bg-primary p-2 shadow-lg">
                <Shield className="h-4 w-4 text-white" />
              </div>
            </Marker>

            {resources.map((r) => (
              <Marker key={r.id} longitude={r.lng} latitude={r.lat} anchor="bottom">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelected(r);
                  }}
                >
                  <div className="rounded-full border-2 border-white p-2 shadow-lg" style={{ backgroundColor: typeStyles[r.type].color }}>
                    {r.type === "hospital" && <HeartPulse className="h-4 w-4 text-white" />}
                    {r.type === "clinic" && <Stethoscope className="h-4 w-4 text-white" />}
                    {r.type === "pharmacy" && <Droplets className="h-4 w-4 text-white" />}
                    {r.type === "police" && <Shield className="h-4 w-4 text-white" />}
                    {r.type === "veterinary" && <HeartPulse className="h-4 w-4 text-white" />}
                    {r.type === "warehouse" && <Warehouse className="h-4 w-4 text-white" />}
                    {r.type === "blackstore" && <Warehouse className="h-4 w-4 text-white" />}
                  </div>
                </button>
              </Marker>
            ))}

            {selected && (
              <Popup longitude={selected.lng} latitude={selected.lat} anchor="top" onClose={() => setSelected(null)}>
                <div className="min-w-[220px] p-1">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-500">{typeStyles[selected.type].label}</p>
                  <p className="text-sm font-bold text-slate-900">{selected.name}</p>
                  <p className="text-xs text-slate-500">{selected.address || "Address unavailable"}</p>
                  <p className="mt-1 text-xs text-slate-500">Phone: {selected.phone || "N/A"}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Distance: {getDistanceKm(loc.lat, loc.lng, selected.lat, selected.lng).toFixed(1)} km
                  </p>
                  <p className="mt-1 text-xs text-slate-600">{selected.description || "Emergency support resource."}</p>
                </div>
              </Popup>
            )}
          </Map>
          <button
            type="button"
            onClick={zoomToMyLocation}
            className="absolute bottom-4 right-4 z-10 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 shadow-lg transition hover:bg-slate-50"
          >
            <Navigation className="h-5 w-5 text-primary" />
            My location
          </button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {resources.slice(0, 8).map((r) => (
            <button
              key={`card-${r.id}`}
              onClick={() => setSelected(r)}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-left hover:bg-white"
            >
              <p className="text-xs font-black uppercase tracking-wider text-slate-500">{typeStyles[r.type].label}</p>
              <p className="text-sm font-bold text-slate-900">{r.name}</p>
              <p className="text-xs text-slate-500">{r.address || "Address unavailable"}</p>
              <p className="text-xs text-slate-500">Phone: {r.phone || "N/A"}</p>
              <p className="text-xs text-slate-500">
                Distance: {getDistanceKm(loc.lat, loc.lng, r.lat, r.lng).toFixed(1)} km
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
