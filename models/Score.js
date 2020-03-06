"use strict";
module.exports = (sequelize, DataTypes) => {
  const Score = sequelize.define(
    "Score",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      score_name: {
        type: DataTypes.STRING
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
        type: DataTypes.DATE
      }
    },
    {
      timestamps: false,
      freezeTableName: true,
      tableName: "score",
      operatorsAliases: false
    }
  );
  Score.associate = function(models) {
    Score.hasMany(models.Issue, {
      foreignKey: "score_id",
      onDelete: "CASCADE",
      as: "issue_scores"
    });
  };
  return Score;
};
