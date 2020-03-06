"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("block", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      block_name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      block_point_one_latitude: {
        type: Sequelize.DOUBLE
      },
      block_point_one_longitude: {
        type: Sequelize.DOUBLE
      },
      block_point_two_latitude: {
        type: Sequelize.DOUBLE
      },
      block_point_two_longitude: {
        type: Sequelize.DOUBLE
      },
      block_point_three_latitude: {
        type: Sequelize.DOUBLE
      },
      block_point_three_longitude: {
        type: Sequelize.DOUBLE
      },
      block_point_four_latitude: {
        type: Sequelize.DOUBLE
      },
      block_point_four_longitude: {
        type: Sequelize.DOUBLE
      },
      block_parent: {
        type: Sequelize.INTEGER
      },
      block_number: {
        type: Sequelize.INTEGER
      },
      created_by: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      modified_by: {
        type: Sequelize.INTEGER
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("block");
  }
};