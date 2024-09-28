const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, SlashCommandBuilder, ComponentType } = require('discord.js')
const shop = require('../../dataSets/shop.json')
const { Tags } = require('../../sequelize.js')


async function buyItem(interaction, item) {
  const quantity = Number(interaction.fields.getTextInputValue('quantityInput'))
  const tag = await Tags.findOne({where: {username: interaction.user.username}})
  const embed = {
    title: `Shopping`,
    description: `You have bought ${quantity * shop[item].quantity} ${item}`
  }
  if (shop[item].value * quantity > tag.balance) {
    embed.description = `You do not have enough money`
  } else {
    let temp = tag.inventory
    Object.hasOwn(temp, item) ? temp[item] += quantity * shop[item].quantity : temp[item] = quantity * shop[item].quantity
    await Tags.update(
      {balance: tag.balance - shop[item].value * quantity, inventory: temp}, 
      {where: {username: interaction.user.username}})
  }
  await interaction.reply({embeds: [embed]})
}

async function selectQuantity(interaction) {
  let item = interaction.values[0]
  const modal = new ModalBuilder()
    .setCustomId('shopping')
    .setTitle('Shopping');

  const quantityInput = new TextInputBuilder()
    .setCustomId('quantityInput')
    .setLabel(`How many times do you want to buy this?`)
    .setStyle(TextInputStyle.Short)

  const firstActionRow = new ActionRowBuilder().addComponents(quantityInput)
  modal.addComponents(firstActionRow)
  await interaction.showModal(modal)

  const collectorFilter = i => i.user.id === interaction.user.id
  interaction.awaitModalSubmit({collectorFilter, time: 3_600_000})
    .then(async interaction => {buyItem(interaction, item)})
    .catch(console.error);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('Shows you the shop'),
  
  async execute(interaction) {
    const embed = {title: `Shop`, fields: []}

    const select = new StringSelectMenuBuilder()
      .setCustomId('item')
      .setPlaceholder('Select the item you want to buy')
    
    for (let keyOne in shop) {
      embed.fields.push({
        name: `${keyOne} (${shop[keyOne].quantity})`,
        value: shop[keyOne].value
      })
      select.addOptions(new StringSelectMenuOptionBuilder()
        .setLabel(keyOne)
				.setValue(keyOne))
    }
    
    const row = new ActionRowBuilder()
			.addComponents(select)

    const response = await interaction.reply({embeds: [embed], components: [row]})

    const collector = response.createMessageComponentCollector({componentType: ComponentType.StringSelect, time: 3_600_000})
    collector.on('collect', async interactionTwo => {selectQuantity(interactionTwo)})
  }
}