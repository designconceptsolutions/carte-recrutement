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

function hasCoords(job: Job): job is Job & { lat: number; lng: number } {
  return Number.isFinite(job.lat) && Number.isFinite(job.lng);
}

function coordinateKey(job: Job & { lat: number; lng: number }) {
  return `${job.lat.toFixed(4)}|${job.lng.toFixed(4)}`;
}

function computeDispersedPositions(
  jobs: (Job & { lat: number; lng: number })[]
): Map<string, DispersedPosition> {
  const groups = new Map<string, (Job & { lat: number; lng: number })[]>();
  for (const job of jobs) {
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

/** Recadre la vue sur l'ensemble des postes affichés. Utile car les données
 *  débordent largement la France (Monaco, Saint-Barth, Nouméa, Marrakech) :
 *  au cadrage par défaut, ces marqueurs sont hors écran. */
function FitBoundsControl({ positions }: { positions: Map<string, DispersedPosition> }) {
  const map = useMap();

  const fit = () => {
    const points = Array.from(positions.values()).filter(
      (p) => Number.isFinite(p.lat) && Number.isFinite(p.lng)
    );
    if (points.length === 0) return;
    map.fitBounds(
      points.map((p) => [p.lat, p.lng] as [number, number]),
      { padding: [40, 40], maxZoom: 12 }
    );
  };

  return (
    <div className="leaflet-top leaflet-right">
      <div className="leaflet-control leaflet-bar">
        <a
          href="#"
          role="button"
          title="Recadrer sur tous les postes affichés"
          onClick={(event) => {
            event.preventDefault();
            fit();
          }}
          className="!flex !w-auto items-center gap-1 !px-2 text-xs font-medium"
        >
          Recadrer
        </a>
      </div>
    </div>
  );
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
  const validJobs = useMemo(() => jobs.filter(hasCoords), [jobs]);
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
      <FitBoundsControl positions={positions} />
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
              <div className="flex flex-col gap-1.5 p-3">
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
                  {job.roleVariant}
                  {job.city ? ` · ${job.city}` : ""}
                </p>
                <p className="text-xs text-muted-foreground">
                  {job.sought} recherché{job.sought > 1 ? "s" : ""} · {job.sent} envoyé
                  {job.sent > 1 ? "s" : ""}
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
