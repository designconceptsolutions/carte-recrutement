# Carte de recrutement — Diamond & Jungle

Carte interactive de France présentant des postes en restauration et hôtellerie à pourvoir, classés en deux packs :

- **Diamond** : établissements haut de gamme (hôtels 5\*, restaurants étoilés, palace).
- **Jungle** : restauration, bistrot, brasserie, hôtellerie plus décontractée.

## Stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS v4, shadcn/ui (radix-ui), lucide-react
- Leaflet + react-leaflet (carte OpenStreetMap, chargée client-only pour rester SSR-safe)

Toutes les données (`src/data/jobs.ts`) sont statiques — c'est un projet de démonstration, indépendant de toute API.

## Démarrage

```bash
npm install
npm run dev          # http://localhost:3000
```

## Structure

```
src/
  app/
    layout.tsx        # Layout racine, fonts, metadata SEO
    page.tsx           # Page d'accueil (la carte)
    globals.css         # Tokens Tailwind v4 (thème + packs Diamond/Jungle)
  components/
    jobs-map/
      JobsMap.tsx        # Filtres, liste, état, modale de détails
      MapView.tsx        # Wrapper SSR-safe (dynamic import + error boundary)
      MapViewClient.tsx  # Carte Leaflet client-only
    ui/                  # Composants shadcn/ui
  data/
    jobs.ts              # Données de démonstration + parseContract / parseHousing
```

## Déploiement

Projet Vercel indépendant : importer ce repo sur [vercel.com/new](https://vercel.com/new), framework Next.js détecté automatiquement, aucune variable d'environnement requise (données statiques).
