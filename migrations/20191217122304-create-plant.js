"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("plant", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      plant_expected_pick_date: {
        type: Sequelize.DATE
      },
      plant_date: {
        type: Sequelize.DATE
      },
      plant_status: {
        allowNull: false,
        type: Sequelize.TINYINT
      },
      bed_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      block_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      variety_id: {
        allowNull: false,
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
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("plant");
  }
};