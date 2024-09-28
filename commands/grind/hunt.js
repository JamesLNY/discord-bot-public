const { SlashCommandBuilder } = require('discord.js')
const hunt = require('../../dataSets/hunt.json')
const { Tags } = require('../../sequelize.js')
const { Levels } = require('../../modules/leveling.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hunt')
    .setDescription('Hunt for some animals'),

  async execute(interaction) {
    const tag = await Tags.findOne({where: {username: interaction.user.username}})
    const acceptableLocations = ["River", "Forest", "Plains"]
    let embed = {title: `${interaction.user.username}'s Hunting Trip`}
    let temp = tag.inventory, tempTwo = tag.levels
    if (! acceptableLocations.includes(tag.location)) {
      embed.description = "You cannot hunt in this location"
    } else if (! Object.hasOwn(temp, "Rifle")) {
      embed.description = "You do not have a rifle"
    } else {
      let random = Math.floor(Math.random() * 100)
      if (random > 30 + tempTwo.Hunting[0]) {
        random = "Common"
      } else if (random > 1 + tempTwo.Hunting[0]) {
        random = "Rare"
      } else {
        random = "Legendary"
      }
      let item = hunt[random][Math.floor(Math.random() * hunt[random].length)]
      embed.description = `You have killed 1 \'${item}\'`
      Object.hasOwn(temp, item) ? temp[item]++ : temp[item] = 1
      if (Math.floor(Math.random() * 100) < 10 - tempTwo.Hunting[0]) {
        temp["Rifle"] == 1 ? delete temp["Rifle"] : temp["Rifle"]--
        embed.description += ", but your rifle broke in the process"
      }
      await Tags.update({inventory: temp}, {where: {username: interaction.user.username}})
      Levels.addExperience("Hunting", interaction.user.username)
    }
		await interaction.reply({embeds: [embed]})
  }
}