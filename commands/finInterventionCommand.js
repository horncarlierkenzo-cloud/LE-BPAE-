const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { getIntervention, endIntervention } = require('../utils/interventionState');

const commandsData = [
  new SlashCommandBuilder()
    .setName('fin-intervention')
    .setDescription("Termine l'intervention BPAE en cours sur ce serveur")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
];

async function handleFinIntervention(interaction) {
  const guild = interaction.guild;
  const state = getIntervention(guild.id);

  if (!state) {
    return interaction.reply({ content: "⚠️ Aucune intervention en cours sur ce serveur.", ephemeral: true });
  }

  await interaction.deferReply({ ephemeral: true });

  const voiceChannel = guild.channels.cache.get(state.voiceChannelId);
  if (voiceChannel) {
    for (const memberId of state.mutedMemberIds) {
      const member = voiceChannel.members.get(memberId);
      if (member) {
        await member.voice.setMute(false, "Fin de l'intervention BPAE").catch(() => null);
      }
    }
  }

  state.connection?.destroy?.();
  endIntervention(guild.id);

  const embed = new EmbedBuilder()
    .setColor(0x2ECC71)
    .setTitle('✅ Intervention BPAE terminée')
    .setTimestamp();
  await interaction.channel.send({ embeds: [embed] }).catch(() => null);

  return interaction.editReply({ content: '✅ Intervention terminée, tout le monde a été démute.' });
}

module.exports = { commandsData, handleFinIntervention };
