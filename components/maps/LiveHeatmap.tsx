"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, {
  Marker,
  NavigationControl,
  GeolocateControl,
  Source,
  Layer,
  MapRef,
  Popup,
} from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin, Navigation } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

const FALLBACK_MAPBOX_TOKEN =
  "pk.eyJ1IjoidGVqYXMwMzA4MDYiLCJhIjoiY21vNXNycDRhMTVwcjJ0czR3cXE3dW5uMyJ9.H8yLp4vnqiO54TYKJ4WsRg";

export type LiveHeatmapVariant = "volunteer" | "ngo";

interface Task {
  _id: string;
  ngoId?: string | { toString(): string };
  title: string;
  priority?: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  status?: string;
}

interface LiveHeatmapProps {
  variant?: LiveHeatmapVariant;
}

const MOCK_TASKS: Task[] = [
  {
    _id: "m1",
    title: "Urgent Medical Aid Required",
    priority: "Critical",
    location: { lat: 19.082, lng: 72.881, address: "Kurla West, Mumbai" },
    status: "Open",
  },
  {
    _id: "m2",
    title: "Flood Relief Volunteer Match",
    priority: "Urgent",
    location: { lat: 19.055, lng: 72.83, address: "Bandra West, Mumbai" },
    status: "Open",
  },
  {
    _id: "m3",
    title: "Food & Supplies Distribution",
    priority: "Medium",
    location: { lat: 19.1136, lng: 72.8697, address: "Andheri East, Mumbai" },
    status: "Open",
  },
  {
    _id: "m4",
    title: "Rescue Operation Coordinator",
    priority: "Low",
    location: { lat: 19.0144, lng: 72.8479, address: "Dadar West, Mumbai" },
    status: "Open",
  },
];

function normalizeNgoId(ngoId: unknown): string {
  if (ngoId == null) return "";
  if (typeof ngoId === "object" && "toString" in (ngoId as object)) {
    return String((ngoId as { toString: () => string }).toString());
  }
  return String(ngoId);
}

function priorityUrgency(p?: string): number {
  switch (p) {
    case "Critical":
      return 6;
    case "Urgent":
      return 5;
    case "Medium":
      return 3;
    case "Low":
      return 2;
    default:
      return 2;
  }
}

function pinClasses(p?: string): string {
  switch (p) {
    case "Critical":
      return "text-red-500 fill-red-500/15";
    case "Urgent":
      return "text-orange-500 fill-orange-500/15";
    case "Medium":
      return "text-amber-500 fill-amber-500/15";
    case "Low":
      return "text-emerald-500 fill-emerald-500/15";
    default:
      return "text-primary fill-primary/15";
  }
}

