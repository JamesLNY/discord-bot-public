const { SlashCommandBuilder } = require('discord.js')
const { Tags } = require('../../sequelize.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Redeem some coins'),

  async execute(interaction) {
    const date = new Date().toISOString().substring(0, 10);
    const tag = await Tags.findOne({where: {username: interaction.user.username}})
    const embed = {
      title: `${interaction.user.username}'s Daily Coins`,
      description: `You have obtained 10000 coins`
    }
    if (tag.dailyCooldown != date) {
      await Tags.update({dailyCooldown: date, balance: tag.balance + 10000}, {where: {username: interaction.user.username}})
    } else {
      embed.description = `You have already obtained your daily coins today`
    }
    await interaction.reply({embeds: [embed]})
  }
}