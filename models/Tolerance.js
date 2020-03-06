"use strict";
module.exports = (sequelize, DataTypes) => {
  const Tolerance = sequelize.define(
    "Tolerance",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      tolerance_name: {
        allowNull: false,
        type: DataTypes.STRING
      },
      tolerance_from: {
        allowNull: false,
        type: DataTypes.INTEGER
      },
      tolerance_to: {
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
      freezableTableName: true,
      tableName: "tolerance",
      operatorsAliases: false
    }
  );
  Tolerance.associate = function(models) {
    Tolerance.belongsTo(models.ToleranceType, {
      foreignKey: "tolerance_type_id",
      onDelete: "CASCADE",
      as: "tolerance_tolerance_type"
    });
  };
  return Tolerance;
};
