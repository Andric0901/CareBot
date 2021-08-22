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

    const okEmbedFields = { name: 'Type \'ok\'', value: 'To continue', inline: true }
    const yesEmbedFields = { name: "Type 'yes'", value: "Yes!", inline: true }
    const noEmbedFields = { name: "Type 'no'", value: "No :(", inline: true }
    const stopEmbedFields = { name: "Type 'stop'", value: "To stop anytime", inline: true }

    if (command === 'init') {
        message.delete()

        let embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Welcome!')
            .setDescription('CareBot is a simple discord bot that can help you with your self-care routine. Let\'s get started!')
            .addFields(okEmbedFields, stopEmbedFields)

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

                let timeoutID;

                // 20 seconds for testing purposes, TODO: we should change this to something like 10 minutes
                var inactivityCooldown = 1000 * 20;

                timeoutID = setTimeout(() => {
                    userStopped = !userStopped
                    channel.delete().catch()
                }, inactivityCooldown)

                let expectingYes = false;
                let expectingNo = false;
                let expectingOK = true;

                collector.on('collect', msg => {
                    let randomInteger1 = getRndInteger(0, randomTitles.length)
                    let randomInteger2 = getRndInteger(0, randomDescriptions.length)

                    if (!msg.author.bot && !userStopped) {
                        msg.delete().catch()
                        clearTimeout(timeoutID)
                        timeoutID = setTimeout(() => {
                            userStopped = !userStopped
                            channel.delete().catch()
                        }, inactivityCooldown)
                    }
                    if ((msg.content.toLowerCase() == "y" || msg.content.toLowerCase() == "yes") 
                    && !userStopped && expectingYes) {
                        embed = new MessageEmbed()
                            .setColor('#0099ff')
                            .setTitle("I am now expecting 'ok' or 'stop'")
                            .setDescription("I edited this embed after being called by a 'yes' message!")
                            .setFields(okEmbedFields, stopEmbedFields)
                        sentMessage.edit({ embeds: [embed] })
                        clearTimeout(timeoutID)

                        expectingYes = false
                        expectingNo = false
                        expectingOK = true

                        timeoutID = setTimeout(() => {
                            userStopped = !userStopped
                            channel.delete().catch()
                        }, inactivityCooldown)
                    } else if ((msg.content.toLowerCase() == 'n' || msg.content.toLowerCase() == 'no') 
                    && !userStopped && expectingNo) {
                        embed = new MessageEmbed()
                            .setColor('#0099ff')
                            .setTitle("I am now expecting 'ok' or 'stop'")
                            .setDescription("I edited this embed after being called by a 'no' message!")
                            .setFields(okEmbedFields, stopEmbedFields)
                        sentMessage.edit({ embeds: [embed] })

                        expectingYes = false
                        expectingNo = false
                        expectingOK = true

                        clearTimeout(timeoutID)
                        timeoutID = setTimeout(() => {
                            userStopped = !userStopped
                            channel.delete().catch()
                        }, inactivityCooldown)
                    } else if (msg.content.toLowerCase() == 'ok' && !userStopped && expectingOK) {
                        embed = new MessageEmbed()
                            .setColor('#0099ff')
                            .setTitle("I am now expecting 'yes', 'no' or 'stop'")
                            .setDescription("I edited this embed after being called by an 'ok' message!")
                            .setFields(yesEmbedFields, noEmbedFields, stopEmbedFields)
                        sentMessage.edit({ embeds: [embed] })

                        expectingYes = true
                        expectingNo = true
                        expectingOK = false
                        
                        clearTimeout(timeoutID)
                        timeoutID = setTimeout(() => {
                            userStopped = !userStopped
                            channel.delete().catch()
                        }, inactivityCooldown)
                    } else if (msg.content.toLowerCase() == 'stop' && !userStopped) {
                        userStopped = !userStopped
                        clearTimeout(timeoutID)
                        embed = new MessageEmbed()
                            .setColor('#0099ff')
                            .setTitle("Thank you for using CareBot!")
                            .setDescription("Have a wonderful day/night!! You are amazing :)")
                        sentMessage.edit({ embeds: [embed] }).then(() => {
                            setTimeout(() => {
                                channel.delete().catch()
                            }, 10000)
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

function resetTimeout(timeoutID, channel, userStopped) {

}

// Keep this at the end of the main.js file
client.login(config.token);
