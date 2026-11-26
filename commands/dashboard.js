const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder
} = require('discord.js');
const { getLanguage, t } = require('../lib/language');

function dashboardPayload(client, language) {
  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle(t(language, 'dashboardTitle'))
    .setDescription(t(language, 'dashboardDescription'))
    .addFields(
      { name: t(language, 'online'), value: '🟢', inline: true },
      { name: t(language, 'latency'), value: `${Math.round(client.ws.ping)} ms`, inline: true },
      { name: t(language, 'commands'), value: '`/ping` · `/aide` · `/language`\n`/ban` · `/kick` · `/timeout` · `/clear` · `/warn`\nUse `*ma` before a command for prefix mode.' }
    )
    .setTimestamp();
  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('dashboard:ping').setLabel(t(language, 'testLatency')).setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('dashboard:help').setLabel(t(language, 'viewCommands')).setStyle(ButtonStyle.Secondary)
  );
  return { embeds: [embed], components: [buttons] };
}

module.exports = {
  data: new SlashCommandBuilder().setName('dashboard').setDescription('Affiche le tableau de bord du bot dans Discord'),
  async execute(interaction) {
    await interaction.reply({ ...dashboardPayload(interaction.client, getLanguage(interaction.guildId)), ephemeral: true });
  },
  async executeMessage(message) {
    await message.reply(dashboardPayload(message.client, getLanguage(message.guildId)));
  }
};
