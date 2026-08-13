// Données de démonstration — carte des postes Diamond / Jungle.
// Statique : aucun fetch, tout est calculé à l'import.

export type Pack = "Diamond" | "Jungle";
export type ContractType = "CDI" | "CDD" | "CDI/CDD";
export type HousingStatus = "Logé" | "Non logé";

export interface Job {
  id: string;
  roleGroup: string;
  roleVariant: string;
  pack: Pack;
  establishment: string;
  city: string;
  region?: string;
  country?: string;
  lat: number;
  lng: number;
  image: string;
  note?: string;
  sought?: number;
  sent?: number;
  details?: string;
  contract?: ContractType;
  housing?: HousingStatus;
  /** Date d'entrée du poste (ISO `YYYY-MM-DD`) — alimente l'onglet « Nouveautés ». */
  createdAt?: string;
}

interface Place {
  id: string;
  establishment: string;
  pack: Pack;
  city: string;
  region: string;
  country: string;
  lat: number;
  lng: number;
  image: string;
}

interface EntryDef {
  id: string;
  placeId: string;
  roleGroup: string;
  roleVariant: string;
  details: string;
  note?: string;
  createdAt: string;
}

/** Un poste est marqué « Nouveau » s'il est entré dans les 14 derniers jours. */
export const NEW_BADGE_DAYS = 14;
/** L'onglet « Nouveautés » liste les postes entrés dans les 30 derniers jours. */
export const NEW_TAB_DAYS = 30;

/** Nombre de jours écoulés depuis `createdAt`, ou `null` si la date est absente/invalide. */
export function daysSince(createdAt: string | undefined, now: Date = new Date()): number | null {
  if (!createdAt) return null;
  const parsed = Date.parse(createdAt);
  if (Number.isNaN(parsed)) return null;
  return Math.floor((now.getTime() - parsed) / 86_400_000);
}

export const ROLE_GROUPS = [
  "Chef de partie",
  "Sous-chef",
  "Chef de rang",
  "Maître d'hôtel",
  "Réceptionniste",
  "Concierge",
  "Gouvernante",
  "Directeur de restaurant",
  "Barman",
  "Commis de cuisine",
  "Second de cuisine",
  "Commis de salle",
  "Plongeur",
] as const;

export const REGIONS = [
  "Île-de-France",
  "Auvergne-Rhône-Alpes",
  "Provence-Alpes-Côte d'Azur",
  "Nouvelle-Aquitaine",
  "Normandie",
  "Occitanie",
  "Hauts-de-France",
  "Grand Est",
] as const;

