const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { getGuildConfig, setGuildConfig } = require('../utils/storage');

const commandsData = [
  new SlashCommandBuilder()
    .setName('bpae')
    .setDescription('Active ou désactive le mode BPAE sur ce serveur')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addSubcommand((sub) =>
      sub.setName('activer').setDescription('Active le mode BPAE et annonce sa présence')
    )
    .addSubcommand((sub) =>
      sub.setName('desactiver').setDescription('Désactive le mode BPAE')
    ),
];

async function handleBpae(interaction) {
  const sub = interaction.options.getSubcommand();
  const guildId = interaction.guild.id;
  const announceChannelId = process.env.ANNOUNCE_CHANNEL_ID;

  if (sub === 'activer') {
    setGuildConfig(guildId, { bpaeActive: true });

    const embed = new EmbedBuilder()
      .setColor(0xE74C3C)
      .setTitle('🚨 BPAE en service')
      .setDescription('Le BPAE est actuellement présent et actif sur ce serveur.')
      .setTimestamp();

    const announceChannel = announceChannelId
      ? interaction.guild.channels.cache.get(announceChannelId)
      : interaction.channel;

    if (announceChannel) {
      await announceChannel.send({ embeds: [embed] });
    }

    return interaction.reply({ content: '✅ Mode BPAE activé.', ephemeral: true });
  }

  if (sub === 'desactiver') {
    setGuildConfig(guildId, { bpaeActive: false });
    return interaction.reply({ content: '✅ Mode BPAE désactivé.', ephemeral: true });
  }
}

module.exports = { commandsData, handleBpae };
