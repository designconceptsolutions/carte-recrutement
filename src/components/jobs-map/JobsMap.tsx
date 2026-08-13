"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, MapPin, Search, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { JOBS, REGIONS, ROLE_GROUPS, type Job, type Pack } from "@/data/jobs";
import { MapView } from "./MapView";

type PackFilter = "Tous" | Pack;
type ContractFilter = "Tous" | "CDI" | "CDD";
type HousingFilter = "Tous" | "Logé" | "Non logé";

const ALL_REGIONS = "Toutes";

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

function packBadgeClass(pack: Pack) {
  return pack === "Diamond"
    ? "bg-diamond text-diamond-foreground"
    : "bg-jungle text-jungle-foreground";
}

export function JobsMap() {
  const [pack, setPack] = useState<PackFilter>("Tous");
  const [region, setRegion] = useState<string>(ALL_REGIONS);
  const [contract, setContract] = useState<ContractFilter>("Tous");
  const [housing, setHousing] = useState<HousingFilter>("Tous");
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
  const [focused, setFocused] = useState<Job | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedDetails, setExpandedDetails] = useState<Set<string>>(new Set());
  const [detailsJob, setDetailsJob] = useState<Job | null>(null);

  const debouncedQuery = useDebouncedValue(searchQuery, 180);

  const filteredJobs = useMemo(() => {
    const query = normalize(debouncedQuery.trim());
    return JOBS.filter((job) => {
      if (pack !== "Tous" && job.pack !== pack) return false;
      if (region !== ALL_REGIONS && job.region !== region) return false;
      if (contract !== "Tous" && job.contract !== contract && job.contract !== "CDI/CDD") {
        return false;
      }
      if (housing !== "Tous" && job.housing !== housing) return false;
      if (selectedRoles.size > 0 && !selectedRoles.has(job.roleGroup)) return false;
      if (query) {
        const haystack = normalize(
          `${job.establishment} ${job.city} ${job.roleVariant} ${job.roleGroup}`
        );
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [pack, region, contract, housing, selectedRoles, debouncedQuery]);

  const roleCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const job of filteredJobs) {
      counts.set(job.roleGroup, (counts.get(job.roleGroup) ?? 0) + 1);
    }
    return counts;
  }, [filteredJobs]);

  const handleFocus = useCallback((job: Job) => {
    setFocused(job);
  }, []);

  const toggleRole = useCallback((role: string) => {
    setSelectedRoles((prev) => {
      const next = new Set(prev);
      if (next.has(role)) next.delete(role);
      else next.add(role);
      return next;
    });
  }, []);

  const toggleDetails = useCallback((jobId: string) => {
    setExpandedDetails((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) next.delete(jobId);
      else next.add(jobId);
      return next;
    });
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {(["Tous", "Diamond", "Jungle"] as const).map((option) => (
            <Button
              key={option}
              type="button"
              size="sm"
              variant={pack === option ? "default" : "outline"}
              onClick={() => setPack(option)}
            >
              {option}
            </Button>
          ))}

          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Région" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_REGIONS}>Toutes les régions</SelectItem>
              {REGIONS.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
            {(["Tous", "CDI", "CDD"] as const).map((option) => (
              <Button
                key={option}
                type="button"
                size="sm"
                variant={contract === option ? "secondary" : "ghost"}
                onClick={() => setContract(option)}
              >
                {option}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
            {(["Tous", "Logé", "Non logé"] as const).map((option) => (
              <Button
                key={option}
                type="button"
                size="sm"
                variant={housing === option ? "secondary" : "ghost"}
                onClick={() => setHousing(option)}
              >
                {option}
              </Button>
            ))}
          </div>

          <div className="relative ml-auto w-full max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Établissement, ville, poste…"
              className="pl-8"
              aria-label="Rechercher un poste"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {ROLE_GROUPS.map((role) => {
            const active = selectedRoles.has(role);
            const count = roleCounts.get(role) ?? 0;
            return (
              <button
                key={role}
                type="button"
                onClick={() => toggleRole(role)}
                aria-pressed={active}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs font-medium transition",
                  active
                    ? "border-brand bg-brand-soft text-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-muted"
                )}
              >
                {role} {count > 0 && <span className="opacity-70">({count})</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[380px_1fr]">
        <ScrollArea className="min-h-[420px] rounded-xl border border-border lg:h-full">
          <div className="flex flex-col gap-2 p-2">
            {filteredJobs.length === 0 && (
              <p className="p-4 text-center text-sm text-muted-foreground">
                Aucun poste ne correspond à ces filtres.
              </p>
            )}
            {filteredJobs.map((job) => {
              const isFocused = focused?.id === job.id;
              const isExpanded = expandedDetails.has(job.id);
              return (
                <div
                  key={job.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleFocus(job)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleFocus(job);
                    }
                  }}
                  className={cn(
                    "cursor-pointer rounded-lg outline-none",
                    isFocused && "ring-2 ring-brand"
                  )}
                >
                  <Card size="sm" className="flex-row gap-3 p-2">
                    <img
                      src={job.image}
                      alt={`${job.establishment} à ${job.city}`}
                      loading="lazy"
                      className="size-16 shrink-0 rounded-md object-cover"
                    />
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", packBadgeClass(job.pack))}>
                          {job.pack}
                        </span>
                        {job.contract && (
                          <Badge variant="outline" className="text-[10px]">
                            {job.contract}
                          </Badge>
                        )}
                        {job.housing && (
                          <Badge variant="outline" className="text-[10px]">
                            {job.housing}
                          </Badge>
                        )}
                      </div>
                      <p className="truncate text-sm font-medium text-foreground">
                        {job.establishment}
                      </p>
                      <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                        <MapPin className="size-3 shrink-0" />
                        {job.city} · {job.roleVariant}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="size-3 shrink-0" />
                        {job.sought ?? 0} recherché{(job.sought ?? 0) > 1 ? "s" : ""} · {job.sent ?? 0} envoyé
                        {(job.sent ?? 0) > 1 ? "s" : ""}
                      </p>

                      {isExpanded && job.details && (
                        <p className="whitespace-pre-line rounded-md bg-muted/60 p-2 text-xs text-muted-foreground">
                          {job.details}
                        </p>
                      )}

                      <div className="mt-1 flex items-center gap-2">
                        <Button
                          type="button"
                          size="xs"
                          variant="outline"
                          onClick={(event) => {
                            event.stopPropagation();
                            setDetailsJob(job);
                          }}
                        >
                          Plus d&apos;infos
                        </Button>
                        {job.details && (
                          <Button
                            type="button"
                            size="icon-xs"
                            variant="ghost"
                            aria-label={isExpanded ? "Masquer les détails" : "Afficher les détails"}
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleDetails(job.id);
                            }}
                          >
                            <ChevronDown
                              className={cn("size-3.5 transition-transform", isExpanded && "rotate-180")}
                            />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <div className="min-h-[420px] overflow-hidden rounded-xl border border-border">
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
                className="h-40 w-full rounded-lg object-cover"
              />
              <div className="flex flex-wrap items-center gap-1.5">
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-medium",
                    packBadgeClass(detailsJob.pack)
                  )}
                >
                  {detailsJob.pack}
                </span>
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
                  {(detailsJob.sent ?? 0) > 1 ? "s" : ""} envoyé{(detailsJob.sent ?? 0) > 1 ? "s" : ""}
                </span>
              </div>
              {detailsJob.details && (
                <p className="whitespace-pre-line text-sm text-muted-foreground">
                  {detailsJob.details}
                </p>
              )}
              {detailsJob.region && (
                <p className="text-xs text-muted-foreground">
                  {detailsJob.region}, {detailsJob.country}
                </p>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
