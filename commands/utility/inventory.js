const { SlashCommandBuilder, ComponentType, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js')
const { Tags } = require('../../sequelize.js')

function showPage(number, inventory, interaction) {
  const embed = {
    title: `${interaction.user.username}'s Inventory`,
    fields: []
  }
  for (let i = number * 20; i < (number + 1) * 20 && i < Object.keys(inventory).length; i++) {
    embed.fields.push({name: `${Object.keys(inventory)[i]}`, value: `${inventory[Object.keys(inventory)[i]]}`})
  }
  return embed
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('Shows your inventory'),
  
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
    
    const tag = await Tags.findOne({where: {username: interaction.user.username}})
    let newPage = showPage(page, tag.inventory, interaction)
    if (newPage.fields.length < 20) {nextPage.setDisabled(true)}
    const response = await interaction.reply({embeds: [newPage], components: [row]})
    const collector = response.createMessageComponentCollector({componentType: ComponentType.Button, time: 3_600_000})
    collector.on('collect', async interaction => {
      if (interaction.customId == "nextPage") {
        page++
        previousPage.setDisabled(false)
      } else {
        page--
        nextPage.setDisabled(false)
      }
      newPage = showPage(page, tag.inventory, interaction)
      if (newPage.fields.length < 20) {nextPage.setDisabled(true)}
      if (page == 0) {previousPage.setDisabled(true)}
      await interaction.update({embeds: [newPage], components: [row]})
    })
  }
}