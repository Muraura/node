"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("bed", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      block_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      bed_number: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      bed_name: {
        type: Sequelize.STRING
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
    return queryInterface.dropTable("bed");
  }
};