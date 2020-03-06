"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "bed",
      [
        {
          bed_name: "Bed 1",
          bed_number: 1,
          block_id: 7,
          created_by: 1,
          created_at: new Date(),
          modified_by: null
        },
        {
          bed_name: "Bed 2",
          bed_number: 2,
          block_id: 8,
          created_by: 1,
          created_at: new Date(),
          modified_by: null
        },
        {
          bed_name: "Bed 3",
          bed_number: 3,
          block_id: 7,
          created_by: 1,
          created_at: new Date(),
          modified_by: null
        },
        {
          bed_name: "Bed 4",
          bed_number: 4,
          block_id: 8,
          created_by: 1,
          created_at: new Date(),
          modified_by: null
        },
        {
          bed_name: "Bed 5",
          bed_number: 5,
          block_id: 7,
          created_by: 1,
          created_at: new Date(),
          modified_by: null
        }
      ],
      {}
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("bed", null, {});
  }
};
