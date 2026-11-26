require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const { REST, Routes } = require('discord.js');

const commands = [];
const folder = path.join(__dirname, 'commands');

for (const file of fs.readdirSync(folder).filter((name) => name.endsWith('.js'))) {
  commands.push(require(path.join(folder, file)).data.toJSON());
}

if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID) {
  console.error('DISCORD_TOKEN ou CLIENT_ID est manquant dans .env');
  process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`Déploiement de ${commands.length} commande(s)...`);
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log('Commandes déployées avec succès.');
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
