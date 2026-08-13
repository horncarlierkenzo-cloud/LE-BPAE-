const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } = require('discord.js');
const path = require('path');
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  entersState,
  VoiceConnectionStatus,
} = require('@discordjs/voice');
const { startIntervention, getIntervention } = require('../utils/interventionState');

const commandsData = [
  new SlashCommandBuilder()
    .setName('intervention')
    .setDescription('Démarre une intervention BPAE sur un membre')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((opt) =>
      opt.setName('membre').setDescription('Le membre concerné').setRequired(true)
    )
    .addChannelOption((opt) =>
      opt
        .setName('salon')
        .setDescription("Le salon vocal de l'intervention")
        .addChannelTypes(ChannelType.GuildVoice)
        .setRequired(true)
    )
    .addBooleanOption((opt) =>
      opt.setName('obligatoire').setDescription('La présence des autres membres est-elle obligatoire ?').setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName('audio_url').setDescription("URL du fichier audio joué à l'arrivée du chef").setRequired(false)
    ),
];

async function handleIntervention(interaction) {
  const guild = interaction.guild;
  const target = interaction.options.getMember('membre');
  const voiceChannel = interaction.options.getChannel('salon');
  const obligatoire = interaction.options.getBoolean('obligatoire');
  const audioUrl = interaction.options.getString('audio_url');

  if (getIntervention(guild.id)) {
    return interaction.reply({ content: '⚠️ Une intervention est déjà en cours sur ce serveur.', ephemeral: true });
  }

  await interaction.deferReply({ ephemeral: true });

  if (target.voice?.channel) {
    await target.voice.setChannel(voiceChannel).catch(() => null);
  }

  const staffRoleId = process.env.STAFF_ROLE_ID;
  const staffRole = staffRoleId ? guild.roles.cache.get(staffRoleId) : null;
  if (staffRole) {
    for (const [, staffMember] of staffRole.members) {
      staffMember
        .send(
          `🚨 Intervention BPAE démarrée sur **${guild.name}** concernant **${target.user.tag}**, dans le salon **${voiceChannel.name}**.`
        )
        .catch(() => null);
    }
  }

  const embed = new EmbedBuilder()
    .setColor(0xE74C3C)
    .setTitle('🚨 Intervention BPAE en cours')
    .setDescription(
      `Une intervention est en cours dans **${voiceChannel.name}**.\n` +
        `Présence des membres : **${obligatoire ? 'Obligatoire' : 'Facultative'}**`
    )
    .setTimestamp();

  const videoPath = path.join(__dirname, '..', 'assets', 'videos', 'intervention.mp4');

  await interaction.channel
    .send({
      embeds: [embed],
      files: [{ attachment: videoPath, name: 'intervention.mp4' }],
    })
    .catch((err) => console.error('Erreur envoi vidéo intervention :', err));

  const bpaeRoleId = process.env.BPAE_ROLE_ID;
  const mutedMemberIds = [];
  for (const [, member] of voiceChannel.members) {
    const hasBpaeRole = bpaeRoleId && member.roles.cache.has(bpaeRoleId);
    if (!hasBpaeRole && !member.voice.serverMute) {
      await member.voice.setMute(true, 'Intervention BPAE en cours').catch(() => null);
      mutedMemberIds.push(member.id);
    }
  }

  const connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: guild.id,
    adapterCreator: guild.voiceAdapterCreator,
    selfDeaf: false,
  });

  try {
    await entersState(connection, VoiceConnectionStatus.Ready, 10_000);
  } catch {
    // connexion échouée, on continue quand même
  }

  startIntervention(guild.id, {
    targetId: target.id,
    voiceChannelId: voiceChannel.id,
    obligatoire,
    audioUrl: audioUrl || null,
    mutedMemberIds,
    connection,
    audioPlayed: false,
  });

  return interaction.editReply({ content: `✅ Intervention démarrée dans ${voiceChannel}.` });
}

async function onVoiceStateUpdate(oldState, newState) {
  const guildId = newState.guild.id;
  const state = getIntervention(guildId);
  if (!state || state.audioPlayed) return;
  if (newState.channelId !== state.voiceChannelId) return;

  const staffRoleId = process.env.STAFF_ROLE_ID;
  const member = newState.member;
  const isChef = staffRoleId && member.roles.cache.has(staffRoleId);
  if (!isChef || !state.audioUrl) return;

  try {
    const player = createAudioPlayer();
    const resource = createAudioResource(state.audioUrl);
    state.connection.subscribe(player);
    player.play(resource);
    state.audioPlayed = true;
  } catch {
    // lecture impossible, on ignore
  }
}

module.exports = { commandsData, handleIntervention, onVoiceStateUpdate };
