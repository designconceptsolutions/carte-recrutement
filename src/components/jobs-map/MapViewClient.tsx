"use client";

import { memo, useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./jobs-map.css";
import type { Job, Pack } from "@/data/jobs";

const FRANCE_CENTER: [number, number] = [46.6, 2.5];
const FRANCE_ZOOM = 6;
const EARTH_RADIUS_METERS = 111_320;
const DISPERSION_RADIUS_METERS = 350;

interface DispersedPosition {
  lat: number;
  lng: number;
}

function createPinIcon(pack: Pack) {
  const modifier = pack === "Diamond" ? "jobs-map-pin--diamond" : "jobs-map-pin--jungle";
  return L.divIcon({
    className: "jobs-map-pin-wrapper",
    html: `<span class="jobs-map-pin ${modifier}"></span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 22],
    popupAnchor: [0, -20],
  });
}

const PIN_ICONS: Record<Pack, L.DivIcon> = {
  Diamond: createPinIcon("Diamond"),
  Jungle: createPinIcon("Jungle"),
};

function coordinateKey(job: Job) {
  return `${job.lat.toFixed(4)}|${job.lng.toFixed(4)}`;
}

function computeDispersedPositions(jobs: Job[]): Map<string, DispersedPosition> {
  const groups = new Map<string, Job[]>();
  for (const job of jobs) {
    if (!Number.isFinite(job.lat) || !Number.isFinite(job.lng)) continue;
    const key = coordinateKey(job);
    const group = groups.get(key);
    if (group) group.push(job);
    else groups.set(key, [job]);
  }

  const positions = new Map<string, DispersedPosition>();
  for (const group of groups.values()) {
    if (group.length === 1) {
      positions.set(group[0].id, { lat: group[0].lat, lng: group[0].lng });
      continue;
    }
    const baseLat = group[0].lat;
    const latDelta = DISPERSION_RADIUS_METERS / EARTH_RADIUS_METERS;
    const lngDelta =
      DISPERSION_RADIUS_METERS / (EARTH_RADIUS_METERS * Math.cos((baseLat * Math.PI) / 180));
    group.forEach((job, index) => {
      const angle = (2 * Math.PI * index) / group.length;
      positions.set(job.id, {
        lat: job.lat + latDelta * Math.sin(angle),
        lng: job.lng + lngDelta * Math.cos(angle),
      });
    });
  }
  return positions;
}

function FlyToFocused({
  focused,
  positions,
}: {
  focused: Job | null;
  positions: Map<string, DispersedPosition>;
}) {
  const map = useMap();

  useEffect(() => {
    if (!focused) return;
    const position = positions.get(focused.id);
    if (!position || !Number.isFinite(position.lat) || !Number.isFinite(position.lng)) return;
    map.flyTo([position.lat, position.lng], Math.max(map.getZoom(), 12), { duration: 1 });
  }, [focused, positions, map]);

  return null;
}

interface MapViewClientProps {
  jobs: Job[];
  focused: Job | null;
  onSelect: (job: Job) => void;
}

function MapViewClient({ jobs, focused, onSelect }: MapViewClientProps) {
  const validJobs = useMemo(
    () => jobs.filter((job) => Number.isFinite(job.lat) && Number.isFinite(job.lng)),
    [jobs]
  );
  const positions = useMemo(() => computeDispersedPositions(validJobs), [validJobs]);

  return (
    <MapContainer
      center={FRANCE_CENTER}
      zoom={FRANCE_ZOOM}
      preferCanvas
      className="size-full rounded-xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyToFocused focused={focused} positions={positions} />
      {validJobs.map((job) => {
        const position = positions.get(job.id);
        if (!position || !Number.isFinite(position.lat) || !Number.isFinite(position.lng)) {
          return null;
        }
        return (
          <Marker
            key={job.id}
            position={[position.lat, position.lng]}
            icon={PIN_ICONS[job.pack]}
            eventHandlers={{ click: () => onSelect(job) }}
          >
            <Popup className="jobs-map-popup">
              <div className="flex flex-col gap-2 p-3">
                <img
                  src={job.image}
                  alt={`${job.establishment} — ${job.roleVariant}`}
                  loading="lazy"
                  className="h-24 w-full rounded-md object-cover"
                />
                <span
                  className={
                    job.pack === "Diamond"
                      ? "w-fit rounded-full bg-diamond px-2 py-0.5 text-[10px] font-medium text-diamond-foreground"
                      : "w-fit rounded-full bg-jungle px-2 py-0.5 text-[10px] font-medium text-jungle-foreground"
                  }
                >
                  {job.pack}
                </span>
                <p className="text-sm font-medium text-foreground">{job.establishment}</p>
                <p className="text-xs text-muted-foreground">
                  {job.city} · {job.roleVariant}
                </p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

export default memo(MapViewClient);
