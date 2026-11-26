const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder
} = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const { getLanguage, t } = require('../lib/language');

const settingsPath = path.join(__dirname, '..', 'data', 'ticket-settings.json');

function readSettings() {
  try { return JSON.parse(fs.readFileSync(settingsPath, 'utf8')); }
  catch (error) {
    if (error.code !== 'ENOENT') console.error('Could not read ticket settings:', error);
    return {};
  }
}

function saveSettings(settings) {
  fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
  fs.writeFileSync(settingsPath, `${JSON.stringify(settings, null, 2)}\n`);
}

function ticketText(language, key, ...args) {
  const messages = {
    fr: {
      setupDone: (channel) => `Le panneau de tickets a été envoyé dans ${channel}.`,
      setupOnlySlash: 'Configure le panneau avec `/ticket setup` et sélectionne le salon.',
      notConfigured: 'Le système de tickets n’est pas configuré. Un administrateur doit utiliser `/ticket setup`.',
      alreadyOpen: (channel) => `Tu as déjà un ticket ouvert : ${channel}`,
      created: 'Ticket créé. Explique ta demande ici ; un membre du staff va t’aider.',
      createdReply: (channel) => `Ton ticket est prêt : ${channel}`,
      createFailed: 'Impossible de créer le ticket. Vérifie les permissions du bot.',
      closeButton: 'Fermer le ticket',
      notTicket: 'Cette commande doit être utilisée dans un ticket.',
      notOwner: 'Seul le créateur du ticket ou un membre du staff peut le fermer.',
      closed: 'Ticket fermé. Le créateur n’a plus accès à ce salon.',
      closedReply: 'Ticket fermé.'
    },
    en: {
      setupDone: (channel) => `The ticket panel was posted in ${channel}.`,
      setupOnlySlash: 'Configure the panel with `/ticket setup` and select a channel.',
      notConfigured: 'The ticket system is not configured. An administrator must use `/ticket setup`.',
      alreadyOpen: (channel) => `You already have an open ticket: ${channel}`,
      created: 'Ticket created. Describe your request here and a staff member will help you.',
      createdReply: (channel) => `Your ticket is ready: ${channel}`,
      createFailed: 'Could not create the ticket. Check the bot permissions.',
      closeButton: 'Close ticket',
      notTicket: 'This command must be used inside a ticket.',
      notOwner: 'Only the ticket creator or a staff member can close it.',
      closed: 'Ticket closed. The creator can no longer view this channel.',
      closedReply: 'Ticket closed.'
    }
  };
  const value = messages[language]?.[key] ?? messages.fr[key];
  return typeof value === 'function' ? value(...args) : value;
}

async function createTicket(guild, user) {
  const config = readSettings()[guild.id];
  if (!config) return { error: 'notConfigured' };
  const existing = guild.channels.cache.find((channel) => channel.type === ChannelType.GuildText && channel.topic?.includes(`ticket-owner:${user.id}`));
  if (existing) return { channel: existing, alreadyOpen: true };

  const botMember = guild.members.me;
  if (!botMember.permissions.has(PermissionFlagsBits.ManageChannels)) return { error: 'createFailed' };
  const safeName = user.username.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').slice(0, 40) || 'member';
  try {
    const overwrites = [
      { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
      { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AttachFiles] },
      { id: botMember.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageChannels] }
    ];
    if (config.supportRoleId && guild.roles.cache.has(config.supportRoleId)) {
      overwrites.push({ id: config.supportRoleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] });
    }
    const channel = await guild.channels.create({
      name: `ticket-${safeName}`.slice(0, 90),
      type: ChannelType.GuildText,
      parent: config.categoryId || undefined,
      topic: `ticket-owner:${user.id}`,
      permissionOverwrites: overwrites
    });
    const language = getLanguage(guild.id);
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('ticket:close').setLabel(ticketText(language, 'closeButton')).setStyle(ButtonStyle.Danger)
    );
    await channel.send({ content: `<@${user.id}> — ${ticketText(language, 'created')}`, components: [row] });
    return { channel };
  } catch (error) {
    console.error('Could not create ticket:', error);
    return { error: 'createFailed' };
  }
}

