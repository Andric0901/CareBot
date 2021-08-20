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
});

const { MessageEmbed, MessageCollector } = require('discord.js');

client.on('messageCreate', async message => {
    if (!message.content.startsWith(config.prefix) || message.author.bot) return;
    const args = message.content.slice(config.prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'sleep') {
        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Make sure to sleep!')
            .setDescription('Your body wants it :>');

        message.channel.send({ embeds: [embed] })
    }

    if (command === 'init') {
        message.delete()

        let embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Sample message!')
            .setDescription('Good night!!! :> Press \'y\' to edit this message')

        message.guild.channels.create(message.author.username, {
            type: 'text',
            permissionOverwrites: [
                {
                    id: message.guild.id, // shortcut for @everyone role ID
                    deny: 'VIEW_CHANNEL'
                },
                {
                    id: message.author.id,
                    allow: 'VIEW_CHANNEL'
                }
            ]
        })
            .then(async channel => {
                const sentMessage = await channel.send({ embeds: [embed] })

                const collector = new MessageCollector(channel, m => m.author.id === message.author.id);
                let userStopped = false;
                const randomTitles = ['Random #1', 'Random #2', 'Random #3', 'Random #4']
                const randomDescriptions = ['Description #1', 'Description #2', 'Description #3', 'Description #4']

                collector.on('collect', msg => {
                    if (!msg.author.bot && !userStopped) {
                        msg.delete().catch(console.error())
                    }
                    if (msg.content.toLowerCase() == "y" && !userStopped) {
                        let randomInteger1 = getRndInteger(0, randomTitles.length)
                        let randomInteger2 = getRndInteger(0, randomDescriptions.length)
                        embed = new MessageEmbed()
                            .setColor('#0099ff')
                            .setTitle(randomTitles[randomInteger1])
                            .setDescription(randomDescriptions[randomInteger2])
                        sentMessage.edit({ embeds: [embed] })
                    } else if (msg.content.toLowerCase() == 'stop' && !userStopped) {
                        userStopped = !userStopped
                        msg.channel.send('Thank you for using CareBot! I hope you have a wonderful day :)').then(endMessage => {
                            setTimeout(() => {
                                endMessage.delete().catch(console.error())
                            }, 10000);
                            setTimeout(() => {
                                channel.delete().catch(console.error())
                            }, 11000);
                        })
                    }
                })
            })
    }
});

// returns a random integer, min inclusive and max exclusive
function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

// Keep this at the end of the main.js file
client.login(config.token);
