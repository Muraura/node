'use strict';
module.exports = (sequelize, DataTypes) => {
  const Personnel = sequelize.define('Personnel', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    personnel_first_name: {
      allowNull: false,
      type: DataTypes.STRING
    },
    personnel_last_name: {
      allowNull: false,
      type: DataTypes.STRING
    },
    personnel_phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    personnel_status: {
      type: DataTypes.TINYINT,
      allowNull: false,
    },
    personnel_type_id: {
      type: DataTypes.TINYINT,
      allowNull: false,
    },
    personnel_password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    personnel_reset_password: {
      type: DataTypes.TINYINT,
      allowNull: false,
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
      defaultValue: Date.now,
    },
    updated_at: {
      type: DataTypes.DATE,
    }
  }, {
    timestamps: false,
    freezeTableName: true,
    tableName: 'personnel',
    operatorsAliases: false
  });
  Personnel.associate = function (models) {
    // associations can be defined here
  };
  return Personnel;
};