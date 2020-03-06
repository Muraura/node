"use strict";
module.exports = (sequelize, DataTypes) => {
  const Station = sequelize.define(
    "Station",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      station_name: {
        type: DataTypes.STRING
      },
      created_by: {
        allowNull: false,
        type: DataTypes.INTEGER
      },
      modified_by: {
        type: DataTypes.INTEGER
      },
      created_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: Date.now
      },
      updated_at: {
        type: DataTypes.DATE
      }
    },
    {
      timestamps: false,
      freezeTableName: true,
      tableName: "station",
      operatorsAliases: false
    }
  );
  Station.associate = function(models) {
    // associations can be defined here
    Station.hasMany(models.Scout, {
      foreignKey: "station_id",
      onDelete: "CASCADE",
      as: "scout_station"
    });
  };
  return Station;
};
