const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { getLanguage, t } = require('../lib/language');

const configs = {
  ban: { permission: PermissionFlagsBits.BanMembers, description: 'Ban a member from the server', french: 'Bannit un membre du serveur' },
  kick: { permission: PermissionFlagsBits.KickMembers, description: 'Kick a member from the server', french: 'Expulse un membre du serveur' },
  timeout: { permission: PermissionFlagsBits.ModerateMembers, description: 'Temporarily timeout a member', french: 'Rend temporairement muet un membre' },
  warn: { permission: PermissionFlagsBits.ModerateMembers, description: 'Send a moderation warning to a member', french: 'Envoie un avertissement à un membre' }
};

function makeCommand(name) {
  const config = configs[name];
  const data = new SlashCommandBuilder()
    .setName(name)
    .setDescription(config.description)
    .setDefaultMemberPermissions(config.permission)
    .addUserOption((option) => option.setName('member').setDescription('Member to moderate').setRequired(true));

  if (name === 'timeout') {
    data.addIntegerOption((option) => option.setName('minutes').setDescription('Duration in minutes (1–40320)').setMinValue(1).setMaxValue(40320).setRequired(true));
  }
  data.addStringOption((option) => option.setName('reason').setDescription('Reason (optional)').setMaxLength(500));

  async function run({ guild, actor, target, reason, minutes, language, reply }) {
    if (!actor.permissions.has(config.permission)) return reply(t(language, 'noPermission'));
    if (!target) return reply(t(language, 'userNotFound'));

    // Warnings only send a DM; Discord role hierarchy does not apply to them.
    if (name !== 'warn') {
      const botMember = guild.members.me || await guild.members.fetchMe().catch(() => null);
      if (!botMember) return reply(t(language, 'botNoPermission'));

      const targetMember = await guild.members.fetch(target.id).catch(() => null);
      // A ban can also target a user who is not currently in the server.
      if (targetMember) {
        const actorIsOwner = guild.ownerId === actor.id;
        const actorCannotModerateTarget = !actorIsOwner && targetMember.roles.highest.comparePositionTo(actor.roles.highest) >= 0;
        if (actorCannotModerateTarget || !targetMember.manageable) {
          return reply(t(language, 'targetHigher'));
        }
      } else if (name !== 'ban') {
        return reply(t(language, 'userNotFound'));
      }

      const requiredBotPermission = {
        ban: PermissionFlagsBits.BanMembers,
        kick: PermissionFlagsBits.KickMembers,
        timeout: PermissionFlagsBits.ModerateMembers
      }[name];
      if (!botMember.permissions.has(requiredBotPermission)) return reply(t(language, 'botNoPermission'));
    }

    const auditReason = `${reason || 'No reason provided'} | Moderator: ${actor.user.tag}`;
    if (name === 'ban') await guild.members.ban(target.id, { reason: auditReason });
    if (name === 'kick') {
      const targetMember = await guild.members.fetch(target.id).catch(() => null);
      if (!targetMember) return reply(t(language, 'userNotFound'));
      await targetMember.kick(auditReason);
    }
    if (name === 'timeout') {
      const targetMember = await guild.members.fetch(target.id).catch(() => null);
      if (!targetMember) return reply(t(language, 'userNotFound'));
      await targetMember.timeout(minutes * 60 * 1000, auditReason);
    }
    if (name === 'warn') {
      const dmSent = await target.send(t(language, 'warnDm', guild.name, reason || t(language, 'done'))).then(() => true).catch(() => false);
      return reply(`${t(language, 'warnDone', `<@${target.id}>`, reason || t(language, 'done'))}${dmSent ? '' : t(language, 'dmFailed')}`);
    }
    const detail = name === 'timeout' ? ` ${t(language, 'duration')}: ${minutes} min.` : '';
    return reply(`${t(language, 'done')}${detail} ${t(language, 'reason')}: ${reason || '—'}`);
  }

  return {
    data,
    async execute(interaction) {
      const language = getLanguage(interaction.guildId);
      const target = interaction.options.getUser('member');
      // interaction.member can be a raw API object; fetch a full GuildMember before
      // reading roles or checking permissions so role hierarchy is evaluated reliably.
      const actor = await interaction.guild.members.fetch(interaction.user.id);
      await run({
        guild: interaction.guild,
        actor,
        target,
        reason: interaction.options.getString('reason'),
        minutes: interaction.options.getInteger('minutes'),
        language,
        reply: (content) => interaction.reply({ content, ephemeral: true })
      });
    },
    async executeMessage(message, args) {
      const language = getLanguage(message.guildId);
      const match = args[0]?.match(/^<@!?([0-9]+)>$/) || args[0]?.match(/^([0-9]{17,20})$/);
      if (name === 'timeout') {
        const memberId = args[0]?.match(/^<@!?([0-9]+)>$/)?.[1] || args[0];
        const minutes = Number(args[1]);
        const target = await message.client.users.fetch(memberId).catch(() => null);
        if (!Number.isInteger(minutes) || minutes < 1 || minutes > 40320) return message.reply('Duration must be between 1 and 40320 minutes.');
        return run({ guild: message.guild, actor: message.member, target, minutes, reason: args.slice(2).join(' '), language, reply: (content) => message.reply(content) });
      }
      const targetId = match?.[1] || match?.[0];
      const target = targetId ? await message.client.users.fetch(targetId).catch(() => null) : null;
      return run({ guild: message.guild, actor: message.member, target, reason: args.slice(1).join(' '), language, reply: (content) => message.reply(content) });
    }
  };
}

module.exports = { makeCommand };
