'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('issuecategory', [{
      issue_category_name: "Larvae",
      issue_id: 6,
      created_by: 1,
      modified_by: 1,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      issue_category_name: "Adult",
      issue_id: 6,
      created_by: 1,
      modified_by: 1,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      issue_category_name: "Thrips Damage",
      issue_id: 6,
      created_by: 1,
      modified_by: 1,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      issue_category_name: "Eggs",
      issue_id: 9,
      created_by: 1,
      modified_by: 1,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      issue_category_name: "Moth",
      issue_id: 9,
      created_by: 1,
      modified_by: 1,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      issue_category_name: "Damage",
      issue_id: 9,
      created_by: 1,
      modified_by: 1,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      issue_category_name: "Adult Caterpillar",
      issue_id: 9,
      created_by: 1,
      modified_by: 1,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      issue_category_name: "Eggs RSM",
      issue_id: 8,
      created_by: 1,
      modified_by: 1,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      issue_category_name: "Moltiles",
      issue_id: 8,
      created_by: 1,
      modified_by: 1,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      issue_category_name: "Web",
      issue_id: 8,
      created_by: 1,
      modified_by: 1,
      created_at: new Date(),
      updated_at: new Date()
    }], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('issuecategory', null, {});
  }
};