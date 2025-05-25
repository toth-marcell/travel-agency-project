import { Sequelize, DataTypes } from "sequelize";

const sequelize = new Sequelize("sqlite:data/db.sqlite");

export const User = sequelize.define("User", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export const Trip = sequelize.define("Trip", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
});

export const Destination = sequelize.define("Destination", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});

export const Accommodation = sequelize.define("Accommodation", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});

export const Transport = sequelize.define("Transport", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});

Trip.belongsTo(User, { foreignKey: "creatorId" });
User.hasMany(Trip, { foreignKey: "creatorId" });

Trip.belongsTo(Destination, { onDelete: "RESTRICT" });
Destination.hasMany(Trip);

Trip.belongsTo(Accommodation, { onDelete: "RESTRICT" });
Accommodation.hasMany(Trip);

Trip.belongsTo(Transport, { onDelete: "RESTRICT" });
Transport.hasMany(Trip);

Accommodation.belongsTo(Destination, { onDelete: "RESTRICT" });
Destination.hasMany(Accommodation);

await sequelize.sync();