const PLACES: Place[] = [
  // --- Diamond ---
  {
    id: "cristal-palace-paris",
    establishment: "Hôtel Cristal Palace",
    pack: "Diamond",
    city: "Paris",
    region: "Île-de-France",
    country: "France",
    lat: 48.8566,
    lng: 2.3522,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "villa-azur-prestige",
    establishment: "Villa Azur Prestige",
    pack: "Diamond",
    city: "Saint-Tropez",
    region: "Provence-Alpes-Côte d'Azur",
    country: "France",
    lat: 43.2677,
    lng: 6.6407,
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "chateau-des-cimes",
    establishment: "Château des Cimes",
    pack: "Diamond",
    city: "Courchevel",
    region: "Auvergne-Rhône-Alpes",
    country: "France",
    lat: 45.4149,
    lng: 6.634,
    image: "https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "belvedere-etoile",
    establishment: "Le Belvédère Étoilé",
    pack: "Diamond",
    city: "Megève",
    region: "Auvergne-Rhône-Alpes",
    country: "France",
    lat: 45.8567,
    lng: 6.6178,
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "riviera-palace",
    establishment: "Riviera Palace",
    pack: "Diamond",
    city: "Cannes",
    region: "Provence-Alpes-Côte d'Azur",
    country: "France",
    lat: 43.5528,
    lng: 7.0174,
    image: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "phare-dore",
    establishment: "Le Phare Doré",
    pack: "Diamond",
    city: "Biarritz",
    region: "Nouvelle-Aquitaine",
    country: "France",
    lat: 43.4832,
    lng: -1.5586,
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "villa-imperiale",
    establishment: "Villa Impériale",
    pack: "Diamond",
    city: "Deauville",
    region: "Normandie",
    country: "France",
    lat: 49.3579,
    lng: 0.0736,
    image: "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "domaine-des-cedres",
    establishment: "Domaine des Cèdres",
    pack: "Diamond",
    city: "Aix-en-Provence",
    region: "Provence-Alpes-Côte d'Azur",
    country: "France",
    lat: 43.5297,
    lng: 5.4474,
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "grand-hotel-des-alpes",
    establishment: "Grand Hôtel des Alpes",
    pack: "Diamond",
    city: "Chamonix",
    region: "Auvergne-Rhône-Alpes",
    country: "France",
    lat: 45.9237,
    lng: 6.8694,
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800&auto=format&fit=crop",
  },
  // --- Jungle ---
  {
    id: "bistrot-la-ruche",
    establishment: "Bistrot La Ruche",
    pack: "Jungle",
    city: "Lyon",
    region: "Auvergne-Rhône-Alpes",
    country: "France",
    lat: 45.764,
    lng: 4.8357,
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "brasserie-du-port",
    establishment: "Brasserie du Port",
    pack: "Jungle",
    city: "La Rochelle",
    region: "Nouvelle-Aquitaine",
    country: "France",
    lat: 46.1603,
    lng: -1.1511,
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "le-petit-marche",
    establishment: "Le Petit Marché",
    pack: "Jungle",
    city: "Bordeaux",
    region: "Nouvelle-Aquitaine",
    country: "France",
    lat: 44.8378,
    lng: -0.5792,
    image: "https://images.unsplash.com/photo-1508921912186-1d1a45ebb3c1?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "bistrot-des-lices",
    establishment: "Bistrot des Lices",
    pack: "Jungle",
    city: "Annecy",
    region: "Auvergne-Rhône-Alpes",
    country: "France",
    lat: 45.8992,
    lng: 6.1294,
    image: "https://images.unsplash.com/photo-1517705008128-361805f42e86?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "table-conviviale",
    establishment: "La Table Conviviale",
    pack: "Jungle",
    city: "Marseille",
    region: "Provence-Alpes-Côte d'Azur",
    country: "France",
    lat: 43.2965,
    lng: 5.3698,
    image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "auberge-vieux-lille",
    establishment: "Auberge du Vieux Lille",
    pack: "Jungle",
    city: "Lille",
    region: "Hauts-de-France",
    country: "France",
    lat: 50.6292,
    lng: 3.0573,
    image: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "comptoir-alsacien",
    establishment: "Le Comptoir Alsacien",
    pack: "Jungle",
    city: "Strasbourg",
    region: "Grand Est",
    country: "France",
    lat: 48.5734,
    lng: 7.7521,
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "bistrot-capitole",
    establishment: "Bistrot Capitole",
    pack: "Jungle",
    city: "Toulouse",
    region: "Occitanie",
    country: "France",
    lat: 43.6047,
    lng: 1.4442,
    image: "https://images.unsplash.com/photo-1493857671505-72967e2e2760?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "cabane-du-lac",
    establishment: "La Cabane du Lac",
    pack: "Jungle",
    city: "Val d'Isère",
    region: "Auvergne-Rhône-Alpes",
    country: "France",
    lat: 45.4489,
    lng: 6.98,
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=800&auto=format&fit=crop",
  },
];

