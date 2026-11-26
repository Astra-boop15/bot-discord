const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder
} = require('discord.js');

function dashboardPayload(client) {
  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('Tableau de bord — Bot Astra')
    .setDescription('Bienvenue ! Utilise les boutons ci-dessous ou les commandes disponibles.')
    .addFields(
      { name: 'État', value: '🟢 En ligne', inline: true },
      { name: 'Latence', value: `${Math.round(client.ws.ping)} ms`, inline: true },
      { name: 'Commandes', value: '`/ping` · `/aide` · `/dashboard`\n`*ma ping` · `*ma aide` · `*ma dashboard`' }
    )
    .setTimestamp();

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('dashboard:ping').setLabel('Tester la latence').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('dashboard:help').setLabel('Voir les commandes').setStyle(ButtonStyle.Secondary)
  );

  return { embeds: [embed], components: [buttons] };
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dashboard')
    .setDescription('Affiche le tableau de bord du bot dans Discord'),
  async execute(interaction) {
    await interaction.reply({ ...dashboardPayload(interaction.client), ephemeral: true });
  },
  async executeMessage(message) {
    await message.reply(dashboardPayload(message.client));
  }
};
