/**
 * Google Apps Script — prévient GitHub dès que le tableau est modifié.
 *
 * À coller dans le tableau : Extensions → Apps Script.
 * Voir README.gs.md, dans ce dossier, pour la mise en service (jeton + trigger).
 *
 * Sans ce script, la carte se met quand même à jour : le workflow tourne
 * toutes les 15 minutes. Le script sert à rendre la mise à jour immédiate.
 */

const GITHUB_OWNER = 'designconceptsolutions';
const GITHUB_REPO = 'carte-recrutement';

/** Délai minimal entre deux appels, pour ne pas déclencher une rafale de
 *  synchronisations pendant une saisie continue. Toute modification survenue
 *  pendant ce délai sera de toute façon reprise par l'appel suivant ou par
 *  le passage programmé. */
const DEBOUNCE_SECONDS = 120;

/**
 * Point d'entrée appelé par le trigger « onChange ».
 * Un trigger installable est nécessaire : les triggers simples n'ont pas le
 * droit d'émettre des requêtes réseau.
 */
function onSheetChange(event) {
  // Les changements purement cosmétiques ne modifient aucune donnée.
  const ignored = ['FORMAT'];
  if (event && event.changeType && ignored.indexOf(event.changeType) !== -1) {
    return;
  }
  notifyGitHub();
}

/** Appelable à la main depuis l'éditeur pour vérifier la configuration. */
function testNotification() {
  const status = notifyGitHub({ force: true });
  Logger.log('Code HTTP renvoyé par GitHub : ' + status);
  if (status === 204) {
    Logger.log('OK — la synchronisation a été déclenchée.');
  } else if (status === 401 || status === 403) {
    Logger.log('Jeton absent, expiré, ou sans la portée « repo ».');
  } else if (status === 404) {
    Logger.log('Dépôt introuvable : vérifier GITHUB_OWNER / GITHUB_REPO, ou la portée du jeton.');
  }
}

/**
 * Demande à GitHub de lancer le workflow de synchronisation.
 * @return {number} code HTTP renvoyé par GitHub (204 = succès).
 */
function notifyGitHub(options) {
  const force = Boolean(options && options.force);
  const properties = PropertiesService.getScriptProperties();

  if (!force) {
    const last = Number(properties.getProperty('LAST_DISPATCH_MS') || 0);
    const elapsed = (Date.now() - last) / 1000;
    if (elapsed < DEBOUNCE_SECONDS) {
      return 0; // appel trop rapproché, on laisse le précédent faire le travail
    }
  }

  const token = properties.getProperty('GITHUB_TOKEN');
  if (!token) {
    throw new Error(
      'Propriété GITHUB_TOKEN absente. Paramètres du projet → Propriétés du script.'
    );
  }

  const response = UrlFetchApp.fetch(
    'https://api.github.com/repos/' + GITHUB_OWNER + '/' + GITHUB_REPO + '/dispatches',
    {
      method: 'post',
      contentType: 'application/json',
      headers: {
        Authorization: 'Bearer ' + token,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      payload: JSON.stringify({ event_type: 'sheet-updated' }),
      muteHttpExceptions: true,
    }
  );

  const status = response.getResponseCode();
  if (status === 204) {
    properties.setProperty('LAST_DISPATCH_MS', String(Date.now()));
  } else {
    Logger.log('Échec du déclenchement (HTTP ' + status + ') : ' + response.getContentText());
  }
  return status;
}

/**
 * Installe le trigger « onChange ». À exécuter une seule fois depuis
 * l'éditeur. Relancer la fonction ne crée pas de doublon.
 */
function createTrigger() {
  const existing = ScriptApp.getProjectTriggers();
  for (let i = 0; i < existing.length; i++) {
    if (existing[i].getHandlerFunction() === 'onSheetChange') {
      Logger.log('Le trigger existe déjà, rien à faire.');
      return;
    }
  }
  ScriptApp.newTrigger('onSheetChange')
    .forSpreadsheet(SpreadsheetApp.getActive())
    .onChange()
    .create();
  Logger.log('Trigger installé : la carte se mettra à jour à chaque modification.');
}
