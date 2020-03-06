'use strict';
module.exports = (sequelize, DataTypes) => {
  const IssueType = sequelize.define('IssueType', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    issue_type_name: {
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
      allowNull: false,
      type: DataTypes.DATE
    },
    updated_at: {
      type: DataTypes.DATE
    }
  }, {
    timestamps: false,
    freezeTableName: true,
    tableName: 'issuetype',
    operatorsAliases: false
  });
  IssueType.associate = function (models) {
    IssueType.hasMany(models.Issue, {
      foreignKey: 'issue_type_id',
      onDelete: 'CASCADE',
      as: 'issue_types'
    })
  };
  return IssueType;
};