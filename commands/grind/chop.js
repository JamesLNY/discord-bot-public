const { SlashCommandBuilder } = require('discord.js')
const { Tags } = require('../../sequelize.js')
const { Levels } = require('../../modules/leveling.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('chop')
    .setDescription('Cut down a tree'),

  async execute(interaction) {
    const tag = await Tags.findOne({where: {username: interaction.user.username}})
    let temp = tag.inventory, tempTwo = tag.levels
    let embed = {title: `${interaction.user.username}'s Chopping Trip`}
    if (tag.location != "Forest") {
      embed.description = "You cannot chop in this location"
    } else if (! Object.hasOwn(temp, "Axe")) {
      embed.description = "You do not have an axe"
    } else {
      let quantity = Math.floor(Math.random() * 10) + tempTwo.Chopping[0]
      embed.description = `You have cut down a tree to obtain ${quantity} logs`
      Object.hasOwn(temp, "Log") ? temp["Log"] += quantity : temp["Log"] = quantity
      if (Math.floor(Math.random() * 100) < 40) {
        temp["Axe"] == 1 ? delete temp["Axe"] : temp["Axe"]--
        embed.description += ", but your axe broke in the process"
      }
      await Tags.update({inventory: temp}, {where: {username: interaction.user.username}})
      Levels.addExperience("Chopping", interaction.user.username)
    }
		await interaction.reply({embeds: [embed]})
  }
}