const ENTRIES: EntryDef[] = [
  {
    id: "job-01",
    createdAt: "2026-08-08",
    placeId: "cristal-palace-paris",
    roleGroup: "Chef de partie",
    roleVariant: "Chef de partie CDI",
    details: "Contrat : CDI\nLogement : Oui\nPoste au sein d'une brigade étoilée, service midi et soir.",
  },
  {
    id: "job-02",
    createdAt: "2026-08-01",
    placeId: "cristal-palace-paris",
    roleGroup: "Réceptionniste",
    roleVariant: "Réceptionniste tournant",
    details: "Contrat : CDI\nLogement : Non\nAccueil clientèle internationale, anglais courant requis.",
  },
  {
    id: "job-03",
    createdAt: "2026-07-27",
    placeId: "villa-azur-prestige",
    roleGroup: "Sous-chef",
    roleVariant: "Sous-chef saison",
    details: "Contrat : CDD\nLogement : Oui\nSaison estivale, encadrement d'une équipe de 8 cuisiniers.",
  },
  {
    id: "job-04",
    createdAt: "2026-07-22",
    placeId: "chateau-des-cimes",
    roleGroup: "Maître d'hôtel",
    roleVariant: "Maître d'hôtel restaurant gastronomique",
    details: "Contrat : CDI\nLogement : Oui\nRestaurant une étoile, service de gala et clientèle exigeante.",
  },
  {
    id: "job-05",
    createdAt: "2026-07-06",
    placeId: "belvedere-etoile",
    roleGroup: "Chef de partie",
    roleVariant: "Chef de partie pâtisserie",
    details: "Contrat : CDD\nLogement : Oui\nPoste saison hiver, pâtisserie fine et dressage.",
  },
  {
    id: "job-06",
    createdAt: "2026-06-28",
    placeId: "riviera-palace",
    roleGroup: "Concierge",
    roleVariant: "Concierge Clefs d'Or",
    details: "Contrat : CDI\nLogement : Non\nConciergerie palace, réseau international.",
  },
  {
    id: "job-07",
    createdAt: "2026-06-10",
    placeId: "phare-dore",
    roleGroup: "Gouvernante",
    roleVariant: "Gouvernante générale",
    details: "Contrat : CDI\nLogement : Oui\nSupervision de l'housekeeping sur 90 chambres.",
  },
  {
    id: "job-08",
    createdAt: "2026-05-25",
    placeId: "villa-imperiale",
    roleGroup: "Directeur de restaurant",
    roleVariant: "Directeur de restaurant gastronomique",
    details: "Contrat : CDI\nLogement : Non\nPilotage complet du restaurant, carte des vins et équipe de salle.",
  },
  {
    id: "job-09",
    createdAt: "2026-05-09",
    placeId: "domaine-des-cedres",
    roleGroup: "Chef de rang",
    roleVariant: "Chef de rang CDD",
    details: "Contrat : CDD\nLogement : Oui\nService en terrasse et salle, clientèle haut de gamme.",
  },
  {
    id: "job-10",
    createdAt: "2026-04-24",
    placeId: "grand-hotel-des-alpes",
    roleGroup: "Barman",
    roleVariant: "Barman de palace",
    details: "Contrat : CDI\nLogement : Non\nBar à cocktails signature, créations maison.",
  },
  {
    id: "job-11",
    createdAt: "2026-08-12",
    placeId: "bistrot-la-ruche",
    roleGroup: "Chef de rang",
    roleVariant: "Chef de rang bistrot",
    details: "Contrat : CDI\nLogement : Non\nAmbiance conviviale, équipe de 4 en salle.",
  },
  {
    id: "job-12",
    createdAt: "2026-08-04",
    placeId: "brasserie-du-port",
    roleGroup: "Commis de cuisine",
    roleVariant: "Commis de cuisine CDD",
    details: "Contrat : CDD\nLogement : Oui\nCuisine de produits de la mer, saison estivale.",
  },
  {
    id: "job-13",
    createdAt: "2026-07-17",
    placeId: "le-petit-marche",
    roleGroup: "Chef de rang",
    roleVariant: "Serveur / serveuse",
    details: "Contrat : CDI\nLogement : Non\nBistrot de quartier, ambiance familiale.",
  },
  {
    id: "job-14",
    createdAt: "2026-06-19",
    placeId: "bistrot-des-lices",
    roleGroup: "Chef de partie",
    roleVariant: "Chef de partie CDD",
    details: "Contrat : CDD\nLogement : Oui\nCuisine de saison, produits locaux.",
  },
  {
    id: "job-15",
    createdAt: "2026-06-02",
    placeId: "table-conviviale",
    roleGroup: "Second de cuisine",
    roleVariant: "Second de cuisine",
    details: "Contrat : CDI\nLogement : Non\nCuisine méditerranéenne, équipe de 6.",
  },
  {
    id: "job-16",
    createdAt: "2026-05-18",
    placeId: "auberge-vieux-lille",
    roleGroup: "Chef de rang",
    roleVariant: "Chef de rang auberge",
    details: "Contrat : CDI\nLogement : Oui\nAuberge traditionnelle, cadre chaleureux.",
  },
  {
    id: "job-17",
    createdAt: "2026-05-02",
    placeId: "comptoir-alsacien",
    roleGroup: "Barman",
    roleVariant: "Barman comptoir",
    details: "Contrat : CDD\nLogement : Non\nBar à vins et bières locales, ambiance décontractée.",
  },
  {
    id: "job-18",
    createdAt: "2026-04-16",
    placeId: "bistrot-capitole",
    roleGroup: "Commis de salle",
    roleVariant: "Commis de salle",
    details: "Contrat : CDI\nLogement : Non\nBistrot animé en centre-ville, forte affluence le midi.",
  },
  {
    id: "job-19",
    createdAt: "2026-04-09",
    placeId: "cabane-du-lac",
    roleGroup: "Chef de partie",
    roleVariant: "Chef de partie montagne",
    details: "Contrat : CDD\nLogement : Oui\nRestaurant d'altitude, saison hiver.",
  },
  {
    id: "job-20",
    createdAt: "2026-04-02",
    placeId: "bistrot-capitole",
    roleGroup: "Plongeur",
    roleVariant: "Plongeur / aide de cuisine",
    details: "Contrat : CDI\nLogement : Non\nSoutien cuisine, horaires en coupure.",
  },
];

