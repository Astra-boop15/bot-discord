const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('aide')
    .setDescription('Affiche la liste des commandes disponibles'),
  async execute(interaction) {
    await interaction.reply({
      content: '**Commandes disponibles**\n`/ping` — vérifie la latence du bot\n`/aide` — affiche cette liste',
      ephemeral: true
    });
  }
};
