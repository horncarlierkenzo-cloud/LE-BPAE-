require('dotenv').config();
const { REST, Routes } = require('discord.js');
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

client.once('ready', async () => {
  console.log(`Connecté en tant que ${client.user.tag}`);
  const guilds = await client.guilds.fetch();

  for (const [guildId, guildPreview] of guilds) {
    try {
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId),
        { body: [] },
      );
      console.log(`🧹 Commandes de guilde supprimées sur ${guildPreview.name} (${guildId})`);
    } catch (err) {
      console.error(`❌ Erreur sur la guilde ${guildId} :`, err.message);
    }
  }

  console.log('✅ Nettoyage terminé. Seules les commandes globales restent actives.');
  process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
