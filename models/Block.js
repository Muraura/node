"use strict";
module.exports = (sequelize, DataTypes) => {
  const Block = sequelize.define(
    "Block",

    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      block_name: {
        allowNull: false,
        type: DataTypes.STRING
      },
      block_parent: {
        type: DataTypes.INTEGER
      },

      block_number: {
        type: DataTypes.INTEGER
      },
      block_point_one_latitude: {
        type: DataTypes.DOUBLE
      },
      block_point_one_longitude: {
        type: DataTypes.DOUBLE
      },
      block_point_two_latitude: {
        type: DataTypes.DOUBLE
      },
      block_point_two_longitude: {
        type: DataTypes.DOUBLE
      },
      block_point_three_latitude: {
        type: DataTypes.DOUBLE
      },
      block_point_three_longitude: {
        type: DataTypes.DOUBLE
      },
      block_point_four_latitude: {
        type: DataTypes.DOUBLE
      },
      block_point_four_longitude: {
        type: DataTypes.DOUBLE
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
        type: DataTypes.DATE,
        onUpdate: DataTypes.NOW
      }
    }, {
      timestamps: false,
      freezeTableName: true,
      tableName: "block",
      operatorsAliases: false,
      hierarchy: true
    }
  );

  Block.associate = function (models) {
    // associations can be defined here
    Block.belongsTo(models.Block, {
      onDelete: "CASCADE",
      foreignKey: "block_parent",
      as: "children"
    });
    Block.hasMany(models.Plant, {
      foreignKey: "block_id",
      onDelete: "CASCADE",
      as: "plant_block"
    });
    Block.hasMany(models.Bed, {
      foreignKey: "block_id",
      onDelete: "CASCADE",
      as: "bed_block"
    });
  };
  return Block;
};