const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getLanguage, setLanguage, t } = require('../lib/language');

async function reply(interaction, content) {
  await interaction.reply({ content, ephemeral: true });
}

module.exports = {
  aliases: ['langue'],
  data: new SlashCommandBuilder()
    .setName('language')
    .setDescription('Set the language for this server')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((subcommand) => subcommand
      .setName('set')
      .setDescription('Choose French or English (UK)')
      .addStringOption((option) => option
        .setName('language')
        .setDescription('Language to use')
        .setRequired(true)
        .addChoices({ name: 'Français', value: 'fr' }, { name: 'English (UK)', value: 'en' })))
    .addSubcommand((subcommand) => subcommand
      .setName('show')
      .setDescription('Show the current server language')),
  async execute(interaction) {
    const before = getLanguage(interaction.guildId);
    const subcommand = interaction.options.getSubcommand();
    if (subcommand === 'set') {
      const language = interaction.options.getString('language');
      setLanguage(interaction.guildId, language);
      return reply(interaction, t(language, 'setLanguage'));
    }
    return reply(interaction, t(before, 'currentLanguage'));
  },
  async executeMessage(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply(t(getLanguage(message.guildId), 'noPermission'));
    }
    const language = args[0]?.toLowerCase();
    if (['fr', 'français', 'francais'].includes(language)) {
      setLanguage(message.guildId, 'fr');
      return message.reply(t('fr', 'setLanguage'));
    }
    if (['en', 'english', 'anglais', 'gb'].includes(language)) {
      setLanguage(message.guildId, 'en');
      return message.reply(t('en', 'setLanguage'));
    }
    return message.reply(`${t(getLanguage(message.guildId), 'currentLanguage')} ${t(getLanguage(message.guildId), 'chooseLanguage')}`);
  }
};
