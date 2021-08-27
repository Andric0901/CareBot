module.exports = (client) => {
    console.log('Hello world!')
    client.user.setActivity('-help <3', { type: 'PLAYING' })
}