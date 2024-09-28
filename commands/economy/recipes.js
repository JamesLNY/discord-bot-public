const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, SlashCommandBuilder, ComponentType, ButtonBuilder, ButtonStyle } = require('discord.js')
const recipes = require('../../dataSets/recipes.json')
const { Tags } = require('../../sequelize.js')
const { Levels } = require('../../modules/leveling.js')

async function craftItem(interaction, category, item) {
  const quantity = Number(interaction.fields.getTextInputValue('quantityInput'))
  const tag = await Tags.findOne({where: {username: interaction.user.username}})
  const temp = tag.inventory
  const embed = {
    title: `Crafting`,
    description: `You have crafted ${quantity * recipes[category][item].quantity} \`${item}\``
  }
  for (let key in recipes[category][item].ingredients) {
    let itemQuantity = recipes[category][item].ingredients[key] * quantity
    if (itemQuantity > temp[key]) {
      embed.description = `You do not have enough materials`
    } else {
      temp[key] == itemQuantity ? delete temp[key] : temp[key] -= itemQuantity
    }
  }
  if (embed.description != `You do not have enough materials`) {
    let itemQuantity = recipes[category][item].quantity * quantity
    Object.hasOwn(temp, item) ? temp[item] += itemQuantity : temp[item] = itemQuantity
    await Tags.update({inventory: temp}, {where: {username: interaction.user.username}})
    Levels.addExperience("Crafting", interaction.user.username)
  }
  await interaction.reply({embeds: [embed]})
}

async function selectQuantity(interaction, category) {
  let item = interaction.values[0]
  const modal = new ModalBuilder()
    .setCustomId('crafting')
    .setTitle('Crafting')

  const quantityInput = new TextInputBuilder()
    .setCustomId('quantityInput')
    .setLabel(`How many times do you want to craft this?`)
    .setStyle(TextInputStyle.Short)

  const firstActionRow = new ActionRowBuilder().addComponents(quantityInput)
  modal.addComponents(firstActionRow)
  await interaction.showModal(modal)

  const collectorFilter = i => i.user.id === interaction.user.id
  interaction.awaitModalSubmit({collectorFilter, time: 3_600_000})
    .then(async interaction => {craftItem(interaction, category, item)})
    .catch(console.error)
}

async function showPage(pageNumber, level) {
  let pageName = Object.keys(recipes)[pageNumber]
  const embed = {title: `Recipes`, fields: []}
  const select = new StringSelectMenuBuilder()
    .setCustomId('item')
    .setPlaceholder('Select the item you want to craft')
    
  for (let keyOne in recipes[pageName]) {
    if (recipes[pageName][keyOne].level > level) {continue}
    let ingredients = ""
    for (let keyTwo in recipes[pageName][keyOne].ingredients) {
      ingredients += `${keyTwo} - ${recipes[pageName][keyOne].ingredients[keyTwo]} \n`
    }
    embed.fields.push({
      name: `${keyOne} (${recipes[pageName][keyOne].quantity})`,
      value: ingredients
    })
    select.addOptions(new StringSelectMenuOptionBuilder()
      .setLabel(keyOne)
      .setValue(keyOne))
  }
  
  const nextPage = new ButtonBuilder()
    .setCustomId('nextPage')
    .setLabel('Next Page')
    .setStyle(ButtonStyle.Primary);
  const previousPage = new ButtonBuilder()
    .setCustomId('previousPage')
    .setLabel('Previous Page')
    .setStyle(ButtonStyle.Primary);

  if (pageNumber == Object.keys(recipes).length - 1) {nextPage.setDisabled(true)}
  if (pageNumber == 0) {previousPage.setDisabled(true)}
  
  const rowOne = new ActionRowBuilder()
    .addComponents(select)
  const rowTwo = new ActionRowBuilder()
    .addComponents(previousPage, nextPage)

  return {embeds: [embed], components: [rowOne, rowTwo]}
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('recipes')
    .setDescription('Shows the recipes you current know'),
  
  async execute(interaction) {
    const tag = await Tags.findOne({where: {username: interaction.user.username}})
    const temp = tag.levels
    let page = 0
    let response = await interaction.reply(await showPage(0, temp.Crafting[0]))
    const collectorOne = response.createMessageComponentCollector({componentType: ComponentType.StringSelect, time: 3_600_000})
    collectorOne.on('collect', async interactionTwo => {selectQuantity(interactionTwo, Object.keys(recipes)[page])})
    const collectorTwo = response.createMessageComponentCollector({componentType: ComponentType.Button, time: 3_600_000})
    collectorTwo.on('collect', async interactionTwo => {
      interactionTwo.customId == "nextPage" ? page++ : page--
      await interactionTwo.update(await showPage(page, temp.Crafting[0]))
    })
  }
}