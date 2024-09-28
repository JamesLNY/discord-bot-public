const { SlashCommandBuilder } = require('discord.js')
const { Tags } = require('../../sequelize.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('prestige')
    .setDescription('Clears your progress for prestige'),
  
  async execute(interaction) {
    const tag = await Tags.findOne({where: {username: interaction.user.username}})
    let temp = tag.inventory, tempTwo = tag.levels, tempThree = tag.prestige
    let embed = {title: `${interaction.user.username}'s Prestige`}
    if (! Object.hasOwn(temp, "Rainbow Crystal") || temp["Rainbow Crystal"] < 10) {
      embed.description = "You do not have enough Rainbow Crystals (Need 10)"
    } else if (tempTwo.Global[0] < 100) {
      embed.description = "You need to be global level 100"
    } else {
      embed.description = "You have successfully prestiged"
      await Tags.destroy({where: {username: interaction.user.username}})
      await Tags.create({username: interaction.user.username})
      await Tags.update({prestige: tempThree + 1}, {where: {username: interaction.user.username}})
    }
    await interaction.reply({embeds: [embed]})
  }
}