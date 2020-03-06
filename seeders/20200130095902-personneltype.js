'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('personneltype', [{
      personnel_type_name: 'Admin',
      created_by: 1,
      modified_by: 1,
      created_at: new Date(),
      updated_at: new Date(),

    }, {
      personnel_type_name: 'Scout',
      created_by: 1,
      modified_by: 1,
      created_at: new Date(),
      updated_at: new Date(),
    }], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('personneltype', null, {});
  }
};