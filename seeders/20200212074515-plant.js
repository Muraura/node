"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "plant",
      [
        {
          plant_expected_pick_date: new Date("Feb 12, 2020 01:15:00"),
          plant_date: new Date("Feb 12, 2021 01:15:00"),
          plant_status: 1,
          bed_id: 1,
          block_id: 7,
          variety_id: 1,
          created_by: 1,
          created_at: new Date(),
          modified_by: null
        },
        {
          plant_expected_pick_date: new Date("Feb 13, 2020 01:15:00"),
          plant_date: new Date("Feb 13, 2021 01:15:00"),
          plant_status: 1,
          bed_id: 2,
          block_id: 8,
          variety_id: 2,
          created_by: 1,
          created_at: new Date(),
          modified_by: null
        },
        {
          plant_expected_pick_date: new Date("Feb 14, 2020 01:15:00"),
          plant_date: new Date("Feb 14, 2021 01:15:00"),
          plant_status: 1,
          bed_id: 3,
          block_id: 7,
          variety_id: 3,
          created_by: 1,
          created_at: new Date(),
          modified_by: null
        },
        {
          plant_expected_pick_date: new Date("Feb 15, 2020 01:15:00"),
          plant_date: new Date("Feb 15, 2021 01:15:00"),
          plant_status: 1,
          bed_id: 4,
          block_id: 8,
          variety_id: 3,
          created_by: 1,
          created_at: new Date(),
          modified_by: null
        },
        {
          plant_expected_pick_date: new Date("Feb 16, 2020 01:15:00"),
          plant_date: new Date("Feb 16, 2021 01:15:00"),
          plant_status: 1,
          bed_id: 5,
          block_id: 7,
          variety_id: 3,
          created_by: 1,
          created_at: new Date(),
          modified_by: null
        }
      ],
      {}
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("plant");
  }
};
