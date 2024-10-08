const { Events } = require('discord.js')
const { Tags } = require('../sequelize.js')

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		Tags.sync()
		console.log(`Ready! Logged in as ${client.user.tag}`)
	}
}