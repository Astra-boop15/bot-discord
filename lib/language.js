const fs = require('node:fs');
const path = require('node:path');

const settingsPath = path.join(__dirname, '..', 'data', 'guild-settings.json');
const strings = {
  fr: {
    noGuild: 'Cette commande est utilisable uniquement sur un serveur.',
    setLanguage: 'Langue du serveur définie sur **Français**.',
    currentLanguage: 'Langue actuelle : **Français**. Utilise `/language set` pour la modifier.',
    chooseLanguage: 'Choisis `fr` ou `en`.',
    noPermission: 'Tu n’as pas la permission nécessaire pour utiliser cette commande.',
    botNoPermission: 'Je n’ai pas la permission nécessaire pour effectuer cette action.',
    targetHigher: 'Cette personne a un rôle égal ou supérieur au tien, ou au mien.',
    userNotFound: 'Utilisateur introuvable sur ce serveur.',
    done: 'Action effectuée.',
    reason: 'Raison',
    duration: 'Durée',
    invalidAmount: 'Indique une quantité entre 1 et 100.',
    clearDone: (count) => `${count} message(s) supprimé(s).`,
    warnDm: (server, reason) => `Tu as reçu un avertissement sur **${server}**. Raison : ${reason}`,
    warnDone: (user, reason) => `Avertissement envoyé à ${user}. Raison : ${reason}`,
    dmFailed: ' (message privé non envoyé)',
    help: '**Commandes du bot**\n`/ping`, `/dashboard`, `/language`\nModération : `/ban`, `/kick`, `/timeout`, `/clear`, `/warn`\nAvec le préfixe `*` : `*ma ban @membre raison`, `*ma kick @membre raison`, `*ma timeout @membre minutes raison`, `*ma clear nombre`, `*ma warn @membre raison`.',
    dashboardTitle: 'Tableau de bord — Bot Astra',
    dashboardDescription: 'Bienvenue ! Choisis une action ci-dessous.',
    online: 'En ligne',
    latency: 'Latence',
    commands: 'Commandes',
    testLatency: 'Tester la latence',
    viewCommands: 'Voir les commandes',
    pong: (ms) => `Pong ! Latence : ${ms} ms`
  },
  en: {
    noGuild: 'This command can only be used in a server.',
    setLanguage: 'Server language set to **English (UK)**.',
    currentLanguage: 'Current language: **English (UK)**. Use `/language set` to change it.',
    chooseLanguage: 'Choose `fr` or `en`.',
    noPermission: 'You do not have permission to use this command.',
    botNoPermission: 'I do not have the permission required to perform this action.',
    targetHigher: 'That member has a role equal to or higher than yours, or mine.',
    userNotFound: 'Member not found in this server.',
    done: 'Action completed.',
    reason: 'Reason',
    duration: 'Duration',
    invalidAmount: 'Enter an amount between 1 and 100.',
    clearDone: (count) => `Deleted ${count} message(s).`,
    warnDm: (server, reason) => `You have received a warning in **${server}**. Reason: ${reason}`,
    warnDone: (user, reason) => `Warning sent to ${user}. Reason: ${reason}`,
    dmFailed: ' (could not send a DM)',
    help: '**Bot commands**\n`/ping`, `/dashboard`, `/language`\nModeration: `/ban`, `/kick`, `/timeout`, `/clear`, `/warn`\nPrefix commands: `*ma ban @member reason`, `*ma kick @member reason`, `*ma timeout @member minutes reason`, `*ma clear amount`, `*ma warn @member reason`.',
    dashboardTitle: 'Dashboard — Astra Bot',
    dashboardDescription: 'Welcome! Choose an action below.',
    online: 'Online',
    latency: 'Latency',
    commands: 'Commands',
    testLatency: 'Test latency',
    viewCommands: 'View commands',
    pong: (ms) => `Pong! Latency: ${ms} ms`
  }
};

function readSettings() {
  try {
    return JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') console.error('Could not read guild language settings:', error);
    return {};
  }
}

function getLanguage(guildId) {
  return readSettings()[guildId] === 'en' ? 'en' : 'fr';
}

function setLanguage(guildId, language) {
  const settings = readSettings();
  settings[guildId] = language;
  fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
  fs.writeFileSync(settingsPath, `${JSON.stringify(settings, null, 2)}\n`);
}

function t(language, key, ...args) {
  const value = strings[language]?.[key] ?? strings.fr[key];
  return typeof value === 'function' ? value(...args) : value;
}

module.exports = { getLanguage, setLanguage, t };
