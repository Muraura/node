"use strict";
module.exports = (sequelize, DataTypes) => {
  const ToleranceType = sequelize.define(
    "ToleranceType",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      tolerance_type_name: {
        allowNull: false,
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
      tableName: "tolerancetype",
      operatorsAliases: false
    }
  );

  ToleranceType.associate = function(models) {
    ToleranceType.hasMany(models.Issue, {
      foreignKey: "tolerance_type_id",
      onDelete: "CASCADE",
      as: "issue_tolerances"
    });

    ToleranceType.hasMany(models.Tolerance, {
      oreignKey: "tolerance_type_id",
      onDelete: "CASCADE",
      as: "tolerance_tolerance_type"
    });
  };
  return ToleranceType;
};
