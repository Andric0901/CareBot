const fs = require('fs');
const commandsList = fs.readFileSync('commands/help.txt', 'utf8');
const { Client, MessageEmbed } = require('discord.js');

module.exports = {
    name: 'help',
    description: "Displays this message!",
    async execute(client, message, args) {
        const embed = new MessageEmbed()
            .setTitle(':>')
            .setColor('#0099ff')
            .setDescription(commandsList)
            .setAuthor('CareBot', 'https://i.imgur.com/adMFcc1.png')
            .setThumbnail("https://i.imgur.com/adMFcc1.png")
        message.delete()
        message.author.send({ embeds: [embed] })
    }
}