const { SlashCommandBuilder } = require('discord.js')
const fish = require('../../dataSets/fish.json')
const { Tags } = require('../../sequelize.js')
const { Levels } = require('../../modules/leveling.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fish')
    .setDescription('Catch a random fish'),

  async execute(interaction) {
    const tag = await Tags.findOne({where: {username: interaction.user.username}})
    const acceptableLocations = ["River", "Shore", "Lake"]
    let embed = {title: `${interaction.user.username}'s Fishing Trip`}
    let temp = tag.inventory, tempTwo = tag.levels
    if (! acceptableLocations.includes(tag.location)) {
      embed.description = "You cannot fish in this location"
    } else if (! Object.hasOwn(temp, "Fishing Rod")) {
      embed.description = "You do not have a fishing rod"
    } else {
      let caughtFish = fish[tag.location][Math.floor(Math.random() * fish[tag.location].length)]
      Object.hasOwn(temp, caughtFish) ? temp[caughtFish]++ : temp[caughtFish] = 1
      embed.description = `You have caught 1 \`${caughtFish}\``
      if (Math.floor(Math.random() * 100) < 10 - tempTwo.Fishing[0]) {
        temp["Fishing Rod"] == 1 ? delete temp["Fishing Rod"] : temp["Fishing Rod"]--
        embed.description += ", but your fishing rod broke in the process"
      }
      await Tags.update({inventory: temp}, {where: {username: interaction.user.username}})
      Levels.addExperience("Fishing", interaction.user.username)
    }
		await interaction.reply({embeds: [embed]})
  }
}