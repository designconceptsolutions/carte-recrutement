# Mise à jour immédiate depuis le tableau

`Code.gs` prévient GitHub dès qu'une personne modifie le tableau, ce qui
relance la synchronisation dans la foulée.

Ce script est **facultatif** : sans lui, le workflow tourne déjà toutes les
15 minutes. Il sert uniquement à passer d'un délai de quinze minutes à
quelques secondes.

## 1. Créer un jeton GitHub

Sur GitHub : **Settings → Developer settings → Personal access tokens →
Fine-grained tokens → Generate new token**.

- **Repository access** : *Only select repositories* → `carte-recrutement`
- **Permissions → Repository permissions → Contents** : *Read and write*
- **Expiration** : au-delà d'un an, prévoir le renouvellement

Copier le jeton, il n'est affiché qu'une fois.

> Ce jeton donne le droit d'écrire dans le dépôt. Il se colle dans les
> propriétés du script (étape 3), jamais dans une cellule du tableau ni dans
> le code : le dépôt est public.

## 2. Coller le script

Dans le tableau : **Extensions → Apps Script**. Remplacer le contenu de
`Code.gs` par celui de ce dossier, puis enregistrer.

## 3. Enregistrer le jeton

Dans l'éditeur Apps Script : **Paramètres du projet** (roue dentée) →
**Propriétés du script** → **Ajouter une propriété**.

| Propriété | Valeur |
|---|---|
| `GITHUB_TOKEN` | le jeton copié à l'étape 1 |

## 4. Installer le déclencheur

Dans l'éditeur, sélectionner la fonction **`createTrigger`** puis **Exécuter**.

Google demandera une autorisation la première fois — c'est attendu : le script
a besoin d'accéder au tableau et de joindre GitHub. L'écran « Google n'a pas
validé cette application » se franchit par *Paramètres avancés → Accéder au
projet*.

## 5. Vérifier

Toujours dans l'éditeur, exécuter la fonction **`testNotification`**, puis
ouvrir le journal d'exécution.

- `204` → tout fonctionne, une synchronisation vient d'être lancée.
- `401` / `403` → jeton absent, expiré, ou sans la permission *Contents*.
- `404` → dépôt introuvable : vérifier `GITHUB_OWNER` / `GITHUB_REPO`, ou le
  fait que le jeton donne bien accès à ce dépôt.

L'onglet **Actions** du dépôt doit alors montrer un passage en cours, déclenché
par `repository_dispatch`.

## Bon à savoir

Deux modifications rapprochées ne déclenchent qu'une seule synchronisation :
le script impose un délai minimal de deux minutes entre deux appels
(`DEBOUNCE_SECONDS`). Rien n'est perdu pour autant — la synchronisation suivante,
ou le passage programmé, reprend l'ensemble du tableau.

Le trigger ne réagit qu'aux changements de contenu ; les modifications de mise
en forme seule sont ignorées.
