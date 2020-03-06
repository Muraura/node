"use strict";
module.exports = (sequelize, DataTypes) => {
  const Issue = sequelize.define(
    "Issue",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      issue_name: {
        allowNull: false,
        type: DataTypes.STRING
      },
      score_id: {
        allowNull: false,
        type: DataTypes.INTEGER
      },
      issue_type_id: {
        allowNull: false,
        type: DataTypes.INTEGER
      },
      tolerance_type_id: {
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
        type: DataTypes.DATE,
        onUpdate: DataTypes.NOW
      }
    },
    {
      timestamps: false,
      freezeTableName: true,
      tableName: "issue",
      operatorsAliases: false
    }
  );
  Issue.associate = function(models) {
    Issue.belongsTo(models.IssueType, {
      foreignKey: "issue_type_id",
      onDelete: "CASCADE",
      as: "issue_types"
    });
    Issue.belongsTo(models.Score, {
      foreignKey: "score_id",
      onDelete: "CASCADE",
      as: "issue_scores"
    });
    Issue.belongsTo(models.ToleranceType, {
      foreignKey: "tolerance_type_id",
      onDelete: "CASCADE",
      as: "issue_tolerances"
    });
    Issue.hasMany(models.IssueCategory, {
      foreignKey: "issue_id",
      onDelete: "CASCADE",
      as: "issue_types_category"
    });
  };
  return Issue;
};
