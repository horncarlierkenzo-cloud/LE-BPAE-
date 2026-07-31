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

client.once('ready', () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

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
