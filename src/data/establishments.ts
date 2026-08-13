// Table de géolocalisation des établissements.
//
// Le tableau Google Sheet ne porte aucune donnée de lieu : la position vient
// donc d'ici, renseignée à partir de l'identification de chaque enseigne.
// `precision` dit ce qui est réellement connu :
//   - "etablissement" : l'établissement précis est identifié, coordonnées sur site.
//   - "ville"         : l'enseigne est rattachée à une ville sûre, point au centre-ville.
// Une enseigne absente de cette table n'est PAS placée sur la carte : elle
// reste listée avec la mention « Localisation à confirmer », plutôt que d'être
// posée à une position inventée.
//
// La clé est le nom de société normalisé (voir `normalizeKey`) : elle absorbe
// les variantes de casse, d'accents et d'espaces du tableau source.

export interface EstablishmentLocation {
  city: string;
  region: string;
  country: string;
  lat: number;
  lng: number;
  precision: "etablissement" | "ville";
}

/** Normalise un nom de société pour servir de clé (casse, accents, espaces). */
export function normalizeKey(name: string): string {
  return name
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const RAW: Record<string, EstablishmentLocation> = {
  // ---- Paris / Île-de-France ----
  "bristol": { city: "Paris", region: "Île-de-France", country: "France", lat: 48.872, lng: 2.316, precision: "etablissement" },
  "plaza athenee": { city: "Paris", region: "Île-de-France", country: "France", lat: 48.8661, lng: 2.3044, precision: "etablissement" },
  "jules verne": { city: "Paris", region: "Île-de-France", country: "France", lat: 48.8578, lng: 2.2945, precision: "etablissement" },
  "cordon bleu": { city: "Paris", region: "Île-de-France", country: "France", lat: 48.8419, lng: 2.2864, precision: "etablissement" },
  "abbaye des vaux de cernay": { city: "Cernay-la-Ville", region: "Île-de-France", country: "France", lat: 48.6567, lng: 1.9394, precision: "etablissement" },
  "abbaye": { city: "Cernay-la-Ville", region: "Île-de-France", country: "France", lat: 48.6567, lng: 1.9394, precision: "etablissement" },

  // ---- Provence-Alpes-Côte d'Azur ----
  "villa gallici": { city: "Aix-en-Provence", region: "Provence-Alpes-Côte d'Azur", country: "France", lat: 43.5333, lng: 5.4553, precision: "etablissement" },
  "chateau de fonscolombe": { city: "Le Puy-Sainte-Réparade", region: "Provence-Alpes-Côte d'Azur", country: "France", lat: 43.6708, lng: 5.4589, precision: "etablissement" },
  "couvent des minimes": { city: "Mane", region: "Provence-Alpes-Côte d'Azur", country: "France", lat: 43.9375, lng: 5.7625, precision: "etablissement" },
  "couvent de minimes": { city: "Mane", region: "Provence-Alpes-Côte d'Azur", country: "France", lat: 43.9375, lng: 5.7625, precision: "etablissement" },
  "la chassagnette": { city: "Arles", region: "Provence-Alpes-Côte d'Azur", country: "France", lat: 43.6167, lng: 4.6833, precision: "etablissement" },
  "nice passedat": { city: "Marseille", region: "Provence-Alpes-Côte d'Azur", country: "France", lat: 43.2833, lng: 5.35, precision: "etablissement" },
  "mouratoglou": { city: "Biot", region: "Provence-Alpes-Côte d'Azur", country: "France", lat: 43.6156, lng: 7.0728, precision: "etablissement" },
  "groupe mdcv ultimate provence": { city: "La Garde-Freinet", region: "Provence-Alpes-Côte d'Azur", country: "France", lat: 43.3167, lng: 6.4667, precision: "etablissement" },
  "maison de bacon": { city: "Cap d'Antibes", region: "Provence-Alpes-Côte d'Azur", country: "France", lat: 43.55, lng: 7.1333, precision: "etablissement" },
  "bonne etape": { city: "Château-Arnoux-Saint-Auban", region: "Provence-Alpes-Côte d'Azur", country: "France", lat: 44.0611, lng: 6.0033, precision: "etablissement" },
  "bastide de gordes": { city: "Gordes", region: "Provence-Alpes-Côte d'Azur", country: "France", lat: 43.9114, lng: 5.2, precision: "etablissement" },
  "mirande": { city: "Avignon", region: "Provence-Alpes-Côte d'Azur", country: "France", lat: 43.9489, lng: 4.8078, precision: "etablissement" },
  "capelongue": { city: "Bonnieux", region: "Provence-Alpes-Côte d'Azur", country: "France", lat: 43.8236, lng: 5.3069, precision: "etablissement" },
  "mas de pierre": { city: "Saint-Paul-de-Vence", region: "Provence-Alpes-Côte d'Azur", country: "France", lat: 43.6958, lng: 7.1222, precision: "etablissement" },
  "vieux castillon": { city: "Castillon-du-Gard", region: "Occitanie", country: "France", lat: 43.95, lng: 4.55, precision: "etablissement" },

  // ---- Alpes / Auvergne-Rhône-Alpes ----
  "fitz roy": { city: "Val Thorens", region: "Auvergne-Rhône-Alpes", country: "France", lat: 45.2978, lng: 6.5806, precision: "etablissement" },
  "strato": { city: "Courchevel", region: "Auvergne-Rhône-Alpes", country: "France", lat: 45.4139, lng: 6.6317, precision: "etablissement" },
  "four seasons megeve": { city: "Megève", region: "Auvergne-Rhône-Alpes", country: "France", lat: 45.8639, lng: 6.6203, precision: "etablissement" },
  "folie douce": { city: "Chamonix", region: "Auvergne-Rhône-Alpes", country: "France", lat: 45.9237, lng: 6.8694, precision: "etablissement" },
  "auberge du pere bise": { city: "Talloires", region: "Auvergne-Rhône-Alpes", country: "France", lat: 45.8397, lng: 6.2178, precision: "etablissement" },
  "diable au coeur": { city: "Les Gets", region: "Auvergne-Rhône-Alpes", country: "France", lat: 46.1583, lng: 6.6667, precision: "etablissement" },
  "jiva hill": { city: "Crozet", region: "Auvergne-Rhône-Alpes", country: "France", lat: 46.2833, lng: 6.0167, precision: "etablissement" },
  // Cimalpes : agence multi-stations. Position par défaut à Courchevel ; les
  // lignes dont l'intitulé nomme une station sont repositionnées à l'import.
  "cimalpes": { city: "Courchevel", region: "Auvergne-Rhône-Alpes", country: "France", lat: 45.4149, lng: 6.634, precision: "ville" },

  // ---- Grand Est / Bourgogne ----
  "royal champagne": { city: "Champillon", region: "Grand Est", country: "France", lat: 49.0906, lng: 3.9639, precision: "etablissement" },
  "la cueillette": { city: "Santenay", region: "Bourgogne-Franche-Comté", country: "France", lat: 46.9083, lng: 4.6944, precision: "etablissement" },

  // ---- Ouest / Sud-Ouest ----
  "roi arthur": { city: "Ploërmel", region: "Bretagne", country: "France", lat: 47.9333, lng: -2.4, precision: "etablissement" },
  "domaine roi arthur": { city: "Ploërmel", region: "Bretagne", country: "France", lat: 47.9333, lng: -2.4, precision: "etablissement" },
  "castel clara": { city: "Belle-Île-en-Mer", region: "Bretagne", country: "France", lat: 47.3167, lng: -3.1667, precision: "etablissement" },
  "logis de la cadene": { city: "Saint-Émilion", region: "Nouvelle-Aquitaine", country: "France", lat: 44.8936, lng: -0.1556, precision: "etablissement" },
  "la borde en sologne": { city: "Vernou-en-Sologne", region: "Centre-Val de Loire", country: "France", lat: 47.5, lng: 1.75, precision: "etablissement" },
  "lionel giraud lg art": { city: "Narbonne", region: "Occitanie", country: "France", lat: 43.1833, lng: 3.0, precision: "etablissement" },

  // ---- Corse ----
  "santa giulia": { city: "Porto-Vecchio", region: "Corse", country: "France", lat: 41.5333, lng: 9.2833, precision: "etablissement" },

  // ---- Enseignes identifiées après coup (voir README § Localisation) ----
  // Hôtel SAX Paris, 55 avenue de Saxe. Le tableau le note 4*, l'établissement
  // est classé 5* — les étoiles du tableau sont irrégulières.
  "sax": { city: "Paris", region: "Île-de-France", country: "France", lat: 48.8483, lng: 2.3092, precision: "etablissement" },
  // M Social Hotel Paris (Millennium), 12 boulevard Haussmann.
  "m social": { city: "Paris", region: "Île-de-France", country: "France", lat: 48.8721, lng: 2.3379, precision: "etablissement" },
  // ANTO, faubourg Sainte-Claire, vieille ville d'Annecy — chef Anthony Bisquerra.
  "anto": { city: "Annecy", region: "Auvergne-Rhône-Alpes", country: "France", lat: 45.8983, lng: 6.1264, precision: "etablissement" },
  // Le Grillon, 111 route la Plagne — restaurant savoyard de Morzine.
  "le grillon": { city: "Morzine", region: "Auvergne-Rhône-Alpes", country: "France", lat: 46.1795, lng: 6.7089, precision: "etablissement" },
  // Grand Hôtel du Lion d'Or, Relais & Châteaux étoilé de Romorantin.
  "le lion d or": { city: "Romorantin-Lanthenay", region: "Centre-Val de Loire", country: "France", lat: 47.3561, lng: 1.7433, precision: "etablissement" },
  // Maison Le Chevreuil, place de la République — hôtel-restaurant de Meursault.
  "maison le chevreuil": { city: "Meursault", region: "Bourgogne-Franche-Comté", country: "France", lat: 46.9789, lng: 4.7686, precision: "etablissement" },
  // La Cocotte d'Isidore, restaurant du Best Western Plus Isidore (agglomération de Rennes).
  "cocotte d isidore": { city: "Saint-Jacques-de-la-Lande", region: "Bretagne", country: "France", lat: 48.0736, lng: -1.7203, precision: "etablissement" },
  // Beyond Places : groupe de gestion hôtelière. Le poste étant un rôle de
  // siège, la position est celle du siège social (Domaine de Massane).
  "beyond places": { city: "Baillargues", region: "Occitanie", country: "France", lat: 43.6597, lng: 4.0083, precision: "etablissement" },

  // ---- Hors France métropolitaine ----
  // Romi, restaurant du Tropical Hotel à Saint-Jean — sa signature est le
  // show-cooking, ce qui explique le libellé du tableau. Identification
  // probable, à confirmer : position posée au niveau du quartier.
  "romi beach show": { city: "Saint-Barthélemy", region: "Antilles", country: "Saint-Barthélemy", lat: 17.8992, lng: -62.8419, precision: "ville" },
  "sbm": { city: "Monaco", region: "Monaco", country: "Monaco", lat: 43.7396, lng: 7.4276, precision: "etablissement" },
  "eden roc saint barth": { city: "Saint-Barthélemy", region: "Antilles", country: "Saint-Barthélemy", lat: 17.8983, lng: -62.8319, precision: "etablissement" },
  "chateau royal noumea": { city: "Nouméa", region: "Nouvelle-Calédonie", country: "Nouvelle-Calédonie", lat: -22.2758, lng: 166.4572, precision: "etablissement" },
  "palais ronsard": { city: "Marrakech", region: "Marrakech-Safi", country: "Maroc", lat: 31.6295, lng: -7.9811, precision: "etablissement" },
  "pont de brent": { city: "Montreux", region: "Vaud", country: "Suisse", lat: 46.4667, lng: 6.9, precision: "etablissement" },
};

/** Stations reconnues dans un intitulé de poste, pour repositionner les
 *  enseignes multi-sites (Cimalpes) sur la bonne commune. */
const RESORT_OVERRIDES: Record<string, { city: string; lat: number; lng: number }> = {
  courchevel: { city: "Courchevel", lat: 45.4149, lng: 6.634 },
  "alpes d huez": { city: "Alpe d'Huez", lat: 45.0922, lng: 6.0703 },
  "alpe d huez": { city: "Alpe d'Huez", lat: 45.0922, lng: 6.0703 },
};

export const ESTABLISHMENT_LOCATIONS: Record<string, EstablishmentLocation> = RAW;

/**
 * Localise une société, en tenant compte d'une éventuelle station nommée dans
 * l'intitulé du poste. Renvoie `undefined` si l'enseigne n'est pas connue —
 * l'appelant doit alors la traiter comme « à confirmer », pas la placer.
 */
export function locate(
  company: string,
  roleLabel = ""
): EstablishmentLocation | undefined {
  const base = ESTABLISHMENT_LOCATIONS[normalizeKey(company)];
  if (!base) return undefined;

  const roleKey = normalizeKey(roleLabel);
  for (const [needle, override] of Object.entries(RESORT_OVERRIDES)) {
    if (roleKey.includes(needle)) {
      return { ...base, ...override, precision: "ville" };
    }
  }
  return base;
}
