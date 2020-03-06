"use strict";
module.exports = (sequelize, DataTypes) => {
  const Plant = sequelize.define(
    "Plant",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      plant_expected_pick_date: {
        type: DataTypes.DATE,
        allowNull: false
      },
      plant_date: {
        type: DataTypes.DATE,
        allowNull: false
      },
      plant_status: {
        allowNull: false,
        type: DataTypes.TINYINT
      },
      bed_id: {
        allowNull: false,
        type: DataTypes.INTEGER
      },
      block_id: {
        allowNull: false,
        type: DataTypes.INTEGER
      },
      variety_id: {
        allowNull: false,
        type: DataTypes.INTEGER
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
      tableName: "plant",
      operatorsAliases: false
    }
  );
  Plant.associate = function(models) {
    // associations can be defined here
    Plant.hasMany(models.Scout, {
      foreignKey: "id",
      as: "plant_scout"
    });

    Plant.belongsTo(models.Bed, {
      foreignKey: "bed_id",
      onDelete: "CASCADE",
      as: "plant_bed"
    });

    Plant.belongsTo(models.Block, {
      foreignKey: "block_id",
      onDelete: "CASCADE",
      as: "plant_block"
    });
    Plant.belongsTo(models.Variety, {
      foreignKey: "variety_id",
      onDelete: "CASCADE",
      as: "plant_variety"
    });
  };
  return Plant;
};
