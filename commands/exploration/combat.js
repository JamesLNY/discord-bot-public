const { SlashCommandBuilder } = require('discord.js')
const { Tags } = require('../../sequelize.js')
const mobs = require('../../dataSets/mobs.json')
const wait = require('node:timers/promises').setTimeout;

module.exports = {
  cooldown: 3600,
  data: new SlashCommandBuilder()
    .setName('combat')
    .setDescription('Fight a random monster'),

  async execute(interaction) {
    const tag = await Tags.findOne({where: {username: interaction.user.username}})
    let mob = Math.floor(Math.random() * 100)
    if (mob > 30) {
      mob = "easy"
    } else if (mob > 1) {
      mob = "moderate"
    } else {
      mob = "hard"
    }
    mob = mobs[mob][Math.floor(Math.random() * mobs[mob].length)]
    let temp = tag.inventory, tempTwo = tag.stats
    const embed = {
      title: `${interaction.user.username}'s Combat`,
      fields: [
        {name: "Player", value: ``, inline: true},
        {name: mob.name, value: ``, inline: true}
      ]
    }
    for (const key in mob.stats) {
      embed.fields[1].value += `${key}: ${mob.stats[key]} \n`
    }
    for (const key in tempTwo) {
      embed.fields[0].value += `${key}: ${tempTwo[key]} \n`
    }
		await interaction.reply({embeds: [embed]})
    while (tempTwo.Health > 0 && mob.stats.Health > 0) {
      embed.fields[1].value = ""
      embed.fields[0].value = ""
      mob.stats.Health -= tempTwo.Attack - mob.stats.Defense
      tempTwo.Health -= mob.stats.Attack - tempTwo.Defense
      for (const key in mob.stats) {
        embed.fields[1].value += `${key}: ${mob.stats[key]} \n`
      }
      for (const key in tempTwo) {
        embed.fields[0].value += `${key}: ${tempTwo[key]} \n`
      }
      await wait(1_000)
		  await interaction.editReply({embeds: [embed]})
    }
    embed.fields = []
    if (tempTwo.Health > 0) {
      const item = mob.loot[Math.floor(Math.random() * mob.loot.length)]
      Object.hasOwn(temp, item) ? temp[item]++ : temp[item] = 1
      embed.description = `You have defeated 1 ${mob.name} to obtain 1 ${item}`
      await Tags.update({inventory: temp}, {where: {username: interaction.user.username}}) 
    } else {
      embed.description = `You have been defeated`
    }
    await interaction.editReply({embeds: [embed]})
  }
}