const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
  StringSelectMenuBuilder
} = require('discord.js');
const { getLanguage, t } = require('../lib/language');

const pages = {
  general: {
    fr: ['Commandes générales', '`*ma ping` — vérifier la latence\n`*ma aide` — afficher l’aide\n`*ma dashboard` — ouvrir ce tableau de bord'],
    en: ['General commands', '`*ma ping` — check latency\n`*ma aide` — show help\n`*ma dashboard` — open this dashboard']
  },
  moderation: {
    fr: ['Modération', '`*ma ban @membre raison` — bannir\n`*ma kick @membre raison` — expulser\n`*ma timeout @membre minutes raison` — appliquer un délai\n`*ma clear quantité` — supprimer des messages\n`*ma warn @membre raison` — avertir'],
    en: ['Moderation', '`*ma ban @member reason` — ban a member\n`*ma kick @member reason` — kick a member\n`*ma timeout @member minutes reason` — timeout a member\n`*ma clear amount` — delete messages\n`*ma warn @member reason` — send a warning']
  },
  tickets: {
    fr: ['Tickets', '`*ma ticket create` — ouvrir un ticket\n`*ma ticket close` — fermer le ticket courant\n`/ticket setup` — configurer le panneau (admin)'],
    en: ['Tickets', '`*ma ticket create` — open a ticket\n`*ma ticket close` — close the current ticket\n`/ticket setup` — configure the panel (admin)']
  },
  settings: {
    fr: ['Configuration', '`*ma language fr` / `*ma language en` — choisir la langue\n`*ma antiraid on|off|status` — protection anti-raid\n`*ma autorole set @rôle` / `*ma autorole off` — rôle automatique'],
    en: ['Settings', '`*ma language fr` / `*ma language en` — choose the language\n`*ma antiraid on|off|status` — anti-raid protection\n`*ma autorole set @role` / `*ma autorole off` — automatic member role']
  }
};

function dashboardPayload(client, language, category = 'general') {
  const [title, description] = pages[category]?.[language] || pages.general[language];
  const embed = new EmbedBuilder().setColor(0x5865f2)
    .setTitle(`${t(language, 'dashboardTitle')} · ${title}`)
    .setDescription(`${t(language, 'dashboardDescription')}\n\n${description}`)
    .addFields(
      { name: t(language, 'online'), value: '🟢', inline: true },
      { name: t(language, 'latency'), value: `${Math.round(client.ws.ping)} ms`, inline: true }
    ).setTimestamp();

  const select = new StringSelectMenuBuilder()
    .setCustomId('dashboard:category')
    .setPlaceholder(language === 'en' ? 'Browse commands by category' : 'Parcourir les commandes par catégorie')
    .addOptions(
      { label: language === 'en' ? 'General' : 'Général', value: 'general', emoji: '✨', default: category === 'general' },
      { label: language === 'en' ? 'Moderation' : 'Modération', value: 'moderation', emoji: '🛡️', default: category === 'moderation' },
      { label: language === 'en' ? 'Tickets' : 'Tickets', value: 'tickets', emoji: '🎫', default: category === 'tickets' },
      { label: language === 'en' ? 'Settings' : 'Configuration', value: 'settings', emoji: '⚙️', default: category === 'settings' }
    );
  const row = new ActionRowBuilder().addComponents(select);
  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('dashboard:ping').setLabel(t(language, 'testLatency')).setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('dashboard:help').setLabel(t(language, 'viewCommands')).setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('ticket:create').setLabel(language === 'en' ? 'Create a ticket' : 'Créer un ticket').setStyle(ButtonStyle.Success)
  );
  return { embeds: [embed], components: [row, buttons] };
}

module.exports = {
  data: new SlashCommandBuilder().setName('dashboard').setDescription('Affiche le tableau de bord interactif du bot'),
  async execute(interaction) {
    await interaction.reply({ ...dashboardPayload(interaction.client, getLanguage(interaction.guildId)), ephemeral: true });
  },
  async executeMessage(message) {
    await message.reply(dashboardPayload(message.client, getLanguage(message.guildId)));
  },
  dashboardPayload
};
