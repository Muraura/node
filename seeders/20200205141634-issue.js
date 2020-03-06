'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('issue', [{
      issue_name: "Downey Mildew-Fresh",
      issue_type_id: 2,
      tolerance_type_id: 1,
      score_id: 2,
      created_by: 1,
      modified_by: 1,
      created_at: new Date(),
      updated_at: new Date(),
    }, {
      issue_name: "Powdery Mildew-Fresh",
      issue_type_id: 2,
      tolerance_type_id: 1,
      score_id: 2,
      created_by: 1,
      modified_by: 1,
      created_at: new Date(),
      updated_at: new Date(),
    }, {
      issue_name: "Botrytis",
      issue_type_id: 1,
      tolerance_type_id: 1,
      score_id: 1,
      created_by: 1,
      modified_by: 1,
      created_at: new Date(),
      updated_at: new Date(),
    }, {
      issue_name: "Dumping Off",
      issue_type_id: 1,
      tolerance_type_id: 1,
      score_id: 1,
      created_by: 1,
      modified_by: 1,
      created_at: new Date(),
      updated_at: new Date(),
    }, {
      issue_name: "Aphids",
      issue_type_id: 1,
      tolerance_type_id: 2,
      score_id: 1,
      created_by: 1,
      modified_by: 1,
      created_at: new Date(),
      updated_at: new Date(),
    }, {
      issue_name: "Thrips",
      issue_type_id: 1,
      tolerance_type_id: 2,
      score_id: 1,
      created_by: 1,
      modified_by: 1,
      created_at: new Date(),
      updated_at: new Date(),
    }, {
      issue_name: "Soil Pests",
      issue_type_id: 1,
      tolerance_type_id: 2,
      score_id: 1,
      created_by: 1,
      modified_by: 1,
      created_at: new Date(),
      updated_at: new Date(),
    }, {
      issue_name: "Red Spidermites",
      issue_type_id: 1,
      tolerance_type_id: 2,
      score_id: 1,
      created_by: 1,
      modified_by: 1,
      created_at: new Date(),
      updated_at: new Date(),
    }, {
      issue_name: "Caterpillars",
      issue_type_id: 1,
      tolerance_type_id: 3,
      score_id: 1,
      created_by: 1,
      modified_by: 1,
      created_at: new Date(),
      updated_at: new Date(),
    }, {
      issue_name: "Slugs",
      issue_type_id: 1,
      tolerance_type_id: 3,
      score_id: 1,
      created_by: 1,
      modified_by: 1,
      created_at: new Date(),
      updated_at: new Date(),
    }], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('issue', null, {});
  }
};