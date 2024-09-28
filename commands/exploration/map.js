const { SlashCommandBuilder, AttachmentBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType } = require('discord.js')
const { Tags } = require('../../sequelize.js')
const wait = require('node:timers/promises').setTimeout;

async function travel(interaction) {
  const tag = await Tags.findOne({where: {username: interaction.user.username}}) 
  const locations = ["Plains", "Lake", "River", "Shore", "Forest", "Mountain"]
  if (! locations.includes(tag.location)) {
    await interaction.update({components: []})
  } else {
    let location = interaction.values[0]
    const time = Math.round(new Date() / 1_000 + 60);
    const embed = {
      title: "Map",
      description: `Location: Traveling to ${location} (<t:${time}:R>)`,
      image: {url: 'attachment://map.jpg'},
      footer: {text: "Made using https://inkarnate.com/"}
    }
    await Tags.update({location: `Traveling to ${location} (<t:${time}:R>)`}, {where: {username: interaction.user.username}})
    await interaction.update({embeds: [embed], components: []})
    await wait(60_000)
    await Tags.update({location: location}, {where: {username: interaction.user.username}})
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('map')
    .setDescription('Travel to different locations'),

  async execute(interaction) {
    const attachment = new AttachmentBuilder('./assets/map.jpg', {name: 'map.jpg'})
    const tag = await Tags.findOne({where: {username: interaction.user.username}})
    let embed = {
      title: "Map",
      description: `Location: ${tag.location}`,
      image: {url: 'attachment://map.jpg'},
      footer: {text: "Made using https://inkarnate.com/"}
    }
    const select = new StringSelectMenuBuilder()
      .setCustomId('item')
      .setPlaceholder('Select the location you want to travel to')
    const locations = ["Plains", "Lake", "River", "Shore", "Forest", "Mountain"]
    for (let i in locations) {
      if (locations[i] == tag.location) {continue}
      select.addOptions(new StringSelectMenuOptionBuilder()
        .setLabel(locations[i])
        .setValue(locations[i]))
    }
    const row = new ActionRowBuilder()
      .addComponents(select)
    let message = {embeds: [embed], files: [attachment]}
    if (locations.includes(tag.location)) {message.components = [row]}
    let response = await interaction.reply(message)
    const collector = response.createMessageComponentCollector({componentType: ComponentType.StringSelect, time: 3_600_000})
    collector.on('collect', async interactionTwo => {travel(interactionTwo)})
  }
}