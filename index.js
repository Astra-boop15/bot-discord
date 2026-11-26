require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, Events, Partials, AuditLogEvent, PermissionFlagsBits } = require('discord.js');
const { getLanguage, t } = require('./lib/language');
const ticketCommand = require('./commands/ticket');
const { dashboardPayload } = require('./commands/dashboard');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildModeration],
  partials: [Partials.Channel, Partials.GuildMember]
});
client.commands = new Collection();

const antiRaidPath = path.join(__dirname, 'data', 'anti-raid.json');
function readAntiRaid() {
  try { return JSON.parse(fs.readFileSync(antiRaidPath, 'utf8')); }
  catch (error) { return {}; }
}
function saveAntiRaid(settings) {
  fs.mkdirSync(path.dirname(antiRaidPath), { recursive: true });
  fs.writeFileSync(antiRaidPath, `${JSON.stringify(settings, null, 2)}\n`);
}

const commandsPath = path.join(__dirname, 'commands');
for (const file of fs.readdirSync(commandsPath).filter((name) => name.endsWith('.js'))) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.data.name, command);
  for (const alias of command.aliases || []) client.commands.set(alias, command);
}

client.once(Events.ClientReady, (readyClient) => console.log(`Bot connecté en tant que ${readyClient.user.tag}`));

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot || !message.guild) return;

  // Prefixes supported: *ma, **ma and * / ** (the latter stay optional aliases).
  const match = message.content.match(/^((?:\*ma|\*\*ma|\*|\*\*))\s*(.*)$/i);
  if (!match) return;
  const [, , input] = match;
  const [commandName, ...args] = input.trim().split(/\s+/);
  if (!commandName) return;

  const command = client.commands.get(commandName.toLowerCase());
  if (!command || typeof command.executeMessage !== 'function') {
    return message.reply(`Commande inconnue. Essaie \`*ma aide\`, \`**ma aide\` ou \`/aide\`.`);
  }
  try { await command.executeMessage(message, args); }
  catch (error) { console.error(error); await message.reply('Une erreur est survenue pendant cette commande.'); }
});

client.on(Events.InteractionCreate, async (interaction) => {
  const language = getLanguage(interaction.guildId);
  try {
    if (interaction.isStringSelectMenu() && interaction.customId === 'dashboard:category') {
      return interaction.update(dashboardPayload(interaction.client, language, interaction.values[0]));
    }
    if (interaction.isButton()) {
      if (interaction.customId === 'dashboard:ping') return interaction.reply({ content: t(language, 'pong', Math.round(client.ws.ping)), ephemeral: true });
      if (interaction.customId === 'dashboard:help') return interaction.reply({ content: t(language, 'help'), ephemeral: true });
      if (interaction.customId === 'ticket:create') {
        const result = await ticketCommand.createTicket(interaction.guild, interaction.user);
        if (result.error) return interaction.reply({ content: ticketCommand.ticketText(language, result.error), ephemeral: true });
        const key = result.alreadyOpen ? 'alreadyOpen' : 'createdReply';
        return interaction.reply({ content: ticketCommand.ticketText(language, key, result.channel), ephemeral: true });
      }
      if (interaction.customId === 'ticket:close') {
        const result = await ticketCommand.closeTicket(interaction.channel, interaction.user, interaction.member);
        if (result.error) return interaction.reply({ content: ticketCommand.ticketText(language, result.error), ephemeral: true });
        return interaction.reply({ content: ticketCommand.ticketText(language, 'closedReply'), ephemeral: true });
      }
    }
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    const response = { content: 'Une erreur est survenue.', ephemeral: true };
    if (interaction.replied || interaction.deferred) await interaction.followUp(response);
    else await interaction.reply(response);
  }
});

// Anti-raid: detect and quarantine unusually rapid joins.
// Configure with *ma antiraid on or *ma antiraid off (Manage Guild permission required).
const joins = new Map();
client.on(Events.GuildMemberAdd, async (member) => {
  const settings = readAntiRaid()[member.guild.id];
  if (!settings?.enabled) return;

  const now = Date.now();
  const windowMs = settings.windowMs || 10_000;
  const threshold = settings.threshold || 8;
  const recent = (joins.get(member.guild.id) || []).filter((time) => now - time < windowMs);
  recent.push(now);
  joins.set(member.guild.id, recent);

  if (recent.length >= threshold) {
    const botMember = member.guild.members.me;
    if (!botMember?.permissions.has(PermissionFlagsBits.ModerateMembers)) return;

    try {
      await member.timeout(15 * 60 * 1000, 'Anti-raid: détection de joins rapides');
      const channel = member.guild.systemChannel;
      if (channel?.isTextBased()) {
        await channel.send(`⚠️ Anti-raid activé : ${member} a été isolé pendant 15 minutes après une vague d’arrivées.`).catch(() => {});
      }
      joins.set(member.guild.id, []);
    } catch (error) {
      console.error('Anti-raid action failed:', error);
    }
  }
});

// Prefix administration command for anti-raid.
const antiRaidCommand = {
  data: {
    name: 'antiraid',
    toJSON() { return { name: 'antiraid', description: 'Configure anti-raid protection' }; }
  },
  executeMessage: async (message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply(t(getLanguage(message.guildId), 'noPermission'));
    }
    const action = (args[0] || '').toLowerCase();
    const all = readAntiRaid();
    all[message.guildId] ||= {};

    if (action === 'on') {
      all[message.guildId].enabled = true;
      all[message.guildId].threshold ||= 8;
      all[message.guildId].windowMs ||= 10_000;
      saveAntiRaid(all);
      return message.reply('🛡️ Anti-raid activé : 8 arrivées en 10 secondes déclenchent une mise en timeout temporaire.');
    }
    if (action === 'off') {
      all[message.guildId].enabled = false;
      saveAntiRaid(all);
      return message.reply('🛡️ Anti-raid désactivé.');
    }
    const enabled = all[message.guildId].enabled === true;
    return message.reply(`🛡️ Anti-raid : **${enabled ? 'activé' : 'désactivé'}**. Utilise \`*ma antiraid on\` ou \`*ma antiraid off\`.`);
  }
};
client.commands.set('antiraid', antiRaidCommand);

if (!process.env.DISCORD_TOKEN) {
  console.error('DISCORD_TOKEN est manquant. Copie .env.example vers .env.');
  process.exit(1);
}
client.login(process.env.DISCORD_TOKEN);
