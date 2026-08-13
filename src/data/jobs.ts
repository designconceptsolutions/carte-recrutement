// Postes issus du tableau de suivi Google Sheet (onglets Diamond
// International et Jungle). Le pack « Diamond Private » est volontairement
// exclu : ce sont des particuliers, qui n'ont pas leur place sur un site
// public. Les colonnes financières (Tarif, Montant HT, Total HT, OD HT) ne
// sont pas reprises non plus.
//
// Ce fichier est régénéré par `scripts/sync-sheet.mjs` ; les positions
// viennent de `establishments.ts`.

import { locate, normalizeKey } from "./establishments";
import sheetData from "./rows.json";

export type Pack = "Diamond" | "Jungle";

export interface Job {
  id: string;
  /** Famille de métier déduite de l'intitulé (voir `classifyRole`). */
  roleGroup: string;
  /** Intitulé exact tel qu'il figure dans le tableau. */
  roleVariant: string;
  pack: Pack;
  establishment: string;
  /** Catégorie d'établissement : « Hotel 5* », « Restaurant 2* », « Residence »… */
  type?: string;
  city?: string;
  region?: string;
  country?: string;
  /** Absents si l'enseigne n'est pas localisée — le poste n'est alors pas placé. */
  lat?: number;
  lng?: number;
  /** Fiabilité de la position ; absente si l'enseigne n'est pas localisée. */
  precision?: "etablissement" | "ville";
  /** Postes recherchés (colonne « Nombre »). */
  sought: number;
  /** Candidats déjà envoyés (colonne « Candidats envoyés »). */
  sent: number;
  note?: string;
  /** Horodatage de première apparition, posé par la synchronisation. */
  firstSeenAt?: string;
}

/** Ligne du tableau, telle que stockée dans `rows.json`. */
interface Row {
  pack: Pack;
  establishment: string;
  type: string;
  roleVariant: string;
  sought: number;
  sent: number;
  note?: string;
  /** Posé par la synchronisation lorsque la ligne apparaît pour la première fois. */
  firstSeenAt?: string;
}

interface SheetData {
  /** Horodatage de la dernière synchronisation réussie (null tant qu'aucune). */
  syncedAt: string | null;
  rows: Row[];
}

const DATA = sheetData as SheetData;

/** Familles de métier, dans l'ordre d'affichage du menu déroulant. */
export const ROLE_GROUPS = [
  "Direction",
  "Cuisine",
  "Pâtisserie",
  "Salle & bar",
  "Sommellerie",
  "Hébergement",
  "Technique",
  "Autre",
] as const;

/** Range un intitulé libre dans une famille de métier. */
export function classifyRole(label: string): string {
  const k = normalizeKey(label);
  if (/(sommelier|sommellerie)/.test(k)) return "Sommellerie";
  if (/(patissier|patisserie)/.test(k)) return "Pâtisserie";
  if (/(directeur|direction|general manager|adjoint|gerant)/.test(k)) return "Direction";
  if (/(chef de rang|maitre d hotel|commis de salle|barman|bar|restaurant service)/.test(k)) {
    return "Salle & bar";
  }
  if (/(chef|cuisine|pizzaiolo|sushi|commis de cuisine|banquet)/.test(k)) return "Cuisine";
  if (/(gouvernante|gouvernant|hebergement|reception|femme de chambre|lingere|spa|housekeeping)/.test(k)) {
    return "Hébergement";
  }
  if (/(technicien|technique|maintenance|logistique)/.test(k)) return "Technique";
  if (/(responsable|charge|relation client|marketing|commercial|communication)/.test(k)) {
    return "Direction";
  }
  return "Autre";
}

function slug(value: string) {
  return normalizeKey(value).replace(/\s+/g, "-");
}

/** Le tableau source mélange « Hotel 5* » et « Hôtel 5* » : sans unification,
 *  la même catégorie apparaîtrait deux fois dans le filtre. */
function normalizeType(type: string): string | undefined {
  const trimmed = type.trim();
  if (!trimmed) return undefined;
  return trimmed
    .replace(/^h[oô]tel/i, "Hôtel")
    .replace(/^restaurant/i, "Restaurant")
    .replace(/^residence$/i, "Résidence")
    .replace(/^ecole$/i, "École");
}

/** Date de la dernière synchronisation avec le tableau (null si aucune). */
export const SYNCED_AT: string | null = DATA.syncedAt;

export const JOBS: Job[] = DATA.rows.map((row, index) => {
  const location = locate(row.establishment, row.roleVariant);
  return {
    id: `${slug(row.pack)}-${index + 1}-${slug(row.establishment)}`,
    roleGroup: classifyRole(row.roleVariant),
    roleVariant: row.roleVariant,
    pack: row.pack,
    establishment: row.establishment,
    type: normalizeType(row.type),
    city: location?.city,
    region: location?.region,
    country: location?.country,
    lat: location?.lat,
    lng: location?.lng,
    precision: location?.precision,
    sought: row.sought,
    sent: row.sent,
    note: row.note,
    firstSeenAt: row.firstSeenAt,
  };
});

/** Régions représentées dans les données, triées. */
export const REGIONS: string[] = Array.from(
  new Set(JOBS.map((job) => job.region).filter((r): r is string => Boolean(r)))
).sort((a, b) => a.localeCompare(b, "fr"));

/** Catégories d'établissement représentées, triées. */
export const TYPES: string[] = Array.from(
  new Set(JOBS.map((job) => job.type).filter((t): t is string => Boolean(t)))
).sort((a, b) => a.localeCompare(b, "fr"));

/** Enseignes non localisées — listées mais jamais placées sur la carte. */
export const UNLOCATED: string[] = Array.from(
  new Set(JOBS.filter((job) => job.lat === undefined).map((job) => job.establishment))
).sort((a, b) => a.localeCompare(b, "fr"));
