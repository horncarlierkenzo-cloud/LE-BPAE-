const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { getMemberFile } = require('../utils/storage');

const commandsData = [
  new SlashCommandBuilder()
    .setName('enquete')
    .setDescription("Affiche le dossier d'un membre (bans/kicks/avertissements connus)")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((opt) =>
      opt.setName('membre').setDescription('Le membre à enquêter').setRequired(true)
    ),
];

async function handleEnquete(interaction) {
  const targetUser = interaction.options.getUser('membre');
  const dossier = getMemberFile(targetUser.id);
  const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

  const embed = new EmbedBuilder()
    .setColor(0x3498DB)
    .setTitle(`🔎 Dossier de ${targetUser.tag}`)
    .setThumbnail(targetUser.displayAvatarURL())
    .addFields(
      {
        name: 'Compte créé le',
        value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:D>`,
        inline: true,
      },
      {
        name: 'A rejoint ce serveur le',
        value: member
          ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>`
          : 'Non présent sur ce serveur',
        inline: true,
      },
      {
        name: `Bans connus (${dossier.bans.length})`,
        value: dossier.bans.length
          ? dossier.bans.map((b) => `• ${b.guildName || 'Serveur inconnu'} — ${b.reason || 'aucune raison'}`).join('\n')
          : 'Aucun',
      },
      {
        name: `Kicks connus (${dossier.kicks.length})`,
        value: dossier.kicks.length
          ? dossier.kicks.map((k) => `• ${k.guildName || 'Serveur inconnu'} — ${k.reason || 'aucune raison'}`).join('\n')
          : 'Aucun',
      },
      {
        name: `Avertissements (${dossier.warnings.length})`,
        value: dossier.warnings.length
          ? dossier.warnings.map((w) => `• ${w.reason || 'aucune raison'}`).join('\n')
          : 'Aucun',
      }
    )
    .setFooter({ text: 'Les bans/kicks affichés sont ceux connus par ce bot, sur les serveurs où il est présent.' })
    .setTimestamp();

  return interaction.reply({ embeds: [embed] });
}

module.exports = { commandsData, handleEnquete };
