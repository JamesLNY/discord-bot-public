const { SlashCommandBuilder } = require('discord.js')
const armor = require('../../dataSets/armor.json')
const { Tags } = require('../../sequelize.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('equip')
    .setDescription('Equip an item')
    .addStringOption(option =>
      option.setName('item')
        .setDescription('The item')
        .setRequired(true)),
  
  async execute(interaction) {
    const item = interaction.options.getString('item')
    const tag = await Tags.findOne({where: {username: interaction.user.username}})
    let embed = {
      title: `${interaction.user.username}'s Equipment`,
      description: `You have equiped \`${item}\``
    }
    let temp = tag.inventory, tempTwo = tag.equipment, tempThree = tag.stats
    if (! Object.hasOwn(temp, item)) {
      embed.description = "You do not have this item"
    } else if (! Object.hasOwn(armor, item)) {
      embed.description = `You cannot equip this item`
    } else {
      if (tempTwo[armor[item].type] != "None") {tempThree[armor[item].stat] -= armor[tempTwo[armor[item].type]][armor[item].stat]}
      tempThree[armor[item].stat] += armor[item][armor[item].stat]
      tempTwo[armor[item].type] = item
    }
    await Tags.update({equipment: tempTwo, stats: tempThree}, {where: {username: interaction.user.username}})
    await interaction.reply({embeds: [embed]})
  }
}