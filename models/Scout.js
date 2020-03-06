"use strict";
module.exports = (sequelize, DataTypes) => {
  const Scout = sequelize.define(
    "Scout", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      scout_date: {
        allowNull: false,
        type: DataTypes.DATE
      },
      block_id: {
        allowNull: false,
        type: DataTypes.INTEGER
      },
      bed_id: {
        allowNull: false,
        type: DataTypes.INTEGER
      },
      station_id: {
        allowNull: false,
        type: DataTypes.INTEGER
      },
      point_id: {
        allowNull: false,
        type: DataTypes.INTEGER
      },
      plant_id: {
        allowNull: false,
        type: DataTypes.INTEGER
      },
      variety_id: {
        allowNull: false,
        type: DataTypes.INTEGER
      },
      issue_type_id: {
        allowNull: false,
        type: DataTypes.INTEGER
      },
      issue_id: {
        allowNull: false,
        type: DataTypes.INTEGER
      },
      issue_category_id: {
        allowNull: true,
        type: DataTypes.INTEGER
      },
      scout_latitude: {
        allowNull: false,
        type: DataTypes.DOUBLE
      },
      scout_longitude: {
        allowNull: false,
        type: DataTypes.DOUBLE
      },
      scout_value: {
        allowNull: false,
        type: DataTypes.INTEGER
      },
      tolerance_id: {
        allowNull: false,
        type: DataTypes.INTEGER
      },
      created_by: {
        allowNull: false,
        type: DataTypes.INTEGER
      },
      modified_by: {
        allowNull: false,
        type: DataTypes.INTEGER
      },
      created_at: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updated_at: {
        allowNull: false,
        type: DataTypes.DATE
      }
    }, {
      timestamps: false,
      freezeTableName: true,
      tableName: "scout",
      operatorsAliases: false
    }
  );
  Scout.associate = function (models) {
    // associations can be defined here
    Scout.belongsTo(models.Block, {
      foreignKey: 'block_id',
      onDelete: 'CASCADE',
      as: 'scout_block'
    });
    Scout.belongsTo(models.Bed, {
      foreignKey: 'bed_id',
      onDelete: 'CASCADE',
      as: 'scout_bed'
    });
    Scout.belongsTo(models.Station, {
      foreignKey: 'station_id',
      onDelete: 'CASCADE',
      as: 'scout_station'
    });
    Scout.belongsTo(models.Point, {
      foreignKey: 'point_id',
      onDelete: 'CASCADE',
      as: 'scout_point'
    });
    Scout.belongsTo(models.IssueType, {
      foreignKey: 'issue_type_id',
      onDelete: 'CASCADE',
      as: 'scout_issue_type'
    });
    Scout.belongsTo(models.Issue, {
      foreignKey: 'issue_id',
      onDelete: 'CASCADE',
      as: 'scout_issue'
    });
    Scout.belongsTo(models.IssueCategory, {
      foreignKey: 'issue_category_id',
      onDelete: 'CASCADE',
      as: 'scout_issue_category'
    });
    Scout.belongsTo(models.Tolerance, {
      foreignKey: 'tolerance_id',
      onDelete: 'CASCADE',
      as: 'scout_tolerance'
    });
    Scout.belongsTo(models.Personnel, {
      foreignKey: 'created_by',
      onDelete: 'CASCADE',
      as: 'scout_personnel'
    });
    Scout.belongsTo(models.Variety, {
      foreignKey: 'variety_id',
      onDelete: 'CASCADE',
      as: 'scout_variety'
    });
  };
  return Scout;
};