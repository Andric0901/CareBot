const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json');

client.once('ready', () => {
    console.log('Hello world!');
})

// Keep this at the end of the main.js file
client.login(config.token);