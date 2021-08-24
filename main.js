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

const fs = require('fs')
let jsonQuestions = fs.readFileSync('questions.json')
let jsonAnswers = fs.readFileSync('answers.json')
const questions = JSON.parse(jsonQuestions)
const answers = JSON.parse(jsonAnswers)

// questionsKeys and answersKeys are arrays that contain keys for the corresponding json files (sleep, water, etc.)
let questionsKeys = []
let answersKeys = []

// randomizedIndexArray is an array containing all the valid indexes, randomized
let randomizedIndexArray = []
for (var i = 0; i < Object.keys(questions).length; i++) {
    randomizedIndexArray.push(i)
}

// setup the two key variables above after the arrays are emptied out
setupKeys(questions, answers, questionsKeys, answersKeys)

// console.log(questions[questionsKeys[0]]) // { titles: [...], descriptions: [...] }
// console.log(answers[answersKeys[0]]) // { yes: [...], no: [...] }

const { MessageEmbed, MessageCollector } = require('discord.js');

client.on('messageCreate', async message => {
    if (!message.content.startsWith(config.prefix) || message.author.bot) return;
    const args = message.content.slice(config.prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    const okEmbedFields = { name: 'Type \'ok\'', value: 'To continue', inline: true }
    const yesEmbedFields = { name: "Type 'yes'", value: "Yes!", inline: true }
    const noEmbedFields = { name: "Type 'no'", value: "No :(", inline: true }
    const stopEmbedFields = { name: "Type 'stop'", value: "To stop anytime", inline: true }

    if (command === 'init') {
        message.delete().catch()
        shuffle(randomizedIndexArray)

        var userIDObject = JSON.parse(fs.readFileSync('userID.json'))
        var userID = message.author.id;
        userIDObject[userID] = randomizedIndexArray
        fs.writeFileSync('userID.json', JSON.stringify(userIDObject));
        // console.log(JSON.parse(fs.readFileSync('userID.json')))
        // userID.json contains the js object that maps from user ID to the user-specific random index array (used 
        // to randomize the embeds). TODO: read the file, store the randomized index array somewhere, and use that 
        // to actually randomize the embeds.
        let jsonUserID = fs.readFileSync('userID.json')
        const userIDs = JSON.parse(jsonUserID)
        let userSpecificRandomArray;
        for (var key in userIDs) {
            if (userIDs.hasOwnProperty(key) && message.author.id === key) {
                userSpecificRandomArray = userIDs[key]
                break
            }
        }

        let embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Welcome!')
            .setDescription('CareBot is a simple discord bot that can help you with your self-care routine. Let\'s get started!\n\u200B')
            .addFields(okEmbedFields, stopEmbedFields)
            .setAuthor('CareBot', 'https://i.imgur.com/adMFcc1.png')
            .setThumbnail("https://i.imgur.com/adMFcc1.png")

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

                let currentIndex = 0

                const yesTitles = [':)', ":>", "Great!", "Excellent!", "You are amazing :)", "Yes!", "🥳"]
                const noTitles = [":(", ":<", ";-;", "Nooooooooo :(", "Oh no ;-;", "😢", "😭"]

                collector.on('collect', msg => {
                    // console.log(questions[questionsKeys[4]]) // { titles: [...], descriptions: [...] }
                    // console.log(answers[answersKeys[4]]) // { yes: [...], no: [...] }
                    if (!msg.author.bot && !userStopped && msg.content.toLowerCase() != "-init") {
                        msg.delete().catch()
                        clearTimeout(timeoutID)
                        timeoutID = setTimeout(() => {
                            userStopped = !userStopped
                            channel.delete().catch()
                        }, inactivityCooldown)
                    }
                    if ((msg.content.toLowerCase() == "y" || msg.content.toLowerCase() == "yes")
                        && !userStopped && expectingYes) {
                        let randomIndex = userSpecificRandomArray[currentIndex]
                        let descriptions = answers[answersKeys[randomIndex]].yes

                        const randomTitle = yesTitles[getRndInteger(0, noTitles.length)]
                        const randomDescription = descriptions[getRndInteger(0, descriptions.length)]

                        // console.log(randomTitle)
                        // console.log(randomDescription)

                        embed = new MessageEmbed()
                            .setColor('#0099ff')
                            .setTitle(randomTitle)
                            .setDescription(randomDescription + "\n\u200B")
                            .setFields(okEmbedFields, stopEmbedFields)
                            .setAuthor('CareBot', 'https://i.imgur.com/adMFcc1.png')
                            .setThumbnail("https://i.imgur.com/adMFcc1.png")
                        sentMessage.edit({ embeds: [embed] })
                        clearTimeout(timeoutID)

                        expectingYes = false
                        expectingNo = false
                        expectingOK = true

                        timeoutID = setTimeout(() => {
                            userStopped = !userStopped
                            channel.delete().catch()
                        }, inactivityCooldown)

                        if (currentIndex === userSpecificRandomArray.length - 1) {
                            currentIndex = 0
                        } else {
                            currentIndex++
                        }
                    } else if ((msg.content.toLowerCase() == 'n' || msg.content.toLowerCase() == 'no')
                        && !userStopped && expectingNo) {
                        let randomIndex = userSpecificRandomArray[currentIndex]
                        let descriptions = answers[answersKeys[randomIndex]].no

                        const randomTitle = noTitles[getRndInteger(0, noTitles.length)]
                        const randomDescription = descriptions[getRndInteger(0, descriptions.length)]

                        // console.log(randomTitle)
                        // console.log(randomDescription)

                        embed = new MessageEmbed()
                            .setColor('#0099ff')
                            .setTitle(randomTitle)
                            .setDescription(randomDescription + "\n\u200B")
                            .setFields(okEmbedFields, stopEmbedFields)
                            .setAuthor('CareBot', 'https://i.imgur.com/adMFcc1.png')
                            .setThumbnail("https://i.imgur.com/adMFcc1.png")
                        sentMessage.edit({ embeds: [embed] })

                        expectingYes = false
                        expectingNo = false
                        expectingOK = true

                        clearTimeout(timeoutID)
                        timeoutID = setTimeout(() => {
                            userStopped = !userStopped
                            channel.delete().catch()
                        }, inactivityCooldown)

                        if (currentIndex === userSpecificRandomArray.length - 1) {
                            currentIndex = 0
                        } else {
                            currentIndex++
                        }
                    } else if (msg.content.toLowerCase() == 'ok' && !userStopped && expectingOK) {
                        let randomIndex = userSpecificRandomArray[currentIndex]
                        let titles = questions[questionsKeys[randomIndex]].titles
                        let descriptions = questions[questionsKeys[randomIndex]].descriptions

                        const randomTitle = titles[getRndInteger(0, titles.length)]
                        const randomDescription = descriptions[getRndInteger(0, descriptions.length)]

                        // console.log(randomTitle)
                        // console.log(randomDescription)

                        embed = new MessageEmbed()
                            .setColor('#0099ff')
                            .setTitle(randomTitle)
                            .setDescription(randomDescription + "\n\u200B")
                            .setFields(yesEmbedFields, noEmbedFields, stopEmbedFields)
                            .setAuthor('CareBot', 'https://i.imgur.com/adMFcc1.png')
                            .setThumbnail("https://i.imgur.com/adMFcc1.png")
                        sentMessage.edit({ embeds: [embed] })

                        expectingYes = true
                        expectingNo = true
                        expectingOK = false

                        clearTimeout(timeoutID)
                        timeoutID = setTimeout(() => {
                            userStopped = !userStopped
                            channel.delete().catch()
                        }, inactivityCooldown)

                        // if (currentIndex === userSpecificRandomArray.length - 1) {
                        //     currentIndex = 0
                        // } else {
                        //     currentIndex++
                        // }
                    } else if (msg.content.toLowerCase() == 'stop' && !userStopped) {
                        userStopped = !userStopped
                        clearTimeout(timeoutID)
                        embed = new MessageEmbed()
                            .setColor('#0099ff')
                            .setTitle("Thank you for using CareBot!")
                            .setDescription("Have a wonderful day/night!! You are amazing :)")
                            .setAuthor('CareBot', 'https://i.imgur.com/adMFcc1.png')
                            .setThumbnail("https://i.imgur.com/adMFcc1.png")
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

function setupKeys(questions, answers, questionsKeys, answersKeys) {
    for (var key in questions) {
        if (questions.hasOwnProperty(key)) {
            questionsKeys.push(key)
        }
    }

    for (var key in answers) {
        if (answers.hasOwnProperty(key)) {
            answersKeys.push(key)
        }
    }
}

function shuffle(array) {
    var currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}


// Keep this at the end of the main.js file
client.login(config.token);
