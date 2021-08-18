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
const prefix = '-'

client.once('ready', () => {
    console.log('Hello world!');
});

const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

client.on('messageCreate', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'sleep') {
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('primary')
                    .setLabel('Sleep!')
                    .setStyle('PRIMARY'),
            );

        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Make sure to sleep!')
            .setDescription('Your body wants it :>');

        message.channel.send({ content: "hello world!", components: [row], embeds: [embed] })
    }
});


// Keep this at the end of the main.js file
client.login(config.token);
