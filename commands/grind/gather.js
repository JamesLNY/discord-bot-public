const { SlashCommandBuilder } = require('discord.js')
const gather = require('../../dataSets/gather.json')
const { Tags } = require('../../sequelize.js')
const { Levels } = require('../../modules/leveling.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('gather')
    .setDescription('Gathers some random items'),

  async execute(interaction) {
    const tag = await Tags.findOne({where: {username: interaction.user.username}})
    let temp = tag.inventory, tempTwo = tag.levels
    let random = Math.floor(Math.random() * 100)
    if (random > 30 + tempTwo.Gathering[0]) {
      random = "Common"
    } else if (random > 1 + tempTwo.Gathering[0]) {
      random = "Rare"
    } else {
      random = "Legendary"
    }
    let item = gather[random][Math.floor(Math.random() * gather[random].length)]
    Object.hasOwn(temp, item) ? temp[item]++ : temp[item] = 1
    Levels.addExperience("Gathering", interaction.user.username)
    await Tags.update({inventory: temp}, {where: {username: interaction.user.username}})
    const embed = {
      title: `${interaction.user.username}'s Gathering Trip`,
      description: `You have gathered 1 \'${item}\'`
    }
		await interaction.reply({embeds: [embed]})
  }
}