async function closeTicket(channel, user, member) {
  const ownerId = channel.topic?.match(/ticket-owner:(\d{17,20})/)?.[1];
  if (!ownerId) return { error: 'notTicket' };
  if (ownerId !== user.id && !member.permissions.has(PermissionFlagsBits.ManageChannels)) return { error: 'notOwner' };
  try {
    await channel.permissionOverwrites.edit(ownerId, { ViewChannel: false, SendMessages: false });
    await channel.setName(channel.name.startsWith('closed-') ? channel.name : `closed-${channel.name}`.slice(0, 100));
    return { closed: true };
  } catch (error) {
    console.error('Could not close ticket:', error);
    return { error: 'createFailed' };
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Configure and manage private support tickets')
    .addSubcommand((sub) => sub.setName('setup').setDescription('Post an interactive ticket panel')
      .addChannelOption((option) => option.setName('channel').setDescription('Channel where the panel will be posted').addChannelTypes(ChannelType.GuildText).setRequired(true))
      .addChannelOption((option) => option.setName('category').setDescription('Optional category for ticket channels').addChannelTypes(ChannelType.GuildCategory))
      .addRoleOption((option) => option.setName('support_role').setDescription('Optional role allowed to view tickets')))
    .addSubcommand((sub) => sub.setName('create').setDescription('Create a private support ticket'))
    .addSubcommand((sub) => sub.setName('close').setDescription('Close the current ticket')),
  async execute(interaction) {
    const language = getLanguage(interaction.guildId);
    const sub = interaction.options.getSubcommand();
    if (sub === 'setup') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild)) return interaction.reply({ content: t(language, 'noPermission'), ephemeral: true });
      const channel = interaction.options.getChannel('channel');
      const category = interaction.options.getChannel('category');
      const supportRole = interaction.options.getRole('support_role');
      const botMember = interaction.guild.members.me;
      if (!channel.permissionsFor(botMember).has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])) return interaction.reply({ content: t(language, 'botNoPermission'), ephemeral: true });
      const all = readSettings();
      all[interaction.guildId] = { categoryId: category?.id || null, supportRoleId: supportRole?.id || null };
      saveSettings(all);
      const panel = new EmbedBuilder().setColor(0x5865f2)
        .setTitle(language === 'en' ? 'Support tickets' : 'Tickets de support')
        .setDescription(language === 'en' ? 'Click the button below to open a private support ticket.' : 'Clique sur le bouton ci-dessous pour ouvrir un ticket privé avec le staff.');
      const row = new ActionRowBuilder().addComponents(new ButtonBuilder()
        .setCustomId('ticket:create').setLabel(language === 'en' ? 'Create a ticket' : 'Créer un ticket').setStyle(ButtonStyle.Primary));
      await channel.send({ embeds: [panel], components: [row] });
      return interaction.reply({ content: ticketText(language, 'setupDone', channel), ephemeral: true });
    }
    if (sub === 'create') {
      const result = await createTicket(interaction.guild, interaction.user);
      if (result.error) return interaction.reply({ content: ticketText(language, result.error), ephemeral: true });
      return interaction.reply({ content: ticketText(language, result.alreadyOpen ? 'alreadyOpen' : 'createdReply', result.channel), ephemeral: true });
    }
    const result = await closeTicket(interaction.channel, interaction.user, interaction.member);
    if (result.error) return interaction.reply({ content: ticketText(language, result.error), ephemeral: true });
    return interaction.reply({ content: ticketText(language, 'closedReply'), ephemeral: true });
  },
  async executeMessage(message, args) {
    const language = getLanguage(message.guildId);
    const sub = (args[0] || '').toLowerCase();
    if (sub === 'create') {
      const result = await createTicket(message.guild, message.author);
      if (result.error) return message.reply(ticketText(language, result.error));
      return message.reply(ticketText(language, result.alreadyOpen ? 'alreadyOpen' : 'createdReply', result.channel));
    }
    if (sub === 'close') {
      const result = await closeTicket(message.channel, message.author, message.member);
      if (result.error) return message.reply(ticketText(language, result.error));
      return message.reply(ticketText(language, 'closedReply'));
    }
    return message.reply(ticketText(language, 'setupOnlySlash'));
  },
  createTicket,
  closeTicket,
  ticketText
};
