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

client.on('guildCreate', async (guild) => {
  console.log(`➕ Bot ajouté sur ${guild.name} — les commandes globales seront visibles sous quelques minutes (jusqu'à 1h).`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

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

async function checkBpaeRole(userId) {
  try {
    const mainGuild = await client.guilds.fetch(MAIN_GUILD_ID);
    const member = await mainGuild.members.fetch(userId);
    return member.roles.cache.has(BPAE_ROLE_ID);
  } catch (error) {
    console.error('❌ Erreur checkBpaeRole:', error);
    return false;
  }
}

client.on('voiceStateUpdate', (oldState, newState) => {
  onVoiceStateUpdate(oldState, newState).catch((err) =>
    console.error('Erreur voiceStateUpdate (intervention) :', err)
  );
});

client.login(process.env.DISCORD_TOKEN);
