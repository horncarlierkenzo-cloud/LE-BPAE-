require('dotenv').config();
const { REST, Routes } = require('discord.js');

const { commandsData: bpaeCommands } = require('./commands/bpaeCommand');
const { commandsData: enqueteCommands } = require('./commands/enqueteCommand');
const { commandsData: interventionCommands } = require('./commands/interventionCommand');
const { commandsData: finInterventionCommands } = require('./commands/finInterventionCommand');

const allCommands = [
  ...bpaeCommands,
  ...enqueteCommands,
  ...interventionCommands,
  ...finInterventionCommands,
].map((cmd) => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`Déploiement global de ${allCommands.length} commande(s)...`);
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: allCommands },
    );
    console.log('✅ Commandes déployées globalement (disponibles sur tous les serveurs).');
  } catch (error) {
    console.error('❌ Erreur lors du déploiement des commandes :', error);
  }
})();
