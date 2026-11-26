# Bot Discord Astra

Bot Discord en Node.js utilisant Discord.js v14.

## Installation locale

1. Installe Node.js 18 ou plus récent.
2. Installe les dépendances : `npm install`
3. Copie `.env.example` en `.env` puis renseigne :
   - `DISCORD_TOKEN` : token disponible dans **Developer Portal → ton application → Bot**
   - `CLIENT_ID` : Application ID disponible dans **General Information**
   - `COMMAND_PREFIX` (facultatif) : préfixe des commandes texte, `*` par défaut
4. Dans le **Discord Developer Portal → Bot → Privileged Gateway Intents**, active **Message Content Intent** pour autoriser les commandes avec préfixe.
5. Déploie les commandes slash : `npm run deploy`
6. Lance le bot : `npm start`

## Utiliser le bot dans Discord

Les commandes slash restent disponibles : `/ping`, `/aide` et `/dashboard`.

Les mêmes fonctions sont accessibles avec le préfixe `*` : `*ping`, `*aide` et `*dashboard`. La forme `*ma ping` (ainsi que `*ma aide` et `*ma dashboard`) fonctionne également.

`/dashboard` ou `*dashboard` affiche un tableau de bord interactif directement dans Discord, avec des boutons pour tester la latence et afficher l'aide.

## Hébergement 24/7

Le bot reste actif seulement tant que son processus tourne. Tu peux l’héberger sur un VPS (Railway, Fly.io, Render ou Oracle Free Tier). Ne mets jamais le token directement dans le dépôt. Sur l’hébergeur, ajoute les variables `DISCORD_TOKEN` et `CLIENT_ID` dans les paramètres secrets de l’application.

## Sécurité

Ne partage ni ne commite jamais `.env` ni ton token. Si un token a été publié, utilise **Reset Token** dans le Developer Portal.
