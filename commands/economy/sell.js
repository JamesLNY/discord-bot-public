const { SlashCommandBuilder } = require('discord.js')
const items = require('../../dataSets/items.json')
const { Tags } = require('../../sequelize.js')
const { Levels } = require('../../modules/leveling.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sell')
    .setDescription('Sell an item for corns')
    .addStringOption(option =>
      option.setName('item')
        .setDescription('The item')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('quantity')
        .setDescription('The amount of the item you want to sell')
        .setRequired(true)),
  
  async execute(interaction) {
    const item = interaction.options.getString('item')
    const quantity = Number(interaction.options.getString('quantity'))
    const tag = await Tags.findOne({where: {username: interaction.user.username}})
    let embed = {title: `${interaction.user.username}'s Sale`};
    let temp = tag.inventory, tempTwo = tag.levels
    if (! Object.hasOwn(items, item)) {
      embed.description = "No such item exists"
    } else if (temp[item] < quantity) {
      embed.description = `You do not have that many \`${item}\` in your inventory`
    } else {
      let value = items[item].value * quantity * (1 + tempTwo.Trading[0] / 100)
      temp[item] -= quantity
      if (temp[item] == 0) {delete temp[item]}
      await Tags.update({inventory: temp, balance: tag.balance + value}, {where: {username: interaction.user.username}})
      embed.description = `You have sold ${quantity} \`${item}\` for ${value} coins`;
      Levels.addExperience("Trading", interaction.user.username)
    }
    await interaction.reply({embeds: [embed]})
  }
}