"use strict";
module.exports = (sequelize, DataTypes) => {
  const Bed = sequelize.define(
    "Bed", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      block_id: {
        allowNull: false,
        type: DataTypes.INTEGER
      },
      bed_number: {
        allowNull: false,
        type: DataTypes.INTEGER
      },
      bed_name: {
        allowNull: false,
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
        allowNull: true,
        type: DataTypes.DATE,
        defaultValue: Date.now
      },
      updated_at: {
        type: DataTypes.DATE,
        onUpdate: DataTypes.NOW
      }
    }, {
      timestamps: false,
      freezeTableName: true,
      tableName: "bed",
      operatorsAliases: false
    }
  );
  Bed.associate = function (models) {
    Bed.hasMany(models.Plant, {
      foreignKey: "bed_id",
      onDelete: "CASCADE",
      as: "plant_bed"
    });
    Bed.belongsTo(models.Block, {
      foreignKey: "block_id",
      onDelete: "CASCADE",
      as: "bed_block"
    });
  };
  return Bed;
};