export default function LiveHeatmap({ variant = "volunteer" }: LiveHeatmapProps) {
  const user = useAuthStore((s) => s.user);
  const mapRef = useRef<MapRef>(null);
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || FALLBACK_MAPBOX_TOKEN;
  const hasMapToken = Boolean(mapboxToken?.length);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [selected, setSelected] = useState<Task | null>(null);
  const [selectedIsMine, setSelectedIsMine] = useState(false);
  const [viewState, setViewState] = useState({
    longitude: 72.8777,
    latitude: 19.076,
    zoom: 11,
  });

  const goMyLoc = useCallback(() => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition((position) => {
      const { longitude, latitude } = position.coords;
      setViewState((v) => ({ ...v, longitude, latitude, zoom: 13 }));
      mapRef.current?.flyTo({
        center: [longitude, latitude],
        zoom: 13,
        duration: 2000,
      });
    });
  }, []);

  useEffect(() => {
    goMyLoc();
  }, [goMyLoc]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch("/api/tasks");
        const data = await res.json();
        if (!Array.isArray(data)) {
          setTasks(MOCK_TASKS);
          return;
        }
        if (data.length > 0) {
          setTasks([...data, ...MOCK_TASKS]);
        } else {
          setTasks(MOCK_TASKS);
        }
      } catch {
        setTasks(MOCK_TASKS);
      }
    };
    fetchTasks();
  }, []);

  const userId = user ? String(user.id || user._id || "") : "";

  const { myTasks, otherTasks } = useMemo(() => {
    if (variant !== "ngo" || !userId) {
      return { myTasks: [] as Task[], otherTasks: [] as Task[] };
    }
    const mine: Task[] = [];
    const other: Task[] = [];
    for (const t of tasks) {
      if (normalizeNgoId(t.ngoId) === userId) mine.push(t);
      else other.push(t);
    }
    return { myTasks: mine, otherTasks: other };
  }, [variant, userId, tasks]);

  const geojsonData = useMemo(() => {
    const features = tasks
      .filter(
        (t) =>
          t.location &&
          typeof t.location.lat === "number" &&
          typeof t.location.lng === "number"
      )
      .map((t) => ({
        type: "Feature" as const,
        properties: { urgency: priorityUrgency(t.priority) },
        geometry: {
          type: "Point" as const,
          coordinates: [t.location.lng, t.location.lat] as [number, number],
        },
      }));
    return { type: "FeatureCollection" as const, features };
  }, [tasks]);

  const heatLayer = useMemo(
    () =>
      ({
        id: "heatmap-layer",
        type: "heatmap",
        maxzoom: 13,
        paint: {
          "heatmap-weight": {
            property: "urgency",
            type: "exponential",
            stops: [
              [1, 1],
              [6, 3],
            ],
          },
          "heatmap-intensity": {
            stops: [
              [11, 1],
              [15, 3],
            ],
          },
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0,
            "rgba(0,0,0,0)",
            0.2,
            "rgb(30, 64, 175)",
            0.4,
            "rgb(14, 165, 233)",
            0.6,
            "rgb(20, 184, 166)",
            0.8,
            "rgb(245, 158, 11)",
            1,
            "rgb(220, 38, 38)",
          ],
          "heatmap-radius": {
            stops: [
              [11, 15],
              [15, 40],
            ],
          },
          "heatmap-opacity": 0.8,
        },
      }),
    []
  );

  const openMarker = (task: Task, isMine: boolean) => {
    setSelected(task);
    setSelectedIsMine(isMine);
  };

  if (!hasMapToken) {
    return (
      <div className="flex h-full min-h-[400px] w-full items-center justify-center rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-center text-sm font-medium text-slate-500">
          Map token is not configured. Add{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">
            NEXT_PUBLIC_MAPBOX_TOKEN
          </code>{" "}
          to enable the live heatmap.
        </p>
      </div>
    );
  }

  const renderVolunteerMarkers = () =>
    tasks.map((task, idx) => (
      <Marker
        key={`v-${task._id}-${idx}`}
        longitude={task.location.lng}
        latitude={task.location.lat}
        anchor="bottom"
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openMarker(task, false);
          }}
          className="focus:outline-none"
        >
          <MapPin
            className={`h-9 w-9 drop-shadow-md transition-transform hover:scale-110 ${pinClasses(
              task.priority
            )}`}
          />
        </button>
      </Marker>
    ));

  const renderNgoMarkers = () => (
    <>
      {otherTasks.map((task, idx) => (
        <Marker
          key={`o-${task._id}-${idx}`}
          longitude={task.location.lng}
          latitude={task.location.lat}
          anchor="bottom"
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openMarker(task, false);
            }}
            className="focus:outline-none"
          >
            <MapPin
              className={`h-8 w-8 drop-shadow-md transition-transform hover:scale-110 ${pinClasses(
                task.priority
              )}`}
            />
          </button>
        </Marker>
      ))}
      {myTasks.map((task, idx) => (
        <Marker
          key={`mine-${task._id}-${idx}`}
          longitude={task.location.lng}
          latitude={task.location.lat}
          anchor="bottom"
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openMarker(task, true);
            }}
            className="relative focus:outline-none"
          >
            <MapPin
              className={`h-10 w-10 drop-shadow-lg transition-transform hover:scale-110 ${pinClasses(
                task.priority
              )}`}
            />
            <span className="absolute -right-1 -top-1 rounded-full border border-slate-200 bg-white px-1 text-[8px] font-black leading-none text-slate-700 shadow-sm">
              MINE
            </span>
          </button>
        </Marker>
      ))}
    </>
  );

  return (
    <div className="group relative h-full min-h-[400px] w-full overflow-hidden rounded-[2rem] border border-slate-200 shadow-sm">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={mapboxToken}
        style={{ width: "100%", height: "100%" }}
        onClick={() => {
          setSelected(null);
          setSelectedIsMine(false);
        }}
      >
        <GeolocateControl position="top-right" />
        <NavigationControl position="top-right" />

        <Source id="all-tasks" type="geojson" data={geojsonData}>
          <Layer {...(heatLayer as any)} />
        </Source>

        {variant === "ngo" ? renderNgoMarkers() : renderVolunteerMarkers()}

        {selected && (
          <Popup
            longitude={selected.location.lng}
            latitude={selected.location.lat}
            anchor="top"
            onClose={() => {
              setSelected(null);
              setSelectedIsMine(false);
            }}
            closeButton
            closeOnClick={false}
            maxWidth="280px"
          >
            <div className="min-w-[220px] rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 shadow-lg">
              {variant === "ngo" && selectedIsMine && (
                <p className="mb-1 text-[10px] font-black uppercase tracking-wide text-primary">
                  Your mission
                </p>
              )}
              <p className="font-bold leading-snug">{selected.title}</p>
              {selected.location.address && (
                <p className="mt-1 text-xs text-slate-500">{selected.location.address}</p>
              )}
              {selected.priority && (
                <p className="mt-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
                  {selected.priority} priority
                </p>
              )}
            </div>
          </Popup>
        )}
      </Map>

      <div className="pointer-events-none absolute bottom-6 left-6 z-10 flex flex-col gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-md backdrop-blur-sm">
          <h4 className="mb-1 flex items-center gap-2 text-sm font-bold text-slate-900">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary shadow-[0_0_10px_rgba(20,184,166,0.6)]" />
            Live Crisis Map
          </h4>
          <p className="text-xs font-medium text-slate-500">
            {tasks.length} active event{tasks.length === 1 ? "" : "s"} on map
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={goMyLoc}
        className="absolute bottom-6 right-6 z-10 rounded-full bg-primary p-4 text-white shadow-lg transition-transform hover:scale-105 hover:bg-primary/90 active:scale-95"
        title="My location"
      >
        <Navigation className="h-6 w-6" />
      </button>
    </div>
  );
}
