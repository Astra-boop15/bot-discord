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
    fr: ['Commandes générales', '`/ping` — vérifier la latence\n`/aide` — afficher l’aide\n`/dashboard` — ouvrir ce tableau de bord\n`/language` — choisir la langue'],
    en: ['General commands', '`/ping` — check latency\n`/aide` — show help\n`/dashboard` — open this dashboard\n`/language` — choose server language']
  },
  moderation: {
    fr: ['Modération', '`/ban membre raison` — bannir\n`/kick membre raison` — expulser\n`/timeout membre minutes raison` — appliquer un délai\n`/clear quantité` — supprimer des messages\n`/warn membre raison` — avertir'],
    en: ['Moderation', '`/ban member reason` — ban a member\n`/kick member reason` — kick a member\n`/timeout member minutes reason` — timeout a member\n`/clear amount` — delete messages\n`/warn member reason` — warn a member']
  },
  tickets: {
    fr: ['Tickets', '`/ticket setup` — publier le panneau (admin)\n`/ticket create` — ouvrir un ticket\n`/ticket close` — fermer le ticket courant'],
    en: ['Tickets', '`/ticket setup` — post the panel (admin)\n`/ticket create` — open a ticket\n`/ticket close` — close the current ticket']
  },
  settings: {
    fr: ['Configuration', '`/language set` — choisir Français ou English (UK)\nLes commandes préfixées commencent par `*ma`, par exemple `*ma ticket create`.'],
    en: ['Settings', '`/language set` — choose Français or English (UK)\nPrefix commands start with `*ma`, for example `*ma ticket create`.']
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
