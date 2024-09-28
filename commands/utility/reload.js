const { SlashCommandBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reload')
		.setDescription('Reloads a command.')
		.addStringOption(option =>
			option.setName('command')
				.setDescription('The command to reload.')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('category')
				.setDescription('Category of command.')
				.setRequired(true)),

	async execute(interaction) {
    const commandName = interaction.options.getString('command', true).toLowerCase()
		const category = interaction.options.getString('category', true).toLowerCase()
		const command = interaction.client.commands.get(commandName)
		const embed = {title: 'Reloading Command'}
		if (! command) {
			embed.description = `There is no command with name \`${commandName}\``
		} else {
			delete require.cache[require.resolve(`../${category}/${command.data.name}.js`)]
			try {
				const newCommand = require(`../${category}/${command.data.name}.js`)
				interaction.client.commands.set(newCommand.data.name, newCommand)
				embed.description = `Command \`${newCommand.data.name}\` was reloaded!`
			} catch (error) {
				embed.description = `There was an error while reloading a command \`${command.data.name}\`:\n\`${error.message}\``
			}
		}
		await interaction.reply({embeds: [embed]})
	}
}