"use strict";
module.exports = (sequelize, DataTypes) => {
  const Variety = sequelize.define(
    "Variety",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      variety_name: {
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
        type: DataTypes.DATE
      },
      updated_at: {
        type: DataTypes.DATE
      }
    },
    {
      timestamps: false,
      freezeTableName: true,
      tableName: "variety",
      operatorsAliases: false
    }
  );
  Variety.associate = function(models) {
    // associations can be defined here
    Variety.hasMany(models.Plant, {
      foreignKey: "variety_id",
      onDelete: "CASCADE",
      as: "plant_variety"
    });
  };
  return Variety;
};
