"use client";

import { Component, useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import type { Job } from "@/data/jobs";

interface MapViewClientProps {
  jobs: Job[];
  focused: Job | null;
  onSelect: (job: Job) => void;
}

interface MapErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface MapErrorBoundaryState {
  hasError: boolean;
}

class MapErrorBoundary extends Component<MapErrorBoundaryProps, MapErrorBoundaryState> {
  state: MapErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Erreur de rendu de la carte des postes :", error);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

function MapFallback({ message }: { message: string }) {
  return (
    <div className="flex size-full min-h-[320px] items-center justify-center rounded-xl border border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

export function MapView(props: MapViewClientProps) {
  const [ClientMap, setClientMap] = useState<ComponentType<MapViewClientProps> | null>(null);
  const [loadError, setLoadError] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    import("./MapViewClient")
      .then((mod) => {
        if (mountedRef.current) setClientMap(() => mod.default);
      })
      .catch((error) => {
        console.error("Impossible de charger la carte des postes :", error);
        if (mountedRef.current) setLoadError(true);
      });
    return () => {
      mountedRef.current = false;
    };
  }, []);

  if (loadError) {
    return <MapFallback message="La carte n'a pas pu être chargée. Rechargez la page pour réessayer." />;
  }

  if (!ClientMap) {
    return <MapFallback message="Chargement de la carte…" />;
  }

  return (
    <MapErrorBoundary
      fallback={<MapFallback message="Une erreur est survenue lors de l'affichage de la carte." />}
    >
      <ClientMap {...props} />
    </MapErrorBoundary>
  );
}
