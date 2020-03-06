'use strict';
module.exports = (sequelize, DataTypes) => {
  const IssueCategory = sequelize.define('IssueCategory', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    issue_id: {
      allowNull: false,
      type: DataTypes.INTEGER
    },
    issue_category_name: {
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
    tableName: 'issuecategory',
    operatorsAliases: false
  });
  IssueCategory.associate = function (models) {
    IssueCategory.belongsTo(models.Issue, {
      foreignKey: 'issue_id',
      onDelete: 'CASCADE',
      as: 'issue_types_category'
    });
  };
  return IssueCategory;
};