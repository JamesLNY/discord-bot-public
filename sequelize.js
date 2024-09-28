const Sequelize = require('sequelize')

const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite'
})

const Tags = sequelize.define('tags', {
	username: {
    type: Sequelize.STRING,
    unique: true
  },
  balance: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  prestige: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  location: {
    type: Sequelize.STRING,
    defaultValue: "Plains"
  },
  dailyCooldown: {
    type: Sequelize.DATEONLY,
    defaultValue: '2000-01-01'
  },
  inventory: {
    type: Sequelize.STRING,
    defaultValue: '{}',
    get() {return(JSON.parse(this.getDataValue('inventory')))},
    set(value) {this.setDataValue('inventory', JSON.stringify(value))}
  },
  farm: {
    type: Sequelize.STRING,
    defaultValue: '[]',
    get() {return(JSON.parse(this.getDataValue('farm')))},
    set(value) {this.setDataValue('farm', JSON.stringify(value))}
  },
  levels: {
    type: Sequelize.STRING,
    defaultValue: `{
      "Global": [1, 0],
      "Fishing": [1, 0],
      "Gathering": [1, 0],
      "Hunting": [1, 0],
      "Mining": [1, 0],
      "Chopping": [1, 0],
      "Trading": [1, 0],
      "Crafting": [1, 0]
    }`,
    get() {return(JSON.parse(this.getDataValue('levels')))},
    set(value) {this.setDataValue('levels', JSON.stringify(value))}
  },
  equipment: {
    type: Sequelize.STRING,
    defaultValue: `{
      "Weapon": "None",
      "Armor": "None"
    }`,
    get() {return(JSON.parse(this.getDataValue('equipment')))},
    set(value) {this.setDataValue('equipment', JSON.stringify(value))}
  },
  stats: {
    type: Sequelize.STRING,
    defaultValue: `{
      "Health": 100,
      "Defense": 10,
      "Attack": 30
    }`,
    get() {return(JSON.parse(this.getDataValue('stats')))},
    set(value) {this.setDataValue('stats', JSON.stringify(value))}
  }
})

module.exports = { Tags }