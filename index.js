require('dotenv').config();
const { Client, GatewayIntentBits, Partials } = require('discord.js');

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

client.once('ready', () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // 🔒 Vérification du rôle BPAE avant toute commande
  if (!interaction.member.roles.cache.has(BPAE_ROLE_ID)) {
    return interaction.reply({
      content: "❌ Tu n'as pas la permission d'utiliser cette commande.",
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

client.on('voiceStateUpdate', (oldState, newState) => {
  onVoiceStateUpdate(oldState, newState).catch((err) =>
    console.error('Erreur voiceStateUpdate (intervention) :', err)
  );
});

client.login(process.env.DISCORD_TOKEN);
