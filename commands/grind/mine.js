const { SlashCommandBuilder } = require('discord.js')
const { Tags } = require('../../sequelize.js')
const { Levels } = require('../../modules/leveling.js')
const mine = require('../../dataSets/mine.json')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mine')
    .setDescription('Go mining'),
  
  async execute(interaction) {
    const tag = await Tags.findOne({where: {username: interaction.user.username}})
    let temp = tag.inventory, tempTwo = tag.levels
    let embed = {title: `${interaction.user.username}'s Mining Trip`}
    if (tag.location != "Mountain") {
      embed.description = "You cannot mine in this location"
    } else if (! Object.hasOwn(temp, "Pickaxe")) {
      embed.description = "You do not have a pickaxe"
    } else {
      let ore = mine[Math.floor(Math.random() * tempTwo.Mining[0] / 20)][Math.floor(Math.random() * 2)]
      embed.description = `You have obtained 1 ${ore}`
      Object.hasOwn(temp, ore) ? temp[ore]++ : temp[ore] = 1
      if (Math.floor(Math.random() * 100) < 40) {
        temp["Pickaxe"] == 1 ? delete temp["Pickaxe"] : temp["Pickaxe"]--
        embed.description += ", but your pickaxe broke in the process"
      }
      await Tags.update({inventory: temp}, {where: {username: interaction.user.username}})
      Levels.addExperience("Mining", interaction.user.username)
    }
    await interaction.reply({embeds: [embed]})
  }
}