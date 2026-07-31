require('dotenv').config();
const { Client, GatewayIntentBits, Partials, REST, Routes } = require('discord.js');

const { handleBpae } = require('./commands/bpaeCommand');
const { handleEnquete } = require('./commands/enqueteCommand');
const { handleIntervention, onVoiceStateUpdate } = require('./commands/interventionCommand');
const { handleFinIntervention } = require('./commands/finInterventionCommand');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
  ],
  partials: [Partials.Channel],
});

const BPAE_ROLE_ID = process.env.BPAE_ROLE_ID;
const MAIN_GUILD_ID = process.env.MAIN_GUILD_ID;

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

client.once('ready', () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);
});

// 🔄 Synchronise instantanément les commandes sur un serveur dès que le bot y est ajouté
// (évite d'attendre jusqu'à 1h de propagation globale)
client.on('guildCreate', async (guild) => {
  try {
    const commands = client.application.commands.cache.map((c) => c.toJSON());
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, guild.id),
      { body: commands },
    );
    console.log(`✅ Commandes synchronisées instantanément sur ${guild.name}`);
  } catch (err) {
    console.error(`Erreur sync commandes sur ${guild.name} :`, err);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // 🔒 Vérification du rôle BPAE dans le serveur PRINCIPAL, peu importe d'où vient la commande
  const hasPermission = await checkBpaeRole(interaction.user.id);

  if (!hasPermission) {
    return interaction.reply({
      content: "❌ Tu n'as pas la permission d'utiliser cette commande (rôle BPAE requis sur le serveur principal).",
      ephemeral: true,
    });
  }

  try {
    switch (interaction.commandName) {
      case 'bpae':
        await handleBpae(interaction);
        break;
      case 'enquete':
        await handleEnquete(interaction);
        break;
      case 'intervention':
        await handleIntervention(interaction);
        break;
      case 'fin-intervention':
        await handleFinIntervention(interaction);
        break;
      default:
        break;
    }
  } catch (error) {
    console.error(`Erreur sur la commande /${interaction.commandName} :`, error);
    const errorMessage = { content: "❌ Une erreur est survenue lors de l'exécution de la commande.", ephemeral: true };
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(errorMessage).catch(() => null);
    } else {
      await interaction.reply(errorMessage).catch(() => null);
    }
  }
});

// 🔎 Fonction qui va chercher le membre dans le serveur principal et vérifie son rôle
async function checkBpaeRole(userId) {
  try {
    const mainGuild = await client.guilds.fetch(MAIN_GUILD_ID);
    const member = await mainGuild.members.fetch(userId);
    return member.roles.cache.has(BPAE_ROLE_ID);
  } catch (error) {
    // L'utilisateur n'est pas membre du serveur principal, ou erreur de fetch
    return false;
  }
}

client.on('voiceStateUpdate', (oldState, newState) => {
  onVoiceStateUpdate(oldState, newState).catch((err) =>
    console.error('Erreur voiceStateUpdate (intervention) :', err)
  );
});

client.login(process.env.DISCORD_TOKEN);
