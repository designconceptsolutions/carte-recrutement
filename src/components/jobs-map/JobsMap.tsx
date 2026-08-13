"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MapPin, Search, Sparkles, Users, X } from "lucide-react";
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
  NEW_BADGE_DAYS,
  NEW_TAB_DAYS,
  REGIONS,
  ROLE_GROUPS,
  daysSince,
  type Job,
  type Pack,
} from "@/data/jobs";
import { MapView } from "./MapView";

type Tab = "Tous" | Pack | "Nouveautés";

const TABS: Tab[] = ["Tous", "Diamond", "Jungle", "Nouveautés"];
const ALL = "Toutes";
const ALL_ROLES = "Tous les postes";

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

const DIACRITICS_PATTERN = new RegExp("[\\u0300-\\u036f]", "g");

function normalize(value: string): string {
  return value.normalize("NFD").replace(DIACRITICS_PATTERN, "").toLowerCase();
}

function packDotClass(pack: Pack) {
  return pack === "Diamond" ? "bg-diamond" : "bg-jungle";
}

function formatDate(iso?: string) {
  if (!iso) return null;
  const parsed = Date.parse(iso);
  if (Number.isNaN(parsed)) return null;
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(parsed);
}

/** Libellé pluriel simple : `1 poste` / `4 postes`. */
function plural(count: number, word: string) {
  return `${count} ${word}${count > 1 ? "s" : ""}`;
}

