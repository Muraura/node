'use strict';
module.exports = (sequelize, DataTypes) => {
  const Point = sequelize.define('Point', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    point_name: {
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
      type: DataTypes.DATE,
      defaultValue: Date.now
    }
  }, {
    timestamps: false,
    freezeTableName: true,
    tableName: 'point',
    operatorsAliases: false
  });
  Point.associate = function (models) {
    // associations can be defined here
    Point.hasMany(models.Scout, {
      foreignKey: "point_id",
      onDelete: "CASCADE",
      as: "scout_point"
    });
  };
  return Point;
};