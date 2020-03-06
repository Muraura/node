'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('tolerance', [{
        tolerance_name: 'Score 1',
        tolerance_from: 1,
        tolerance_to: 1,
        tolerance_type_id: 1,
        created_by: 1,
        modified_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        tolerance_name: 'Score 2',
        tolerance_from: 2,
        tolerance_to: 2,
        tolerance_type_id: 1,
        created_by: 1,
        modified_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        tolerance_name: 'Score 3',
        tolerance_from: 3,
        tolerance_to: 3,
        tolerance_type_id: 1,
        created_by: 1,
        modified_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        tolerance_name: 'Score 4',
        tolerance_from: 4,
        tolerance_to: 4,
        tolerance_type_id: 1,
        created_by: 1,
        modified_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        tolerance_name: 'Score 5',
        tolerance_from: 5,
        tolerance_to: 5,
        tolerance_type_id: 1,
        created_by: 1,
        modified_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      }, {
        tolerance_name: 'Score 1',
        tolerance_from: 1,
        tolerance_to: 5,
        tolerance_type_id: 2,
        created_by: 1,
        modified_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        tolerance_name: 'Score 2',
        tolerance_from: 6,
        tolerance_to: 10,
        tolerance_type_id: 2,
        created_by: 1,
        modified_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        tolerance_name: 'Score 3',
        tolerance_from: 11,
        tolerance_to: 15,
        tolerance_type_id: 2,
        created_by: 1,
        modified_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        tolerance_name: 'Score 4',
        tolerance_from: 16,
        tolerance_to: 20,
        tolerance_type_id: 2,
        created_by: 1,
        modified_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        tolerance_name: 'Score 5',
        tolerance_from: 21,
        tolerance_to: 100000000,
        tolerance_type_id: 2,
        created_by: 1,
        modified_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      }, {
        tolerance_name: 'Score 1',
        tolerance_from: 1,
        tolerance_to: 3,
        tolerance_type_id: 3,
        created_by: 1,
        modified_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        tolerance_name: 'Score 2',
        tolerance_from: 4,
        tolerance_to: 6,
        tolerance_type_id: 3,
        created_by: 1,
        modified_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        tolerance_name: 'Score 3',
        tolerance_from: 7,
        tolerance_to: 9,
        tolerance_type_id: 3,
        created_by: 1,
        modified_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        tolerance_name: 'Score 4',
        tolerance_from: 10,
        tolerance_to: 12,
        tolerance_type_id: 3,
        created_by: 1,
        modified_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        tolerance_name: 'Score 5',
        tolerance_from: 13,
        tolerance_to: 100000000,
        tolerance_type_id: 3,
        created_by: 1,
        modified_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('tolerance', null, {});
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
  }
};