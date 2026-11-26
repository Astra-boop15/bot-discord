const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Affiche la latence du bot'),
  async execute(interaction) {
    const sent = await interaction.reply({
      content: 'Calcul de la latence...',
      fetchReply: true
    });

    await interaction.editReply(`Pong ! Latence: ${sent.createdTimestamp - interaction.createdTimestamp} ms`);
  }
};
