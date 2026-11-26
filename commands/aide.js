const { SlashCommandBuilder } = require('discord.js');
const { getLanguage, t } = require('../lib/language');

module.exports = {
  data: new SlashCommandBuilder().setName('aide').setDescription('Affiche la liste des commandes disponibles'),
  async execute(interaction) {
    await interaction.reply({ content: t(getLanguage(interaction.guildId), 'help'), ephemeral: true });
  },
  async executeMessage(message) {
    await message.reply(t(getLanguage(message.guildId), 'help'));
  }
};
