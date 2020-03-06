'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('personnel', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      personnel_first_name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      personnel_last_name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      personnel_phone: {
        type: Sequelize.STRING,
        allowNull: false
      },
      personnel_status: {
        type: Sequelize.TINYINT,
        allowNull: false,
      },
      personnel_type_id: {
        type: Sequelize.TINYINT,
        allowNull: false,
      },
      personnel_password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      personnel_reset_password: {
        type: Sequelize.TINYINT,
        allowNull: false,
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
    return queryInterface.dropTable('personnel');
  }
};