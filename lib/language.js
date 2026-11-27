const fs = require('node:fs');
const path = require('node:path');

const settingsPath = path.join(__dirname, '..', 'data', 'guild-settings.json');
const strings = {
  fr: {
    noGuild: 'Cette commande est utilisable uniquement sur un serveur.',
    setLanguage: 'Langue du serveur définie sur **Français**.',
    currentLanguage: 'Langue actuelle : **Français**. Utilise `*ma language en` ou `*ma language fr` pour la modifier.',
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
    help: '**Commandes du bot**\nGénéral : `*ma ping`, `*ma aide`, `*ma dashboard`\nLangue : `*ma language fr`, `*ma language en`\nModération : `*ma ban @membre raison`, `*ma kick @membre raison`, `*ma timeout @membre minutes raison`, `*ma clear quantité`, `*ma warn @membre raison`\nTickets : `*ma ticket create`, `*ma ticket close` (configuration : `/ticket setup`)\nAnti-raid (admin) : `*ma antiraid on`, `*ma antiraid off`, `*ma antiraid status`, `*ma antiraid config 8 10` (8 arrivées en 10 secondes)\nRôle automatique (admin) : `*ma autorole set @rôle`, `*ma autorole show`, `*ma autorole off`. Les commandes slash restent aussi disponibles.',
    unknownCommand: 'Commande inconnue. Essaie `*ma aide`.',
    commandError: 'Une erreur est survenue pendant cette commande.',
    autoRoleSet: (role) => `Le rôle automatique est maintenant ${role}. Il sera attribué aux nouveaux membres.`,
    autoRoleOff: 'Attribution automatique du rôle désactivée.',
    autoRoleNone: 'Aucun rôle automatique n’est configuré.',
    autoRoleCurrent: (role) => `Rôle automatique actuel : ${role}.`,
    autoRoleInvalid: 'Rôle introuvable. Mentionne un rôle ou indique son ID.',
    autoRoleHierarchy: 'Je ne peux pas attribuer ce rôle. Vérifie que j’ai la permission Gérer les rôles et que mon rôle est au-dessus du rôle choisi.',
    autoRoleUsage: 'Utilisation : `*ma autorole set @rôle`, `*ma autorole show` ou `*ma autorole off`.',
    autoRoleAssigned: 'Rôle automatique attribué.',
    autoRoleFailed: 'Impossible d’attribuer ce rôle. Vérifie les permissions et la hiérarchie des rôles.',
    antiRaidOn: (threshold, seconds) => `🛡️ Anti-raid activé : ${threshold} arrivées en ${seconds} secondes déclencheront un timeout de 15 minutes sur le dernier membre arrivé.`,
    antiRaidOff: '🛡️ Anti-raid désactivé.',
    antiRaidStatus: (enabled, threshold, seconds) => `🛡️ Anti-raid : **${enabled ? 'activé' : 'désactivé'}** — seuil : ${threshold} arrivées en ${seconds} secondes.`,
    antiRaidConfigured: (threshold, seconds) => `Paramètres anti-raid enregistrés : ${threshold} arrivées en ${seconds} secondes.`,
    antiRaidUsage: 'Utilisation : `*ma antiraid config <nombre 2-50> <secondes 5-60>` (exemple : `*ma antiraid config 8 10`).',
    antiRaidTriggered: (member) => `⚠️ Anti-raid : ${member} a été mis en timeout pendant 15 minutes après une vague d’arrivées.`,
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
    currentLanguage: 'Current language: **English (UK)**. Use `*ma language en` or `*ma language fr` to change it.',
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
    help: '**Bot commands**\nGeneral: `*ma ping`, `*ma aide`, `*ma dashboard`\nLanguage: `*ma language fr`, `*ma language en`\nModeration: `*ma ban @member reason`, `*ma kick @member reason`, `*ma timeout @member minutes reason`, `*ma clear amount`, `*ma warn @member reason`\nTickets: `*ma ticket create`, `*ma ticket close` (setup: `/ticket setup`)\nAnti-raid (admins): `*ma antiraid on`, `*ma antiraid off`, `*ma antiraid status`, `*ma antiraid config 8 10` (8 joins in 10 seconds)\nAutomatic role (admins): `*ma autorole set @role`, `*ma autorole show`, `*ma autorole off`. Slash commands are also available.',
    unknownCommand: 'Unknown command. Try `*ma aide`.',
    commandError: 'An error occurred while running this command.',
    autoRoleSet: (role) => `Automatic role set to ${role}. It will be assigned to new members.`,
    autoRoleOff: 'Automatic role assignment disabled.',
    autoRoleNone: 'No automatic role is configured.',
    autoRoleCurrent: (role) => `Current automatic role: ${role}.`,
    autoRoleInvalid: 'Role not found. Mention a role or provide its ID.',
    autoRoleHierarchy: 'I cannot assign that role. Make sure I have Manage Roles and my highest role is above the selected role.',
    autoRoleUsage: 'Usage: `*ma autorole set @role`, `*ma autorole show`, or `*ma autorole off`.',
    autoRoleAssigned: 'Automatic role assigned.',
    autoRoleFailed: 'Could not assign that role. Check permissions and role hierarchy.',
    antiRaidOn: (threshold, seconds) => `🛡️ Anti-raid enabled: ${threshold} joins within ${seconds} seconds will timeout the latest member for 15 minutes.`,
    antiRaidOff: '🛡️ Anti-raid disabled.',
    antiRaidStatus: (enabled, threshold, seconds) => `🛡️ Anti-raid: **${enabled ? 'enabled' : 'disabled'}** — threshold: ${threshold} joins within ${seconds} seconds.`,
    antiRaidConfigured: (threshold, seconds) => `Anti-raid settings saved: ${threshold} joins within ${seconds} seconds.`,
    antiRaidUsage: 'Usage: `*ma antiraid config <count 2-50> <seconds 5-60>` (example: `*ma antiraid config 8 10`).',
    antiRaidTriggered: (member) => `⚠️ Anti-raid: ${member} was timed out for 15 minutes after a join burst.`,
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
  if (!['fr', 'en'].includes(language)) throw new Error('Unsupported language');
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
