const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Affiche la latence du bot'),
  async execute(interaction) {
    await interaction.reply({ content: `Pong ! Latence : ${Math.round(interaction.client.ws.ping)} ms` });
  },
  async executeMessage(message) {
    await message.reply(`Pong ! Latence : ${Math.round(message.client.ws.ping)} ms`);
  }
};