export function JobsMap() {
  const [tab, setTab] = useState<Tab>("Tous");
  const [role, setRole] = useState<string>(ALL_ROLES);
  const [region, setRegion] = useState<string>(ALL);
  const [contract, setContract] = useState<string>(ALL);
  const [housing, setHousing] = useState<string>(ALL);
  const [focused, setFocused] = useState<Job | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [detailsJob, setDetailsJob] = useState<Job | null>(null);

  const debouncedQuery = useDebouncedValue(searchQuery, 180);

  const filteredJobs = useMemo(() => {
    const query = normalize(debouncedQuery.trim());
    return JOBS.filter((job) => {
      if (tab === "Diamond" || tab === "Jungle") {
        if (job.pack !== tab) return false;
      } else if (tab === "Nouveautés") {
        const age = daysSince(job.createdAt);
        if (age === null || age > NEW_TAB_DAYS) return false;
      }
      if (role !== ALL_ROLES && job.roleGroup !== role) return false;
      if (region !== ALL && job.region !== region) return false;
      if (contract !== ALL && job.contract !== contract && job.contract !== "CDI/CDD") return false;
      if (housing !== ALL && job.housing !== housing) return false;
      if (query) {
        const haystack = normalize(
          `${job.establishment} ${job.city} ${job.roleVariant} ${job.roleGroup}`
        );
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [tab, role, region, contract, housing, debouncedQuery]);

  const newCount = useMemo(
    () =>
      JOBS.filter((job) => {
        const age = daysSince(job.createdAt);
        return age !== null && age <= NEW_TAB_DAYS;
      }).length,
    []
  );

  const hasFilters =
    role !== ALL_ROLES ||
    region !== ALL ||
    contract !== ALL ||
    housing !== ALL ||
    searchQuery.trim() !== "";

  const resetFilters = useCallback(() => {
    setRole(ALL_ROLES);
    setRegion(ALL);
    setContract(ALL);
    setHousing(ALL);
    setSearchQuery("");
  }, []);

  const handleFocus = useCallback((job: Job) => {
    setFocused(job);
  }, []);

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
                {option === "Diamond" && (
                  <span className="size-2 rounded-full bg-diamond" aria-hidden />
                )}
                {option === "Jungle" && (
                  <span className="size-2 rounded-full bg-jungle" aria-hidden />
                )}
                {option === "Nouveautés" && <Sparkles className="size-3.5" aria-hidden />}
                {option}
                {option === "Nouveautés" && newCount > 0 && (
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
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Rechercher un établissement, une ville…"
            className="h-9 pl-8"
            aria-label="Rechercher un poste"
          />
        </div>
      </div>

      {/* Filtres : quatre listes déroulantes alignées */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="h-9 w-[210px]" aria-label="Filtrer par poste">
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
          <SelectTrigger className="h-9 w-[200px]" aria-label="Filtrer par région">
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

        <Select value={contract} onValueChange={setContract}>
          <SelectTrigger className="h-9 w-[150px]" aria-label="Filtrer par contrat">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Tous contrats</SelectItem>
            <SelectItem value="CDI">CDI</SelectItem>
            <SelectItem value="CDD">CDD</SelectItem>
          </SelectContent>
        </Select>

        <Select value={housing} onValueChange={setHousing}>
          <SelectTrigger className="h-9 w-[160px]" aria-label="Filtrer par logement">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Tous logements</SelectItem>
            <SelectItem value="Logé">Logé</SelectItem>
            <SelectItem value="Non logé">Non logé</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button type="button" variant="ghost" size="sm" onClick={resetFilters}>
            <X className="size-3.5" aria-hidden />
            Réinitialiser
          </Button>
        )}

        <p className="ml-auto text-sm text-muted-foreground" aria-live="polite">
          {plural(filteredJobs.length, "poste")}
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
                const age = daysSince(job.createdAt);
                const isNew = age !== null && age <= NEW_BADGE_DAYS;
                return (
                  <div
                    key={job.id}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isFocused}
                    // Sans libellé explicite, le nom accessible de la carte serait
                    // tout son texte (« … Détails »), ce qui la rend indistincte
                    // du bouton qu'elle contient pour un lecteur d'écran.
                    aria-label={`${job.establishment}, ${job.roleVariant}, ${job.city}`}
                    onClick={() => handleFocus(job)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
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
                    {/* Conteneur `overflow-hidden` : si l'image 404, le texte
                        alternatif reste confiné au carré au lieu de déborder. */}
                    <span className="size-14 shrink-0 overflow-hidden rounded-md bg-muted">
                      <img
                        src={job.image}
                        alt={`${job.establishment} à ${job.city}`}
                        loading="lazy"
                        className="size-full object-cover text-[9px] text-muted-foreground"
                      />
                    </span>

                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <span
                          className={cn("size-2 shrink-0 rounded-full", packDotClass(job.pack))}
                          aria-hidden
                        />
                        <span className="truncate text-sm font-medium text-foreground">
                          {job.establishment}
                        </span>
                        {isNew && (
                          <Badge className="shrink-0 bg-brand text-brand-foreground text-[10px]">
                            Nouveau
                          </Badge>
                        )}
                      </div>

                      <p className="truncate text-xs text-muted-foreground">{job.roleVariant}</p>

                      <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex min-w-0 items-center gap-1">
                          <MapPin className="size-3 shrink-0" aria-hidden />
                          <span className="truncate">{job.city}</span>
                        </span>
                        {job.contract && <span className="shrink-0">· {job.contract}</span>}
                        {job.housing && <span className="shrink-0">· {job.housing}</span>}
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="size-3 shrink-0" aria-hidden />
                          {job.sought ?? 0} recherché{(job.sought ?? 0) > 1 ? "s" : ""} ·{" "}
                          {job.sent ?? 0} envoyé{(job.sent ?? 0) > 1 ? "s" : ""}
                        </span>
                        <Button
                          type="button"
                          size="xs"
                          variant="ghost"
                          className="shrink-0"
                          onClick={(event) => {
                            event.stopPropagation();
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

        {/* `isolate` : Leaflet pose ses panneaux/contrôles jusqu'à z-index 1000,
            ce qui les ferait passer par-dessus le voile de la modale (z-50).
            Un contexte d'empilement local les y confine. */}
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
                  {detailsJob.establishment} — {detailsJob.city}
                </DialogDescription>
              </DialogHeader>

              <img
                src={detailsJob.image}
                alt={`${detailsJob.establishment} à ${detailsJob.city}`}
                loading="lazy"
                className="h-40 w-full rounded-lg bg-muted object-cover"
              />

              <div className="flex flex-wrap items-center gap-1.5">
                <Badge
                  className={cn(
                    detailsJob.pack === "Diamond"
                      ? "bg-diamond text-diamond-foreground"
                      : "bg-jungle text-jungle-foreground"
                  )}
                >
                  {detailsJob.pack}
                </Badge>
                {detailsJob.contract && <Badge variant="outline">{detailsJob.contract}</Badge>}
                {detailsJob.housing && <Badge variant="outline">{detailsJob.housing}</Badge>}
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>
                  <strong className="text-foreground">{detailsJob.sought ?? 0}</strong> poste
                  {(detailsJob.sought ?? 0) > 1 ? "s" : ""} recherché
                  {(detailsJob.sought ?? 0) > 1 ? "s" : ""}
                </span>
                <span>
                  <strong className="text-foreground">{detailsJob.sent ?? 0}</strong> candidat
                  {(detailsJob.sent ?? 0) > 1 ? "s" : ""} envoyé
                  {(detailsJob.sent ?? 0) > 1 ? "s" : ""}
                </span>
              </div>

              {detailsJob.details && (
                <p className="whitespace-pre-line text-sm text-muted-foreground">
                  {detailsJob.details}
                </p>
              )}

              <div className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                {detailsJob.region && (
                  <span>
                    {detailsJob.region}, {detailsJob.country}
                  </span>
                )}
                {formatDate(detailsJob.createdAt) && (
                  <span>Entré le {formatDate(detailsJob.createdAt)}</span>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
