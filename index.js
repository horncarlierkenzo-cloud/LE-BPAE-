require('dotenv').config();

const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');

const TOKEN = process.env.DISCORD_TOKEN;
const FORWARD_CHANNEL_ID = process.env.FORWARD_CHANNEL_ID;

if (!TOKEN || !FORWARD_CHANNEL_ID) {
  console.error(
    "Erreur: DISCORD_TOKEN et FORWARD_CHANNEL_ID doivent être définis dans le fichier .env"
  );
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel, Partials.Message],
});

client.once('ready', () => {
  console.log(`Connecté en tant que ${client.user.tag}`);
});

// ----- 1. Réception d'un MP -> transfert dans le salon du serveur -----
client.on('messageCreate', async (message) => {
  // On ignore les bots et tout message qui n'est pas un MP
  if (message.author.bot) return;
  if (message.guild) return; // ce n'est pas un MP

  try {
    const channel = await client.channels.fetch(FORWARD_CHANNEL_ID);
    if (!channel) {
      console.error('Salon de transfert introuvable.');
      return;
    }

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `${message.author.tag} (${message.author.id})`,
        iconURL: message.author.displayAvatarURL(),
      })
      .setDescription(message.content || '*[Aucun texte — pièce jointe uniquement]*')
      .setColor(0x5865f2)
      .setTimestamp(message.createdAt)
      .setFooter({ text: 'Message reçu en MP' });

    // Pièces jointes (images, fichiers...) éventuelles
    const files = [...message.attachments.values()].map((a) => a.url);
    if (files.length && !embed.data.image) {
      embed.setImage(files[0]);
    }

    const button = new ButtonBuilder()
      .setCustomId(`reply_${message.author.id}`)
      .setLabel('Répondre en MP')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    await channel.send({
      embeds: [embed],
      components: [row],
      files: files.slice(1), // pièces jointes supplémentaires en fichiers bruts
    });

    // Optionnel: accusé de réception à l'utilisateur
    // await message.reply("Ton message a bien été transmis, on te répond bientôt !");
  } catch (err) {
    console.error('Erreur lors du transfert du MP :', err);
  }
});

// ----- 2. Clic sur le bouton "Répondre en MP" -> ouverture d'un modal -----
client.on('interactionCreate', async (interaction) => {
  if (interaction.isButton() && interaction.customId.startsWith('reply_')) {
    const userId = interaction.customId.split('_')[1];

    const modal = new ModalBuilder()
      .setCustomId(`replyModal_${userId}`)
      .setTitle('Répondre à l\'utilisateur');

    const input = new TextInputBuilder()
      .setCustomId('replyContent')
      .setLabel('Ta réponse')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Écris ta réponse ici...')
      .setRequired(true)
      .setMaxLength(2000);

    const row = new ActionRowBuilder().addComponents(input);
    modal.addComponents(row);

    await interaction.showModal(modal);
    return;
  }

  // ----- 3. Soumission du modal -> envoi du MP à l'utilisateur -----
  if (interaction.isModalSubmit() && interaction.customId.startsWith('replyModal_')) {
    const userId = interaction.customId.split('_')[1];
    const content = interaction.fields.getTextInputValue('replyContent');

    try {
      const user = await client.users.fetch(userId);

      const embed = new EmbedBuilder()
        .setDescription(content)
        .setColor(0x57f287)
        .setFooter({ text: 'Réponse de l\'équipe' })
        .setTimestamp();

      await user.send({ embeds: [embed] });

      await interaction.reply({
        content: `✅ Réponse envoyée à **${user.tag}**.`,
        ephemeral: true,
      });

      // Trace de la réponse dans le salon d'origine
      if (interaction.channel) {
        await interaction.channel.send({
          embeds: [
            new EmbedBuilder()
              .setAuthor({
                name: `Réponse envoyée par ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL(),
              })
              .setDescription(content)
              .setColor(0x57f287)
              .setTimestamp(),
          ],
        });
      }
    } catch (err) {
      console.error('Erreur lors de l\'envoi de la réponse :', err);
      await interaction.reply({
        content:
          "❌ Impossible d'envoyer le MP (l'utilisateur a peut-être ses MP fermés, ou a quitté le serveur).",
        ephemeral: true,
      });
    }
  }
});

client.login(TOKEN);
