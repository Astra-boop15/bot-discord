require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, Events, Partials, PermissionFlagsBits } = require('discord.js');
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
  catch (error) {
    if (error.code !== 'ENOENT') console.error('Could not read anti-raid settings:', error);
    return {};
  }
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

  // Prefix commands consistently use *ma; slash commands remain available separately.
  const match = message.content.match(/^\*ma\s+(.+)$/i);
  if (!match) return;
  const [commandName, ...args] = match[1].trim().split(/\s+/);
  if (!commandName) return;

  const language = getLanguage(message.guildId);
  const command = client.commands.get(commandName.toLowerCase());
  if (!command || typeof command.executeMessage !== 'function') {
    return message.reply(t(language, 'unknownCommand'));
  }
  try { await command.executeMessage(message, args); }
  catch (error) {
    console.error(error);
    await message.reply(t(language, 'commandError')).catch(() => {});
  }
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
    const response = { content: t(language, 'commandError'), ephemeral: true };
    if (interaction.replied || interaction.deferred) await interaction.followUp(response);
    else await interaction.reply(response);
  }
});

// Assign the configured member role and apply anti-raid protection on join.
const joins = new Map();
client.on(Events.GuildMemberAdd, async (member) => {
  const language = getLanguage(member.guild.id);

  try {
    const autoRoleId = require('./commands/autorole').getConfiguredRoleId(member.guild.id);
    if (!member.user.bot && autoRoleId) {
      const role = await member.guild.roles.fetch(autoRoleId).catch(() => null);
      const botMember = member.guild.members.me || await member.guild.members.fetchMe().catch(() => null);
      if (role && botMember?.permissions.has(PermissionFlagsBits.ManageRoles) && role.position < botMember.roles.highest.position) {
        await member.roles.add(role, 'Configured automatic member role');
      } else if (role) {
        console.warn(`Could not assign auto-role ${role.id} in guild ${member.guild.id}: check Manage Roles and role hierarchy.`);
      }
    }
  } catch (error) {
    console.error('Automatic role assignment failed:', error);
  }

  try {
    const settings = readAntiRaid()[member.guild.id];
    if (!settings?.enabled) return;

    const now = Date.now();
    const windowMs = settings.windowMs || 10_000;
    const threshold = settings.threshold || 8;
    const recent = (joins.get(member.guild.id) || []).filter((time) => now - time < windowMs);
    recent.push(now);
    joins.set(member.guild.id, recent);
    if (recent.length < threshold) return;

    const botMember = member.guild.members.me || await member.guild.members.fetchMe().catch(() => null);
    if (!botMember?.permissions.has(PermissionFlagsBits.ModerateMembers)) return;
    await member.timeout(15 * 60 * 1000, 'Anti-raid: rapid join detection');
    const channel = member.guild.systemChannel;
    if (channel?.isTextBased()) await channel.send(t(language, 'antiRaidTriggered', `<@${member.id}>`)).catch(() => {});
    joins.set(member.guild.id, []);
  } catch (error) {
    console.error('Anti-raid action failed:', error);
  }
});

const antiRaidCommand = {
  data: {
    name: 'antiraid',
    toJSON() { return { name: 'antiraid', description: 'Configure anti-raid protection' }; }
  },
  executeMessage: async (message, args) => {
    const language = getLanguage(message.guildId);
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply(t(language, 'noPermission'));
    }
    const action = (args[0] || 'status').toLowerCase();
    const all = readAntiRaid();
    all[message.guildId] ||= {};
    const settings = all[message.guildId];

    if (action === 'on' || action === 'enable') {
      settings.enabled = true;
      settings.threshold ||= 8;
      settings.windowMs ||= 10_000;
      saveAntiRaid(all);
      return message.reply(t(language, 'antiRaidOn', settings.threshold, settings.windowMs / 1000));
    }
    if (action === 'off' || action === 'disable') {
      settings.enabled = false;
      saveAntiRaid(all);
      return message.reply(t(language, 'antiRaidOff'));
    }
    if (action === 'config' || action === 'set') {
      const threshold = Number(args[1]);
      const seconds = Number(args[2]);
      if (!Number.isInteger(threshold) || threshold < 2 || threshold > 50 || !Number.isInteger(seconds) || seconds < 5 || seconds > 60) {
        return message.reply(t(language, 'antiRaidUsage'));
      }
      settings.threshold = threshold;
      settings.windowMs = seconds * 1000;
      saveAntiRaid(all);
      return message.reply(t(language, 'antiRaidConfigured', threshold, seconds));
    }
    return message.reply(t(language, 'antiRaidStatus', settings.enabled === true, settings.threshold || 8, (settings.windowMs || 10_000) / 1000));
  }
};
client.commands.set('antiraid', antiRaidCommand);

if (!process.env.DISCORD_TOKEN) {
  console.error('DISCORD_TOKEN est manquant. Copie .env.example vers .env.');
  process.exit(1);
}
client.login(process.env.DISCORD_TOKEN);
