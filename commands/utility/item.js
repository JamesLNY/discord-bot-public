const { SlashCommandBuilder } = require('discord.js')
const items = require('../../dataSets/items.json')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('item')
    .setDescription('Gives more information about an item')
    .addStringOption(option =>
      option.setName('item')
        .setDescription('The item')
        .setRequired(true)),
  
  async execute(interaction) {
    const item = interaction.options.getString('item')
    const embed = {title: `${item}`}
    if (! Object.hasOwn(items, item)) {
      embed.description = "No such item exists"
    } else {
      embed.fields = [{
        name: `Value:`,
        value: items[item].value
      }, {
        name: `Category:`,
        value: items[item].category
      }]
    }
    await interaction.reply({embeds: [embed]})
  }
}