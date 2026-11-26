# Bot Discord Astra

Bot Discord en Node.js utilisant Discord.js v14.

## Installation locale

1. Installe Node.js 18 ou plus récent.
2. Installe les dépendances : `npm install`
3. Copie `.env.example` en `.env` puis renseigne `DISCORD_TOKEN`, `CLIENT_ID` et éventuellement `COMMAND_PREFIX` (par défaut `*`).
4. Dans Discord Developer Portal → **Bot → Privileged Gateway Intents**, active **Message Content Intent** pour les commandes avec préfixe.
5. Déploie les commandes slash : `npm run deploy`, puis démarre avec `npm start`.

## Langue

La langue se règle par serveur avec `/language set` puis `Français` ou `English (UK)`. La commande demande la permission **Manage Server**. Avec le préfixe : `*ma langue fr` ou `*ma langue en`. Le réglage est enregistré localement dans `data/guild-settings.json` ; pour plusieurs instances, utilise un stockage partagé.

## Commandes

Commandes générales : `/ping`, `/aide`, `/dashboard`. Les commandes de modération sont `/ban`, `/kick`, `/timeout`, `/clear` et `/warn`. Elles sont également accessibles avec le préfixe : `*ma ban @membre raison`, `*ma kick @membre raison`, `*ma timeout @membre 10 raison`, `*ma clear 10`, `*ma warn @membre raison`.

Chaque commande de modération vérifie les permissions requises. Donne au bot uniquement les permissions nécessaires, place son rôle au-dessus des rôles qu’il doit modérer, et garde les permissions de modération réservées aux personnes de confiance. `/dashboard` affiche un aperçu interactif dans Discord.

## Hébergement 24/7

Le bot reste actif seulement tant que son processus tourne. Tu peux l’héberger sur un VPS ou une plateforme d’hébergement. Ne mets jamais le token directement dans le dépôt ; ajoute `DISCORD_TOKEN` et `CLIENT_ID` comme variables secrètes. Sauvegarde aussi `data/guild-settings.json` pour conserver les préférences de langue.

## Sécurité

Ne partage ni ne commite jamais `.env` ni ton token. Si un token a été publié, réinitialise-le dans le Developer Portal.
