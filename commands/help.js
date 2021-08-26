const fs = require('fs');
const commandsList = fs.readFileSync('commands/help.txt', 'utf8');
const { Client, MessageEmbed } = require('discord.js');

module.exports = {
    name: 'help',
    description: "Displays this message!",
    execute(message){
        const embed = new MessageEmbed()
            .setTitle('Commands:')
            .setColor('#0099ff')
            .setDescription(commandsList)
            .setAuthor('CareBot', 'https://i.imgur.com/adMFcc1.png')
            .setThumbnail("https://i.imgur.com/adMFcc1.png")
            message.channel.send('Check your inbox!').then(sentMessage =>{
                sentMessage.delete({ timeout: 20000 }).catch(console.error);
            })
            message.author.send(embed)
    }
}