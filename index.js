require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, Events } = require('discord.js');
const { getLanguage, t } = require('./lib/language');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
for (const file of fs.readdirSync(commandsPath).filter((name) => name.endsWith('.js'))) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.data.name, command);
  for (const alias of command.aliases || []) client.commands.set(alias, command);
}

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Bot connecté en tant que ${readyClient.user.tag}`);
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot || !message.guild) return;
  const prefix = process.env.COMMAND_PREFIX || '*';
  if (!message.content.startsWith(prefix)) return;
  let input = message.content.slice(prefix.length).trim();
  if (/^ma\s/i.test(input)) input = input.replace(/^ma\s+/i, '');
  const [commandName, ...args] = input.split(/\s+/);
  if (!commandName) return;
  const command = client.commands.get(commandName.toLowerCase());
  if (!command || typeof command.executeMessage !== 'function') {
    return message.reply(`Commande inconnue. Essaie \`${prefix}ma aide\` ou \`${prefix}dashboard\`.`);
  }
  try {
    await command.executeMessage(message, args);
  } catch (error) {
    console.error(error);
    await message.reply('Une erreur est survenue pendant cette commande.');
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isButton()) {
    const language = getLanguage(interaction.guildId);
    try {
      if (interaction.customId === 'dashboard:ping') {
        await interaction.reply({ content: t(language, 'pong', Math.round(client.ws.ping)), ephemeral: true });
      } else if (interaction.customId === 'dashboard:help') {
        await interaction.reply({ content: t(language, 'help'), ephemeral: true });
      }
    } catch (error) {
      console.error(error);
      if (!interaction.replied && !interaction.deferred) await interaction.reply({ content: 'Une erreur est survenue.', ephemeral: true });
    }
    return;
  }
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    const response = { content: 'Une erreur est survenue.', ephemeral: true };
    if (interaction.replied || interaction.deferred) await interaction.followUp(response);
    else await interaction.reply(response);
  }
});

if (!process.env.DISCORD_TOKEN) {
  console.error('DISCORD_TOKEN est manquant. Copie .env.example vers .env.');
  process.exit(1);
}
client.login(process.env.DISCORD_TOKEN);
