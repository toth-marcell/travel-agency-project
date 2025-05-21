// Adatbázis kezelő
import { Sequelize, DataTypes } from "sequelize";
const handler = new Sequelize("sqlite:data/db.sqlite");

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
export const User = handler.define("User", {
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
export const Trip = handler.define("Trip", {
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

await handler.sync({ alter: true });
