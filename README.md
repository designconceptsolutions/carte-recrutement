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

### 1. Publier l'onglet

Dans le tableau : **Fichier → Partager → Publier sur le web**, sélectionner
**l'onglet** voulu (pas « Document entier ») et le format **CSV**. Google fournit
une URL en `.../pub?gid=…&single=true&output=csv`.

> **Attention** — cette URL est lisible sans authentification. Ne publiez qu'un
> onglet dépourvu de données financières. La synchronisation ignore de toute
> façon les colonnes Tarif, Montant HT, Total HT et OD HT, mais l'URL publiée
> expose l'onglet tel quel : c'est la publication elle-même qu'il faut
> restreindre au bon onglet.

### 2. Lancer la synchronisation

```bash
SHEET_CSV_URL="https://docs.google.com/…/pub?gid=0&single=true&output=csv" \
  node scripts/sync-sheet.mjs --dry-run   # aperçu, n'écrit rien
```

Sans `--dry-run`, le script réécrit `src/data/rows.json`.

Ce qu'il fait :

- ne retient que les sections **Diamond International** et **Jungle** ;
- ignore **Diamond Private**, les lignes `Total` et les en-têtes fusionnés ;
- n'extrait que les colonnes non sensibles (société, type, poste, nombre,
  candidats envoyés, notes) ;
- horodate (`firstSeenAt`) les lignes absentes de la synchronisation précédente
  — c'est ce qui alimente l'onglet **Nouveautés**.

À la toute première synchronisation, aucune ligne n'est marquée « nouvelle » :
sans état antérieur, tout le tableau le serait, ce qui ne veut rien dire.

### 3. Automatiser

Le workflow `.github/workflows/sync-sheet.yml` rejoue l'opération toutes les
heures. Une seule chose à configurer : le secret **`SHEET_CSV_URL`** dans
*Settings → Secrets and variables → Actions*.

Le workflow ne produit un commit que si le tableau a changé ; ce commit déclenche
le redéploiement Vercel. La carte suit donc le tableau sans intervention.

Il est aussi déclenchable à la main depuis l'onglet **Actions**.

## Déploiement

Projet Vercel autonome, framework détecté automatiquement, aucune variable
d'environnement requise à l'exécution (les données sont figées dans le dépôt au
moment du build).
