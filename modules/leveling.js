const { Tags } = require('../sequelize.js')

const Levels = {
  async addExperience(trait, username) {
    const tag = await Tags.findOne({where: {username: username}})
    let temp = tag.levels, tempTwo = tag.stats
    if (temp[trait][0] == 100) {
      temp[trait][1] = 100
      return
    }
    temp[trait][1] += Math.floor(Math.random() * 10)
    if (temp[trait][1] > 100) {
      temp[trait][0]++
      temp[trait][1] -= 100
      tempTwo.Health += 10
      tempTwo.Attack += 5
      tempTwo.Defense += 5
    }
    await Tags.update({levels: temp, stats: tempTwo}, {where: {username: username}})
  }
}

module.exports = { Levels }