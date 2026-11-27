# Bot Discord Astra

Bot Discord Node.js avec commandes simples, modération, tickets privés, anti-raid et rôle automatique.

## Installation

1. Node.js 18+ puis `npm install`.
2. Copie `.env.example` vers `.env`, renseigne `DISCORD_TOKEN` et `CLIENT_ID`.
3. Active **Message Content Intent** et **Server Members Intent** dans Discord Developer Portal → Bot pour les commandes préfixées et les actions à l’arrivée.
4. Lance `npm run deploy` pour publier les commandes slash, puis `npm start`.
5. Donne au bot **Manage Roles** et place son rôle au-dessus du rôle automatique choisi. Pour l’anti-raid, donne-lui aussi **Moderate Members**.

Les commandes préfixées utilisent `*ma` (ex. `*ma aide`). Les commandes slash restent disponibles. Les réponses et l’aide suivent la langue choisie avec `*ma language en` ou `*ma language fr` (permission **Manage Server**).

## Rôle automatique

Un administrateur configure le rôle qui sera attribué aux nouveaux membres : `*ma autorole set @Membre`. Vérifie-le avec `*ma autorole show` et désactive-le avec `*ma autorole off`. Équivalents slash : `/autorole set`, `/autorole show`, `/autorole off`. L’attribution concerne les nouveaux membres qui rejoignent après la configuration ; le bot ne modifie pas rétroactivement les rôles des membres existants.

## Anti-raid

`*ma antiraid on` active la protection, `*ma antiraid off` la désactive et `*ma antiraid status` affiche son état. Le seuil se règle avec `*ma antiraid config 8 10` (8 arrivées en 10 secondes). Lorsqu’un seuil est atteint, le dernier compte arrivé reçoit un timeout temporaire de 15 minutes. Ces commandes demandent **Manage Server**.

## Tickets et modération

Configure le panneau avec `/ticket setup`, puis utilise `*ma ticket create` ou `*ma ticket close`. Modération : `*ma ban`, `*ma kick`, `*ma timeout`, `*ma clear`, `*ma warn` (les permissions requises restent nécessaires).

Ne publie jamais ton token ni le fichier `.env`. Si un token a été exposé, réinitialise-le dans le Developer Portal.
