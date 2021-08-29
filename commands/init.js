const fs = require('fs')
const { MessageEmbed, MessageCollector } = require('discord.js');

module.exports = {
    name: "init",
    description: "Initiate conversation with CareBot",
    async execute(client, message, args) {
        let jsonQuestions = fs.readFileSync('data/questions.json')
        let jsonAnswers = fs.readFileSync('data/answers.json')
        const questions = JSON.parse(jsonQuestions)
        const answers = JSON.parse(jsonAnswers)

        const notAllowedMessages = ['-init', '-help']

        // questionsKeys and answersKeys are arrays that contain keys for the corresponding json files (sleep, water, etc.)
        let questionsKeys = []
        let answersKeys = []

        // randomizedIndexArray is an array containing all the valid indexes, randomized
        // Take the keys from the questions array (being the indices) and append then to the rand index array
        let randomizedIndexArray = []
        for (let i = 0; i < Object.keys(questions).length; i++) {
            randomizedIndexArray.push(i)
        }

        // setup the two key variables above
        setupKeys(questions, answers, questionsKeys, answersKeys)

        // Set up the different embeds that will be used
        const okEmbedFields = { name: 'Type \'ok\'', value: 'To continue', inline: true }
        const yesEmbedFields = { name: "Type 'yes'", value: "Yes!", inline: true }
        const noEmbedFields = { name: "Type 'no'", value: "No :(", inline: true }
        const stopEmbedFields = { name: "Type 'stop'", value: "To stop anytime", inline: true }

        message.delete().catch()
        shuffle(randomizedIndexArray)

        // Grab the user's id from the message and put it into the userID object with the randomized array
        let userIDObject = JSON.parse(fs.readFileSync('data/userID.json'))
        let userID = message.author.id;
        userIDObject[userID] = randomizedIndexArray
        // After modifying that user's array content, write the entire JSON back into the userID json
        // userID.json contains the js object that maps from user ID to user-specific random index array (used to randomize the embeds).
        fs.writeFileSync('data/userID.json', JSON.stringify(userIDObject));
        
        let userSpecificRandomArray = randomizedIndexArray;

        // Set up the introductory embed
        let embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Welcome!')
            .setDescription('CareBot is a simple discord bot that can help you with your self-care routine. Let\'s get started!\n\u200B')
            .addFields(okEmbedFields, stopEmbedFields)
            .setAuthor('CareBot', 'https://i.imgur.com/adMFcc1.png')
            .setThumbnail("https://i.imgur.com/adMFcc1.png")

        // Create a new channel that only the author and admins can see
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

                let inactivityCooldown = 1000 * 60 * 10;

                // Once user is inactive for 10 minutes, channel will auto-delete

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
                    // If a user sends a message and the message doesn't contain the init command, reset the timeout
                    if (!msg.author.bot && !userStopped && !notAllowedMessages.includes(msg.content.toLowerCase())) {
                        msg.delete().catch()
                        clearTimeout(timeoutID)
                        timeoutID = setTimeout(() => {
                            userStopped = !userStopped
                            channel.delete().catch()
                        }, inactivityCooldown)
                    }

                    let randomIndex = userSpecificRandomArray[currentIndex]
                    let randomTitle;
                    let randomDescription;

                    if (msg.content.toLowerCase() !== "stop" || userStopped) {
                        
                        if ((msg.content.toLowerCase() === "y" || msg.content.toLowerCase() === "yes")
                        && !userStopped && expectingYes) {
                            // Fetch random title and category from json
                        
                            let descriptions = answers[answersKeys[randomIndex]]['yes']

                            randomTitle = yesTitles[getRndInteger(0, yesTitles.length)]
                            randomDescription = descriptions[getRndInteger(0, descriptions.length)]

                            embed = new MessageEmbed()
                                .setColor('#0099ff')
                                .setTitle(randomTitle)
                                .setDescription(randomDescription + "\n\u200B")
                                .setFields(okEmbedFields, stopEmbedFields)
                                .setAuthor('CareBot', 'https://i.imgur.com/adMFcc1.png')
                                .setThumbnail("https://i.imgur.com/adMFcc1.png")

                            expectingYes = false
                            expectingNo = false
                            expectingOK = true

                            // Once we reach the end of the array, reset the current index
                            if (currentIndex === userSpecificRandomArray.length - 1) {
                                currentIndex = 0
                            } else {
                                currentIndex++
                            }

                        } else if ((msg.content.toLowerCase() === 'n' || msg.content.toLowerCase() === 'no')
                        && !userStopped && expectingNo) {

                            let descriptions = answers[answersKeys[randomIndex]]['no']

                            randomTitle = noTitles[getRndInteger(0, noTitles.length)]
                            randomDescription = descriptions[getRndInteger(0, descriptions.length)]

                            embed = new MessageEmbed()
                                .setColor('#0099ff')
                                .setTitle(randomTitle)
                                .setDescription(randomDescription + "\n\u200B")
                                .setFields(okEmbedFields, stopEmbedFields)
                                .setAuthor('CareBot', 'https://i.imgur.com/adMFcc1.png')
                                .setThumbnail("https://i.imgur.com/adMFcc1.png")

                            expectingYes = false
                            expectingNo = false
                            expectingOK = true

                            // Once we reach the end of the array, reset the current index
                            if (currentIndex === userSpecificRandomArray.length - 1) {
                                currentIndex = 0
                            } else {
                                currentIndex++
                            }

                        } else if (msg.content.toLowerCase() === 'ok' && !userStopped && expectingOK) {
                        
                            let titles = questions[questionsKeys[randomIndex]].titles
                            let descriptions = questions[questionsKeys[randomIndex]].descriptions
    
                            randomTitle = titles[getRndInteger(0, titles.length)]
                            randomDescription = descriptions[getRndInteger(0, descriptions.length)]
    
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

                        }

                        clearTimeout(timeoutID)
                        timeoutID = setTimeout(() => {
                            userStopped = !userStopped
                            channel.delete().catch()
                        }, inactivityCooldown)


                        sentMessage.edit({ embeds: [embed] })  
                    } else {
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
            
        // returns a random integer, min inclusive and max exclusive
        function getRndInteger(min, max) {
            return Math.floor(Math.random() * (max - min)) + min;
        }

        function setupKeys(questions, answers, questionsKeys, answersKeys) {
            for (let key in questions) {
                if (questions.hasOwnProperty(key)) {
                    questionsKeys.push(key)
                }
            }

            for (let key in answers) {
                if (answers.hasOwnProperty(key)) {
                    answersKeys.push(key)
                }
            }
        }

        function shuffle(array) {
            let currentIndex = array.length, randomIndex;

            // While there remain elements to shuffle...
            while (currentIndex !== 0) {

                // Pick a remaining element...
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex--;

                // And swap it with the current element.
                [array[currentIndex], array[randomIndex]] = [
                    array[randomIndex], array[currentIndex]];
            }

            return array;
        }
    }
}