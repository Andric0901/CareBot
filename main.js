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

const { MessageEmbed } = require('discord.js');

client.on('messageCreate', async message => {
    if (!message.content.startsWith(config.prefix) || message.author.bot) return;
    const args = message.content.slice(config.prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'sleep') {
        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Make sure to sleep!')
            .setDescription('Your body wants it :>');

        await message.channel.send({ embeds: [embed] })
    }

    if (command === 'init') {
        message.delete()
        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Sample message!')
            .setDescription('Good night!!! :>')
            
        const sentMessage = await message.channel.send({ embeds: [embed] })

        sentMessage.react('✅').then(() => sentMessage.react('❌'))

        sentMessage.awaitReactions((r) => ['✅', '❌'].includes(r.emoji.name), {max: 1})
        .then(collected => {
            console.log(user.id)
            let r = collected.first()
            console.log(r)
            if (r.emoji.name =='✅') {
                console.log(r.emoji.name)
                const checkmarkEmbed = new MessageEmbed()
                .setTitle("Test Checkmark Embed")
                .setDescription("Test that the checkmark embed went through")
            
                message.channel.send({ embeds: [checkmarkEmbed]})
                sentMessage.edit(checkmarkEmbed)
            }
            else if (r.emoji.name == '❌') {
                console.log(r.emoji.name)
                const crossEmbed = new MessageEmbed()
                .setTitle("Test Cross Embed")
                .setDescription("Test that the cross embed went through")
            
                message.channel.send({ embeds: [crossEmbed]})
                sentMessage.edit(crossEmbed)
            }
        })
    }
});



// Keep this at the end of the main.js file
client.login(config.token);
