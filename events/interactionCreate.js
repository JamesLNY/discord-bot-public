const { Events, Collection } = require('discord.js')
const { Levels } = require('../modules/leveling.js')
const { Tags } = require('../sequelize.js')
const tutorial = require('../commands/utility/tutorial.js')

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName)
      if (! command) {
        console.error(`No command matching ${interaction.commandName} was found.`)
        return
      }
      const { cooldowns } = interaction.client;
      if (! cooldowns.has(command.data.name)) {
        cooldowns.set(command.data.name, new Collection())
      }
      const now = Date.now()
      const timestamps = cooldowns.get(command.data.name)
      const defaultCooldownDuration = 0
      const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1_000
      if (timestamps.has(interaction.user.id)) {
        const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount
        if (now < expirationTime) {
          const expiredTimestamp = Math.round(expirationTime / 1_000)
          return interaction.reply({
            content: `Please wait, you are on a cooldown. You can use it again <t:${expiredTimestamp}:R>.`,
            ephemeral: true
          })
        }
      }
      timestamps.set(interaction.user.id, now)
      setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount)
      
      try {
        await Tags.create({username: interaction.user.username})
        await tutorial.execute(interaction)
      } catch (error) {
        try {
          await command.execute(interaction)
          if (Math.floor(Math.random() * 10) < 5) {
            await Levels.addExperience("Global", interaction.user.username)
          }
        } catch (error) {
          let embed = { content: 'There was an error while executing this command!', ephemeral: true }
          interaction.replied || interaction.deferred ? await interaction.followUp(embed) : await interaction.reply(embed)
        }
      }
    }
	}
}