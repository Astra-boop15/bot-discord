const { SlashCommandBuilder } = require('discord.js');

const helpText = '**Commandes disponibles**\n`/ping` ou `*ma ping` — vérifie la latence du bot\n`/aide` ou `*ma aide` — affiche cette liste\n`/dashboard` ou `*ma dashboard` — ouvre le tableau de bord';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('aide')
    .setDescription('Affiche la liste des commandes disponibles'),
  async execute(interaction) {
    await interaction.reply({ content: helpText, ephemeral: true });
  },
  async executeMessage(message) {
    await message.reply(helpText);
  }
};
