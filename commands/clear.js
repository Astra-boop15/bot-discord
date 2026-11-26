const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { getLanguage, t } = require('../lib/language');

const permission = PermissionFlagsBits.ManageMessages;
module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Delete a number of recent messages')
    .setDefaultMemberPermissions(permission)
    .addIntegerOption((option) => option.setName('amount').setDescription('Number of messages (1–100)').setMinValue(1).setMaxValue(100).setRequired(true)),
  async execute(interaction) {
    const language = getLanguage(interaction.guildId);
    if (!interaction.memberPermissions.has(permission)) return interaction.reply({ content: t(language, 'noPermission'), ephemeral: true });
    if (!interaction.guild.members.me.permissions.has(permission)) return interaction.reply({ content: t(language, 'botNoPermission'), ephemeral: true });
    const deleted = await interaction.channel.bulkDelete(interaction.options.getInteger('amount'), true);
    return interaction.reply({ content: t(language, 'clearDone', deleted.size), ephemeral: true });
  },
  async executeMessage(message, args) {
    const language = getLanguage(message.guildId);
    if (!message.member.permissions.has(permission)) return message.reply(t(language, 'noPermission'));
    if (!message.guild.members.me.permissions.has(permission)) return message.reply(t(language, 'botNoPermission'));
    const amount = Number(args[0]);
    if (!Number.isInteger(amount) || amount < 1 || amount > 100) return message.reply(t(language, 'invalidAmount'));
    const deleted = await message.channel.bulkDelete(amount + 1, true);
    const response = await message.channel.send(t(language, 'clearDone', Math.max(0, deleted.size - 1)));
    setTimeout(() => response.delete().catch(() => {}), 5000);
  }
};
