'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('tolerancetype', [{
      tolerance_type_name: "Diseases1",
      created_by: 1,
      modified_by: 1,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      tolerance_type_name: "Pest1",
      created_by: 1,
      modified_by: 1,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      tolerance_type_name: "Pest 2",
      created_by: 1,
      modified_by: 1,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      tolerance_type_name: "Disease 2",
      created_by: 1,
      modified_by: 1,
      created_at: new Date(),
      updated_at: new Date()
    }], {});
  },

  down: (queryInterface, Sequelize) => {

    return queryInterface.bulkDelete('tolerancetype', null, {});
  }
};