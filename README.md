# Bot Discord Astra

Bot Discord Node.js avec commandes simples, modération et tickets privés.

## Installation

1. Node.js 18+ puis `npm install`.
2. Copie `.env.example` vers `.env`, renseigne `DISCORD_TOKEN` et `CLIENT_ID`.
3. Active **Message Content Intent** dans Discord Developer Portal → Bot pour les commandes `*`.
4. Lance `npm run deploy` pour publier les commandes slash, puis `npm start`.

## Tableau de bord interactif

Utilise `/dashboard` ou `*ma dashboard`. Le menu déroulant affiche les commandes classées par catégorie : général, modération, tickets et configuration. Les boutons permettent de tester le bot et de créer un ticket. L’interface est intégrée à Discord ; elle ne nécessite pas de site web.

## Tickets

Un administrateur configure le panneau avec `/ticket setup`, choisit le salon public et peut sélectionner une catégorie de tickets et un rôle support. Les membres cliquent ensuite sur **Créer un ticket**. Les salons créés sont privés pour le créateur, le bot et le rôle support ; le créateur ou le staff peut fermer un ticket avec le bouton ou `/ticket close`. Un membre ne peut avoir qu’un ticket ouvert à la fois.

`/ticket create` ouvre aussi directement un ticket. En préfixe : `*ma ticket create` et `*ma ticket close`.

Le bot a besoin des permissions **Manage Channels**, **View Channels**, **Send Messages** et **Read Message History**. Configure également les permissions du rôle support dans le serveur. Les paramètres des tickets sont stockés localement dans `data/ticket-settings.json` ; sauvegarde ce fichier et utilise un stockage partagé si le bot tourne sur plusieurs instances.

## Langue et modération

Utilise `/language set` pour choisir Français ou English (UK). Commandes de modération : `/ban`, `/kick`, `/timeout`, `/clear`, `/warn`.

Ne publie jamais ton token ni le fichier `.env`. Si un token a été exposé, réinitialise-le dans le Developer Portal.
