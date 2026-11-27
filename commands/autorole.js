const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const { getLanguage, t } = require('../lib/language');

const settingsPath = path.join(__dirname, '..', 'data', 'auto-role.json');
function readSettings() {
  try { return JSON.parse(fs.readFileSync(settingsPath, 'utf8')); }
  catch (error) {
    if (error.code !== 'ENOENT') console.error('Could not read automatic role settings:', error);
    return {};
  }
}
function saveSettings(settings) {
  fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
  fs.writeFileSync(settingsPath, `${JSON.stringify(settings, null, 2)}\n`);
}
function getConfiguredRoleId(guildId) {
  return readSettings()[guildId] || null;
}

async function configure({ guild, actorPermissions, action, role, reply, language }) {
  if (!actorPermissions?.has(PermissionFlagsBits.ManageRoles)) return reply(t(language, 'noPermission'));
  const settings = readSettings();
  const currentRoleId = settings[guild.id];

  if (action === 'show') {
    if (!currentRoleId) return reply(t(language, 'autoRoleNone'));
    const currentRole = await guild.roles.fetch(currentRoleId).catch(() => null);
    if (!currentRole) {
      delete settings[guild.id];
      saveSettings(settings);
      return reply(t(language, 'autoRoleNone'));
    }
    return reply(t(language, 'autoRoleCurrent', currentRole));
  }
  if (action === 'off') {
    delete settings[guild.id];
    saveSettings(settings);
    return reply(t(language, 'autoRoleOff'));
  }
  if (action !== 'set' || !role) return reply(t(language, 'autoRoleUsage'));

  const botMember = guild.members.me || await guild.members.fetchMe().catch(() => null);
  if (!botMember?.permissions.has(PermissionFlagsBits.ManageRoles) || role.managed || role.position >= botMember.roles.highest.position) {
    return reply(t(language, 'autoRoleHierarchy'));
  }
  settings[guild.id] = role.id;
  saveSettings(settings);
  return reply(t(language, 'autoRoleSet', role));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('autorole')
    .setDescription('Configure the role automatically given to new members')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommand((subcommand) => subcommand.setName('set').setDescription('Select the automatic member role')
      .addRoleOption((option) => option.setName('role').setDescription('Role to give to new members').setRequired(true)))
    .addSubcommand((subcommand) => subcommand.setName('show').setDescription('Show the configured automatic role'))
    .addSubcommand((subcommand) => subcommand.setName('off').setDescription('Disable automatic role assignment')),
  async execute(interaction) {
    const language = getLanguage(interaction.guildId);
    const action = interaction.options.getSubcommand();
    return configure({
      guild: interaction.guild,
      actorPermissions: interaction.memberPermissions,
      action,
      role: action === 'set' ? interaction.options.getRole('role') : null,
      language,
      reply: (content) => interaction.reply({ content, ephemeral: true })
    });
  },
  async executeMessage(message, args) {
    const language = getLanguage(message.guildId);
    const action = (args[0] || '').toLowerCase();
    let role = null;
    if (action === 'set') {
      const roleId = args[1]?.match(/^<@&(\d{17,20})>$/)?.[1] || args[1]?.match(/^(\d{17,20})$/)?.[1];
      if (roleId) role = await message.guild.roles.fetch(roleId).catch(() => null);
      if (!role) return message.reply(t(language, 'autoRoleInvalid'));
    }
    return configure({
      guild: message.guild,
      actorPermissions: message.member.permissions,
      action,
      role,
      language,
      reply: (content) => message.reply(content)
    });
  },
  getConfiguredRoleId
};
