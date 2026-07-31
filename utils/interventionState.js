const activeInterventions = new Map();

function startIntervention(guildId, data) {
  activeInterventions.set(guildId, data);
}

function getIntervention(guildId) {
  return activeInterventions.get(guildId) || null;
}

function endIntervention(guildId) {
  activeInterventions.delete(guildId);
}

module.exports = {
  activeInterventions,
  startIntervention,
  getIntervention,
  endIntervention,
};
