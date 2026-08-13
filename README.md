# Carte de recrutement — Diamond & Jungle

Carte interactive des postes à pourvoir en hôtellerie-restauration, alimentée par
le tableau de suivi Google Sheet.

- **Diamond** — établissements haut de gamme (palaces, hôtels 5\*, tables étoilées).
- **Jungle** — hôtellerie et restauration plus décontractées.

Le pack **Diamond Private** est volontairement exclu : ce sont des clients
particuliers, qui n'ont pas leur place sur un site public.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui ·
Leaflet + react-leaflet (OpenStreetMap, chargé côté client uniquement).

## Démarrage

```bash
npm install
npm run dev          # http://localhost:3000
```

## Où vivent les données

| Fichier | Rôle |
|---|---|
| `src/data/rows.json` | Lignes du tableau. **Généré** par la synchronisation — ne pas éditer à la main. |
| `src/data/establishments.ts` | Position de chaque enseigne. **Édité à la main.** |
| `src/data/jobs.ts` | Assemble les deux et en déduit régions, types et familles de métier. |

### Pourquoi une table de positions séparée

Le tableau de suivi ne contient **aucune donnée de lieu** : ni ville, ni adresse,
ni coordonnées. Les positions sont donc tenues dans `establishments.ts`, où
chaque enseigne est rattachée à une commune.

Une enseigne absente de cette table **n'est pas placée sur la carte** : elle
reste listée avec la mention « Localisation à confirmer ». C'est délibéré —
mieux vaut un poste visiblement non localisé qu'un point posé au hasard.

Pour ajouter une enseigne, une entrée suffit :

```ts
"nom normalise": {
  city: "Annecy", region: "Auvergne-Rhône-Alpes", country: "France",
  lat: 45.8992, lng: 6.1294, precision: "etablissement",
},
```

La clé est le nom de société passé à `normalizeKey` (minuscules, sans accents ni
ponctuation), ce qui absorbe les variantes d'écriture du tableau.

## Synchronisation avec le Google Sheet

### 1. Publier les onglets

Dans le tableau : **Fichier → Partager → Publier sur le web**. Un CSV ne peut
contenir qu'un seul onglet : il faut donc **une publication par onglet**.

| Portée (menu de gauche) | Format (menu de droite) |
|---|---|
| `DIAMOND INTERNATIONAL + PRIVATE` | Valeurs séparées par des virgules (.csv) |
| `JUNGLE` | Valeurs séparées par des virgules (.csv) |

Ne pas choisir « Document entier » : le format CSV ne sait pas représenter
plusieurs onglets. L'onglet `RUBY RESEAU` n'est pas repris.

Chaque publication fournit une URL en `.../pub?gid=…&single=true&output=csv`.

> L'onglet Diamond contient aussi la section **DIAMOND PRIVATE**. Ce n'est pas
> un problème pour la carte : la synchronisation repère les titres de section et
> écarte systématiquement les lignes Private. En revanche, publier un onglet le
> rend lisible par quiconque a l'URL — y compris ses colonnes financières.

### 2. Lancer la synchronisation

Les URL se passent dans `SHEET_CSV_URL`, séparées par des virgules :

```bash
SHEET_CSV_URL="<url-diamond>,<url-jungle>" \
  node scripts/sync-sheet.mjs --dry-run   # aperçu, n'écrit rien
```

Sans `--dry-run`, le script réécrit `src/data/rows.json`.

Ce qu'il fait :

- ne retient que les sections **Diamond International** et **Jungle** ;
- ignore **Diamond Private**, les lignes `Total` et les en-têtes fusionnés ;
- n'extrait que les colonnes non financières (société, type, poste, nombre,
  candidats envoyés, notes) — Tarif, Montant HT, Total HT et OD HT ne sont
  jamais lus, même lorsqu'ils sont présents dans le flux ;
- horodate (`firstSeenAt`) les lignes absentes de la synchronisation précédente
  — c'est ce qui alimente l'onglet **Nouveautés**.

À la toute première synchronisation, aucune ligne n'est marquée « nouvelle » :
sans état antérieur, tout le tableau le serait, ce qui ne veut rien dire.

Si un onglet publié ne contient pas son titre de section, aucune ligne n'en
sortira. Suffixer alors son URL par `#pack=Jungle` (ou `#pack=Diamond`) pour
imposer le pack. Les sections repérées dans le fichier restent prioritaires :
un `DIAMOND PRIVATE` reste écarté même en pack forcé.

### 3. Automatiser

Deux niveaux, complémentaires.

**Le workflow** `.github/workflows/sync-sheet.yml` rejoue l'opération toutes les
15 minutes, et se déclenche aussi à la demande. Une seule chose à configurer :
le secret **`SHEET_CSV_URL`** dans *Settings → Secrets and variables → Actions*,
contenant les deux URL séparées par une virgule.

> Le secret, pas le code : ce dépôt est public, une URL écrite dans un fichier
> versionné serait lisible par tout le monde.

Le workflow ne produit un commit que si le tableau a changé ; ce commit déclenche
le redéploiement Vercel. La carte suit donc le tableau sans intervention.

**La mise à jour immédiate** (facultatif) : le script Apps Script de
`scripts/apps-script/` prévient GitHub dès qu'une personne modifie le tableau,
ce qui ramène le délai de quinze minutes à quelques secondes. Voir
`scripts/apps-script/README.gs.md`.

Sans ce script, tout fonctionne déjà — simplement avec un quart d'heure de
décalage au pire.

## Déploiement

Projet Vercel autonome, framework détecté automatiquement, aucune variable
d'environnement requise à l'exécution (les données sont figées dans le dépôt au
moment du build).
