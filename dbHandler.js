// Adatbázis kezelő
const { Sequelize, DataTypes } = require("sequelize");
const handler = new Sequelize("travel_agency", "root", "", {
  dialect: "mysql",
  host: "localhost",
});

// 'Users' tábla
// Szerkezet:
// id:
//  - integer
//  - primary key
//  - auto increment
//  - nem lehet null
// username:
//  - string
//  - unique
//  - nem lehet null
// password:
//  - string
//  - nem lehet null
exports.table = handler.define("users", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// 'Trips' tábla
// Szerkezet:
// id:
//  - integer
//  - primary key
//  - auto increment
//  - nem lehet null
// name:
//  - string
//  - unique
//  - nem lehet null
// destination:
//  - string
//  - nem lehet null
// accommodation:
//  - string
// transport:
//  - string
// description:
// - text
// date:
// - date
// creator:
// - string
exports.table2 = handler.define("trips", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },

  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },

  destination: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  accommodation: {
    type: DataTypes.STRING,
  },

  transport: {
    type: DataTypes.STRING,
  },

  description: DataTypes.TEXT,

  date: DataTypes.DATE,

  creator: DataTypes.STRING,
});
