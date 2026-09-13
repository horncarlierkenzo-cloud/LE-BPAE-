# Bot Modmail Discord

Transfère les MP reçus par le bot vers un salon du serveur, avec un bouton pour y répondre directement.

## Installation

1. Installer Node.js (v18 ou plus).
2. Dans ce dossier, lancer :
   ```
   npm install
   ```
3. Copier `.env.example` en `.env` et remplir :
   - `DISCORD_TOKEN` : le token de ton bot (Discord Developer Portal > ton appli > Bot > Reset Token)
   - `FORWARD_CHANNEL_ID` : l'ID du salon du serveur où les MP doivent apparaître

4. Sur le [Discord Developer Portal](https://discord.com/developers/applications), dans **Bot** :
   - Active **Message Content Intent**
   - Active **Server Members Intent** (pas obligatoire mais utile)

5. Inviter le bot sur ton serveur avec les permissions :
   - Voir le salon choisi
   - Envoyer des messages
   - Intégrer des liens (embeds)

6. Lancer le bot :
   ```
   npm start
   ```

## Fonctionnement

- Un utilisateur envoie un MP au bot → le message apparaît dans le salon configuré (embed + bouton "Répondre en MP").
- Un membre du staff clique sur le bouton → une fenêtre s'ouvre pour écrire la réponse.
- La réponse est envoyée en MP à l'utilisateur, et une trace est postée dans le salon.

## Personnalisation possible

- Changer les couleurs des embeds (`setColor`)
- Ajouter un système de tickets (un salon par utilisateur au lieu d'un salon unique)
- Restreindre le bouton à un rôle précis (vérifier `interaction.member.roles`)
- Ajouter un accusé de réception automatique à l'utilisateur
