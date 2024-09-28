const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder, ComponentType } = require('discord.js')
const seeds = require('../../dataSets/seeds.json')
const { Tags } = require('../../sequelize.js')

async function updateSeeds(interaction) {
  const tag = await Tags.findOne({where: {username: interaction.user.username}})
  const embed = {
    title: `${interaction.user.username}'s Farm`,
    fields: []
  }
  const select = new StringSelectMenuBuilder()
    .setCustomId('seed')
    .setPlaceholder('Select the seed you want to plant')
  let temp = tag.inventory, tempTwo = tag.farm
  for (let i = 0; i < tempTwo.length; i++) {
    let yield = seeds[tempTwo[i][0]].yield, quantity = seeds[tempTwo[i][0]].quantity
    if (tempTwo[i][1] < Date.now()) {
      tempTwo.splice(i, 1)
      Object.hasOwn(temp, yield) ? temp[yield] += quantity : temp[yield] = quantity
    } else {
      embed.fields.push({name: tempTwo[i][0], value: `<t:${Math.round(tempTwo[i][1] / 1_000)}:R>`})
    }
  }
  await Tags.update({inventory: temp, farm: tempTwo}, {where: {username: interaction.user.username}})
  if (tempTwo.length < 9) {
    for (let seed in seeds) {
      if (Object.keys(temp).includes(seed)) {
        select.addOptions(new StringSelectMenuOptionBuilder()
          .setLabel(`${seed} (${temp[seed]})`)
          .setValue(seed))
      }
    }
    const row = new ActionRowBuilder()
      .addComponents(select)
    if (select.options.length >= 1) {
      return {embeds: [embed], components: [row]}
    } else {
      return {embeds: [embed], components: []}
    }
  } else {
    return {embeds: [embed], components: []}
  }
}

async function addSeed(interaction) {
  let seed = interaction.values[0]
  const tag = await Tags.findOne({where: {username: interaction.user.username}})
  let temp = tag.inventory, tempTwo = tag.farm
  temp[seed] == 1 ? delete temp[seed] : temp[seed]--
  tempTwo.push([seed, seeds[seed].time * 1_000 + Date.now()])
  await Tags.update({inventory: temp, farm: tempTwo}, {where: {username: interaction.user.username}})
  const response = await updateSeeds(interaction)
  return response
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('farm')
    .setDescription('Allows you to view your farm'),

  async execute(interaction) {
    let response = await interaction.reply(await updateSeeds(interaction))
    const collectorOne = response.createMessageComponentCollector({componentType: ComponentType.StringSelect, time: 3_600_000})
    collectorOne.on('collect', async interactionTwo => {interactionTwo.update(await addSeed(interactionTwo))})
  }
}