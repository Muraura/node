'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('scout', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      scout_date: {
        allowNull: false,
        type: Sequelize.DATE
      },
      block_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      bed_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      station_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      point_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      plant_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      variety_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      issue_type_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      issue_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      issue_category_id: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      scout_latitude: {
        allowNull: false,
        type: Sequelize.DOUBLE
      },
      scout_longitude: {
        allowNull: false,
        type: Sequelize.DOUBLE
      },
      scout_value: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      tolerance_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      created_by: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      modified_by: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('scout');
  }
};