const { SlashCommandBuilder, ComponentType, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { Tags } = require('../../sequelize.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('Shows your profile'),

  async execute(interaction) {
    const tag = await Tags.findOne({where: {username: interaction.user.username}})

    const pageOne = {
      title: `${interaction.user.username}'s Profile`,
      description: `Balance: ${tag.get('balance')}`,
      fields: []
    }
    const pageTwo = {
      title: `${interaction.user.username}'s Profile`,
      description: `Prestige: ${tag.get('prestige')}`,
      fields: []
    }

    let temp = tag.levels
    for (let key in temp) {
      pageOne.fields.push({name: key, value: `Level ${temp[key][0]} (${temp[key][1]} / 100)`})
    }
    temp = tag.equipment
    for (let key in temp) {
      pageTwo.fields.push({name: key, value: temp[key]})
    }
    temp = tag.stats
    for (let key in temp) {
      pageTwo.fields.push({name: key, value: temp[key]})
    }

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

		let response = await interaction.reply({embeds: [pageOne], components: [row]})
    const collector = response.createMessageComponentCollector({componentType: ComponentType.Button, time: 3_600_000})
    collector.on('collect', async interaction => {
      if (interaction.customId == "nextPage") {
        previousPage.setDisabled(false)
        nextPage.setDisabled(true)
        await interaction.update({embeds: [pageTwo], components: [row]})
      } else {
        previousPage.setDisabled(true)
        nextPage.setDisabled(false)
        await interaction.update({embeds: [pageOne], components: [row]})
      }
    })
  }
}