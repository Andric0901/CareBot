const { Client, Intents } = require('discord.js');

// new discord.js v13 update... makes things complicated :(
const myIntents = new Intents();
myIntents.add(
    Intents.FLAGS.GUILDS, 
    Intents.FLAGS.GUILD_MEMBERS, 
    Intents.FLAGS.GUILD_BANS, 
    Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS, 
    Intents.FLAGS.GUILD_INVITES, 
    Intents.FLAGS.GUILD_VOICE_STATES, 
    Intents.FLAGS.GUILD_MESSAGES, 
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS, 
    Intents.FLAGS.GUILD_MESSAGE_TYPING, 
    Intents.FLAGS.DIRECT_MESSAGES, 
    Intents.FLAGS.DIRECT_MESSAGE_REACTIONS, 
    Intents.FLAGS.DIRECT_MESSAGE_TYPING
);

const client = new Client({ intents: myIntents });
const config = require('./config.json');

client.once('ready', () => {
    console.log('Hello world!');
})

// Keep this at the end of the main.js file
client.login(config.token);