const METRICS: Record<string, { sought: number; sent: number }> = {
  "Hôtel Cristal Palace|Chef de partie CDI": { sought: 2, sent: 5 },
  "Hôtel Cristal Palace|Réceptionniste tournant": { sought: 1, sent: 3 },
  "Villa Azur Prestige|Sous-chef saison": { sought: 1, sent: 4 },
  "Château des Cimes|Maître d'hôtel restaurant gastronomique": { sought: 1, sent: 2 },
  "Le Belvédère Étoilé|Chef de partie pâtisserie": { sought: 1, sent: 3 },
  "Riviera Palace|Concierge Clefs d'Or": { sought: 1, sent: 1 },
  "Le Phare Doré|Gouvernante générale": { sought: 1, sent: 2 },
  "Villa Impériale|Directeur de restaurant gastronomique": { sought: 1, sent: 1 },
  "Domaine des Cèdres|Chef de rang CDD": { sought: 3, sent: 6 },
  "Grand Hôtel des Alpes|Barman de palace": { sought: 1, sent: 2 },
  "Bistrot La Ruche|Chef de rang bistrot": { sought: 2, sent: 4 },
  "Brasserie du Port|Commis de cuisine CDD": { sought: 2, sent: 5 },
  "Le Petit Marché|Serveur / serveuse": { sought: 2, sent: 3 },
  "Bistrot des Lices|Chef de partie CDD": { sought: 1, sent: 2 },
  "La Table Conviviale|Second de cuisine": { sought: 1, sent: 3 },
  "Auberge du Vieux Lille|Chef de rang auberge": { sought: 1, sent: 1 },
  "Le Comptoir Alsacien|Barman comptoir": { sought: 1, sent: 2 },
  "Bistrot Capitole|Commis de salle": { sought: 2, sent: 4 },
  "La Cabane du Lac|Chef de partie montagne": { sought: 1, sent: 3 },
  "Bistrot Capitole|Plongeur / aide de cuisine": { sought: 1, sent: 1 },
};

export function parseContract(details?: string): ContractType | undefined {
  if (!details) return undefined;
  const match = /Contrat\s*:\s*([^\n]+)/i.exec(details);
  if (!match) return undefined;
  const value = match[1].trim().toUpperCase();
  if (value.includes("CDI") && value.includes("CDD")) return "CDI/CDD";
  if (value.includes("CDI")) return "CDI";
  if (value.includes("CDD")) return "CDD";
  return undefined;
}

export function parseHousing(details?: string): HousingStatus | undefined {
  if (!details) return undefined;
  const match = /Logement\s*:\s*([^\n]+)/i.exec(details);
  if (!match) return undefined;
  const value = match[1].trim().toLowerCase();
  if (value.startsWith("oui")) return "Logé";
  if (value.startsWith("non")) return "Non logé";
  return undefined;
}

const placesById = new Map(PLACES.map((place) => [place.id, place]));

export const JOBS: Job[] = ENTRIES.map((entry) => {
  const place = placesById.get(entry.placeId);
  if (!place) {
    throw new Error(`Établissement introuvable pour l'entrée ${entry.id}`);
  }
  const metricsKey = `${place.establishment}|${entry.roleVariant}`;
  const metrics = METRICS[metricsKey];

  return {
    id: entry.id,
    roleGroup: entry.roleGroup,
    roleVariant: entry.roleVariant,
    pack: place.pack,
    establishment: place.establishment,
    city: place.city,
    region: place.region,
    country: place.country,
    lat: place.lat,
    lng: place.lng,
    image: place.image,
    note: entry.note,
    sought: metrics?.sought,
    sent: metrics?.sent,
    details: entry.details,
    contract: parseContract(entry.details),
    housing: parseHousing(entry.details),
    createdAt: entry.createdAt,
  };
}).sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
