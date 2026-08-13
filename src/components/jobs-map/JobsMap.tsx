"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MapPin, MapPinOff, Search, Sparkles, Users, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  JOBS,
  REGIONS,
  ROLE_GROUPS,
  TYPES,
  type Job,
  type Pack,
} from "@/data/jobs";
import { MapView } from "./MapView";

type Tab = "Tous" | Pack | "Nouveautés";

const TABS: Tab[] = ["Tous", "Diamond", "Jungle", "Nouveautés"];
const ALL = "Toutes";
const ALL_ROLES = "Tous les métiers";
const ALL_TYPES = "Tous les types";

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

const DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");

function normalize(value: string): string {
  return value.normalize("NFD").replace(DIACRITICS, "").toLowerCase();
}

/** Initiales de l'enseigne, en guise de vignette (le tableau n'a pas de photo).
 *  Un nom en un seul mot (« SBM ») donne ses deux premières lettres. */
function initials(name: string): string {
  const words = name.split(/\s+/).filter((w) => w.length > 1);
  if (words.length === 0) return name.slice(0, 2).toUpperCase();
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return words
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export function JobsMap() {
  const [tab, setTab] = useState<Tab>("Tous");
  const [role, setRole] = useState(ALL_ROLES);
  const [region, setRegion] = useState(ALL);
  const [type, setType] = useState(ALL_TYPES);
  const [focused, setFocused] = useState<Job | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [detailsJob, setDetailsJob] = useState<Job | null>(null);

  const debouncedQuery = useDebouncedValue(searchQuery, 180);

  const filteredJobs = useMemo(() => {
    const query = normalize(debouncedQuery.trim());
    return JOBS.filter((job) => {
      if (tab === "Diamond" || tab === "Jungle") {
        if (job.pack !== tab) return false;
      } else if (tab === "Nouveautés" && !job.firstSeenAt) {
        return false;
      }
      if (role !== ALL_ROLES && job.roleGroup !== role) return false;
      if (region !== ALL && job.region !== region) return false;
      if (type !== ALL_TYPES && job.type !== type) return false;
      if (query) {
        const haystack = normalize(
          `${job.establishment} ${job.city ?? ""} ${job.roleVariant} ${job.roleGroup}`
        );
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [tab, role, region, type, debouncedQuery]);

  const newCount = useMemo(() => JOBS.filter((j) => j.firstSeenAt).length, []);
  const unlocatedCount = filteredJobs.filter((j) => j.lat === undefined).length;
  const soughtTotal = filteredJobs.reduce((sum, j) => sum + j.sought, 0);

  const hasFilters =
    role !== ALL_ROLES || region !== ALL || type !== ALL_TYPES || searchQuery.trim() !== "";

  const resetFilters = useCallback(() => {
    setRole(ALL_ROLES);
    setRegion(ALL);
    setType(ALL_TYPES);
    setSearchQuery("");
  }, []);

  const handleFocus = useCallback((job: Job) => setFocused(job), []);

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      {/* Onglets + recherche */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="Filtrer par pack"
          className="flex flex-wrap items-center gap-1 rounded-lg bg-muted p-1"
        >
          {TABS.map((option) => {
            const active = tab === option;
            return (
              <button
                key={option}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(option)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition",
                  active
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {option === "Diamond" && <span className="size-2 rounded-full bg-diamond" aria-hidden />}
                {option === "Jungle" && <span className="size-2 rounded-full bg-jungle" aria-hidden />}
                {option === "Nouveautés" && <Sparkles className="size-3.5" aria-hidden />}
                {option}
                {option === "Nouveautés" && (
                  <span className="text-xs text-muted-foreground">({newCount})</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="relative w-full max-w-xs">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un établissement, une ville…"
            className="h-9 pl-8"
            aria-label="Rechercher un poste"
          />
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="h-9 w-[190px]" aria-label="Filtrer par métier">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_ROLES}>{ALL_ROLES}</SelectItem>
            {ROLE_GROUPS.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={region} onValueChange={setRegion}>
          <SelectTrigger className="h-9 w-[220px]" aria-label="Filtrer par région">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Toutes les régions</SelectItem>
            {REGIONS.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="h-9 w-[180px]" aria-label="Filtrer par type d'établissement">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_TYPES}>{ALL_TYPES}</SelectItem>
            {TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button type="button" variant="ghost" size="sm" onClick={resetFilters}>
            <X className="size-3.5" aria-hidden />
            Réinitialiser
          </Button>
        )}

        <p className="ml-auto text-sm text-muted-foreground" aria-live="polite">
          {filteredJobs.length} ligne{filteredJobs.length > 1 ? "s" : ""} ·{" "}
          <strong className="font-medium text-foreground">{soughtTotal}</strong> poste
          {soughtTotal > 1 ? "s" : ""} à pourvoir
          {unlocatedCount > 0 && (
            <span className="text-muted-foreground"> · {unlocatedCount} à localiser</span>
          )}
        </p>
      </div>

      {/* Liste + carte */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[360px_1fr]">
        <ScrollArea className="h-[420px] rounded-xl border border-border lg:h-full">
          <div className="flex flex-col gap-1.5 p-1.5">
            {filteredJobs.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">
                Aucun poste ne correspond à ces filtres.
              </p>
            ) : (
              filteredJobs.map((job) => {
                const isFocused = focused?.id === job.id;
                const located = job.lat !== undefined;
                return (
                  <div
                    key={job.id}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isFocused}
                    aria-label={`${job.establishment}, ${job.roleVariant}${job.city ? `, ${job.city}` : ""}`}
                    onClick={() => handleFocus(job)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleFocus(job);
                      }
                    }}
                    className={cn(
                      "flex cursor-pointer gap-3 rounded-lg border p-2.5 text-left transition outline-none",
                      "focus-visible:ring-2 focus-visible:ring-ring",
                      isFocused
                        ? "border-brand bg-brand-soft/40"
                        : "border-transparent hover:bg-muted/60"
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-11 shrink-0 items-center justify-center rounded-md text-xs font-semibold",
                        job.pack === "Diamond"
                          ? "bg-diamond/15 text-diamond"
                          : "bg-jungle/15 text-jungle"
                      )}
                      aria-hidden
                    >
                      {initials(job.establishment)}
                    </span>

                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <span className="truncate text-sm font-medium text-foreground">
                          {job.establishment}
                        </span>
                        {job.firstSeenAt && (
                          <Badge className="shrink-0 bg-brand text-brand-foreground text-[10px]">
                            Nouveau
                          </Badge>
                        )}
                      </div>

                      <p className="truncate text-xs text-muted-foreground">{job.roleVariant}</p>

                      <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                        {located ? (
                          <>
                            <MapPin className="size-3 shrink-0" aria-hidden />
                            <span className="truncate">{job.city}</span>
                          </>
                        ) : (
                          <>
                            <MapPinOff className="size-3 shrink-0" aria-hidden />
                            <span className="truncate italic">Localisation à confirmer</span>
                          </>
                        )}
                        {job.type && <span className="shrink-0">· {job.type}</span>}
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="size-3 shrink-0" aria-hidden />
                          {job.sought} recherché{job.sought > 1 ? "s" : ""} · {job.sent} envoyé
                          {job.sent > 1 ? "s" : ""}
                        </span>
                        <Button
                          type="button"
                          size="xs"
                          variant="ghost"
                          className="shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDetailsJob(job);
                          }}
                        >
                          Détails
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        {/* `isolate` : Leaflet monte jusqu'à z-index 1000 et passerait sinon
            par-dessus le voile de la modale (z-50). */}
        <div className="isolate h-[420px] overflow-hidden rounded-xl border border-border lg:h-full">
          <MapView jobs={filteredJobs} focused={focused} onSelect={handleFocus} />
        </div>
      </div>

      <Dialog open={detailsJob !== null} onOpenChange={(open) => !open && setDetailsJob(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
          {detailsJob && (
            <>
              <DialogHeader>
                <DialogTitle>{detailsJob.roleVariant}</DialogTitle>
                <DialogDescription>
                  {detailsJob.establishment}
                  {detailsJob.city ? ` — ${detailsJob.city}` : ""}
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-wrap items-center gap-1.5">
                <Badge
                  className={
                    detailsJob.pack === "Diamond"
                      ? "bg-diamond text-diamond-foreground"
                      : "bg-jungle text-jungle-foreground"
                  }
                >
                  {detailsJob.pack}
                </Badge>
                {detailsJob.type && <Badge variant="outline">{detailsJob.type}</Badge>}
                <Badge variant="outline">{detailsJob.roleGroup}</Badge>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>
                  <strong className="text-foreground">{detailsJob.sought}</strong> poste
                  {detailsJob.sought > 1 ? "s" : ""} recherché{detailsJob.sought > 1 ? "s" : ""}
                </span>
                <span>
                  <strong className="text-foreground">{detailsJob.sent}</strong> candidat
                  {detailsJob.sent > 1 ? "s" : ""} envoyé{detailsJob.sent > 1 ? "s" : ""}
                </span>
              </div>

              {detailsJob.note && (
                <p className="rounded-md bg-muted/60 p-2 text-sm text-muted-foreground">
                  {detailsJob.note}
                </p>
              )}

              <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                {detailsJob.region ? (
                  <span>
                    {detailsJob.region}, {detailsJob.country}
                    {detailsJob.precision === "ville" && " — position au niveau de la commune"}
                  </span>
                ) : (
                  <span className="italic">
                    Localisation à confirmer : cette enseigne n&apos;est pas encore rattachée à une
                    ville, elle n&apos;apparaît donc pas sur la carte.
                  </span>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
