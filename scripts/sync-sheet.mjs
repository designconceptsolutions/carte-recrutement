#!/usr/bin/env node
// Synchronise `src/data/rows.json` depuis le tableau Google Sheet publié.
//
//   SHEET_CSV_URL=https://docs.google.com/.../pub?gid=0&single=true&output=csv \
//     node scripts/sync-sheet.mjs
//
// Ce que le script garantit :
//   - le pack « DIAMOND PRIVATE » est ignoré (clients particuliers) ;
//   - seules les colonnes non sensibles sont lues — Tarif, Montant HT,
//     Total HT et OD HT ne sont jamais extraits, même s'ils sont publiés ;
//   - une ligne absente de la synchronisation précédente reçoit un
//     `firstSeenAt`, ce qui alimente l'onglet « Nouveautés » ; les lignes
//     déjà connues conservent le leur.
//
// `--dry-run` affiche le résultat sans écrire le fichier.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TARGET = resolve(ROOT, "src/data/rows.json");
const DRY_RUN = process.argv.includes("--dry-run");

/** Colonnes financières : jamais reprises, quoi qu'il arrive. */
const FORBIDDEN = ["tarif", "montant", "total ht", "od ht"];

/** Analyseur CSV minimal gérant les champs entre guillemets et les sauts de ligne. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') quoted = true;
    else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

const norm = (s) =>
  String(s ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

/** Repère un intitulé de section et en déduit le pack (null = section à ignorer). */
function detectSection(cells) {
  const joined = norm(cells.join(" "));
  if (joined.includes("diamond private")) return { section: "private", pack: null };
  if (joined.includes("diamond international")) return { section: "diamond", pack: "Diamond" };
  if (joined.includes("jungle")) return { section: "jungle", pack: "Jungle" };
  return null;
}

/** Associe les colonnes utiles à partir d'une ligne d'en-tête. */
function mapHeader(cells) {
  const index = {};
  cells.forEach((cell, i) => {
    const key = norm(cell);
    if (!key) return;
    if (FORBIDDEN.some((f) => key.startsWith(f))) return;
    if (key === "societe") index.establishment = i;
    else if (key === "type") index.type = i;
    else if (key.startsWith("poste")) index.roleVariant = i;
    else if (key === "nombre") index.sought = i;
    else if (key.startsWith("candidats")) index.sent = i;
    else if (key.startsWith("notes")) index.note = i;
  });
  return index.establishment !== undefined && index.roleVariant !== undefined ? index : null;
}

const cell = (cells, i) => (i === undefined ? "" : String(cells[i] ?? "").trim());

function toInt(value) {
  const n = Number.parseInt(String(value).replace(/[^0-9-]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
}

export function extractRows(csvText) {
  const table = parseCsv(csvText);
  const rows = [];
  let pack = null;
  let header = null;

  for (const cells of table) {
    if (!cells.some((c) => String(c).trim())) continue;

    const section = detectSection(cells);
    if (section) {
      pack = section.pack;
      header = null;
      continue;
    }

    const maybeHeader = mapHeader(cells);
    if (maybeHeader) {
      header = maybeHeader;
      continue;
    }

    if (!pack || !header) continue; // section privée, ou en-tête pas encore vu
    if (norm(cells[0]).startsWith("total")) continue;

    const establishment = cell(cells, header.establishment);
    const roleVariant = cell(cells, header.roleVariant);
    if (!establishment || !roleVariant) continue;

    rows.push({
      pack,
      establishment,
      type: cell(cells, header.type),
      roleVariant,
      sought: Math.max(1, toInt(cell(cells, header.sought))),
      sent: toInt(cell(cells, header.sent)),
      ...(cell(cells, header.note) ? { note: cell(cells, header.note) } : {}),
    });
  }
  return rows;
}

/** Clé d'identité d'une ligne, suffixée pour distinguer les doublons exacts. */
function identity(row, seen) {
  const base = `${row.pack}|${norm(row.establishment)}|${norm(row.roleVariant)}`;
  const count = (seen.get(base) ?? 0) + 1;
  seen.set(base, count);
  return `${base}#${count}`;
}

/** Reporte les `firstSeenAt` connus et horodate les lignes nouvelles. */
export function mergeFirstSeen(incoming, previous, now = new Date().toISOString()) {
  const previousSeen = new Map();
  const known = new Map();
  for (const row of previous) {
    known.set(identity(row, previousSeen), row.firstSeenAt ?? null);
  }

  const incomingSeen = new Map();
  const added = [];
  const merged = incoming.map((row) => {
    const id = identity(row, incomingSeen);
    if (known.has(id)) {
      const firstSeenAt = known.get(id);
      return firstSeenAt ? { ...row, firstSeenAt } : row;
    }
    added.push(row);
    // Première synchronisation : tout serait « nouveau », ce qui n'a pas de
    // sens — on n'horodate que les ajouts constatés face à un état existant.
    return previous.length ? { ...row, firstSeenAt: now } : row;
  });

  return { merged, added };
}

async function main() {
  const url = process.env.SHEET_CSV_URL;
  if (!url) {
    console.error("SHEET_CSV_URL manquant. Voir README.md § Synchronisation.");
    process.exit(1);
  }

  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) {
    console.error(`Téléchargement du tableau échoué : HTTP ${response.status}`);
    process.exit(1);
  }
  const csv = await response.text();
  if (norm(csv).startsWith("<!doctype html") || csv.includes("<html")) {
    console.error(
      "Réponse HTML au lieu d'un CSV : l'onglet n'est probablement pas publié.\n" +
        "Fichier → Partager → Publier sur le web → onglet voulu → format CSV."
    );
    process.exit(1);
  }

  const incoming = extractRows(csv);
  if (!incoming.length) {
    console.error("Aucune ligne exploitable — structure du tableau modifiée ? Abandon.");
    process.exit(1);
  }

  let previous = [];
  try {
    previous = JSON.parse(readFileSync(TARGET, "utf8")).rows ?? [];
  } catch {
    // Pas encore de fichier : première synchronisation.
  }

  const { merged, added } = mergeFirstSeen(incoming, previous);

  console.log(`Lignes lues        : ${incoming.length}`);
  console.log(`  Diamond / Jungle : ${merged.filter((r) => r.pack === "Diamond").length} / ${merged.filter((r) => r.pack === "Jungle").length}`);
  console.log(`Nouvelles lignes   : ${added.length}`);
  for (const row of added.slice(0, 20)) {
    console.log(`  + [${row.pack}] ${row.establishment} — ${row.roleVariant}`);
  }
  if (previous.length && merged.length < previous.length) {
    console.log(`Lignes retirées    : ${previous.length - merged.length}`);
  }

  if (DRY_RUN) {
    console.log("\n--dry-run : aucun fichier écrit.");
    return;
  }

  writeFileSync(
    TARGET,
    JSON.stringify({ syncedAt: new Date().toISOString(), rows: merged }, null, 2) + "\n"
  );
  console.log(`\n${TARGET} mis à jour.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
