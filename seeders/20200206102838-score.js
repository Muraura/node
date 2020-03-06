'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('score', [{
      score_name: "Presence",
      created_by: 1,
      modified_by: 1,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      score_name: "Scoring",
      created_by: 1,
      modified_by: 1,
      created_at: new Date(),
      updated_at: new Date()
    }], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('score', null, {});
  }
};