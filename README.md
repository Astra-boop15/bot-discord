# Bot Discord Astra

Bot Discord en Node.js utilisant Discord.js v14.

## Installation locale

1. Installe Node.js 18 ou plus récent.
2. Installe les dépendances : `npm install`
3. Copie `.env.example` en `.env` puis renseigne :
   - `DISCORD_TOKEN` : token disponible dans **Developer Portal → ton application → Bot**
   - `CLIENT_ID` : Application ID disponible dans **General Information**
4. Déploie les commandes : `npm run deploy`
5. Lance le bot : `npm start`

## Hébergement 24/7

Le bot reste actif seulement tant que son processus tourne. Tu peux l’héberger sur un VPS (Railway, Fly.io, Render ou Oracle Free Tier). Ne mets jamais le token directement dans le dépôt. Sur l’hébergeur, ajoute les variables `DISCORD_TOKEN` et `CLIENT_ID` dans les paramètres secrets de l’application.

## Sécurité

Ne partage ni ne commite jamais `.env` ni ton token. Si un token a été publié, utilise **Reset Token** dans le Developer Portal.
