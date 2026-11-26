const { SlashCommandBuilder } = require('discord.js');
const { getLanguage, t } = require('../lib/language');

module.exports = {
  data: new SlashCommandBuilder().setName('ping').setDescription('Affiche la latence du bot'),
  async execute(interaction) {
    await interaction.reply({ content: t(getLanguage(interaction.guildId), 'pong', Math.round(interaction.client.ws.ping)) });
  },
  async executeMessage(message) {
    await message.reply(t(getLanguage(message.guildId), 'pong', Math.round(message.client.ws.ping)));
  }
};
