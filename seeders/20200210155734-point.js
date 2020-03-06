"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "point",
      [
        {
          point_name: "Top",
          created_by: 1,
          modified_by: 1,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          point_name: "Middle",
          created_by: 1,
          modified_by: 1,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          point_name: "Base",
          created_by: 1,
          modified_by: 1,
          created_at: new Date(),
          updated_at: new Date()
        }
      ],
      {}
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("point", null, {});
  }
};
