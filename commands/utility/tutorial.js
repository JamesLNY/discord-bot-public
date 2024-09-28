const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, ComponentType } = require('discord.js')
const pages = require('../../dataSets/tutorial.json')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tutorial')
    .setDescription('Shows you the tutorial'),

  async execute(interaction) {
		let page = 0
		const nextPage = new ButtonBuilder()
			.setCustomId('nextPage')
			.setLabel('Next Page')
			.setStyle(ButtonStyle.Primary)
		const previousPage = new ButtonBuilder()
			.setCustomId('previousPage')
			.setLabel('Previous Page')
			.setStyle(ButtonStyle.Primary)
			.setDisabled(true)
		const row = new ActionRowBuilder()
			.addComponents(previousPage, nextPage)
		
		let response = await interaction.reply({embeds: [pages[page]], components: [row]})
		const collector = response.createMessageComponentCollector({componentType: ComponentType.Button, time: 3_600_000})
		collector.on('collect', async interaction => {
			interaction.customId == "nextPage" ? page++ : page--
			nextPage.setDisabled(page == pages.length - 1)
			previousPage.setDisabled(page == 0)
			await interaction.update({embeds: [pages[page]], components: [row]})
		})
  }
}