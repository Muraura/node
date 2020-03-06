'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('tolerance', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      tolerance_name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      tolerance_from: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      tolerance_to: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      tolerance_type_id: {
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
        type: Sequelize.DATE
      },
      updated_at: {
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('tolerance');
  }
};