'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('issuetype', [{
      issue_type_name: "Pests",
      created_by: 1,
      modified_by: 1,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      issue_type_name: "Diseases",
      created_by: 1,
      modified_by: 1,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      issue_type_name: "Beneficials",
      created_by: 1,
      modified_by: 1,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      issue_type_name: "Others",
      created_by: 1,
      modified_by: 1,
      created_at: new Date(),
      updated_at: new Date()
    }], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('issuetype', null, {});
  }
};