"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "station",
      [
        {
          station_name: "Station 1",
          created_by: 1,
          created_at: new Date(),
          modified_by: null
        },
        {
          station_name: "Station 2",
          created_by: 1,
          created_at: new Date(),
          modified_by: null
        },
        {
          station_name: "Station 3",
          created_by: 1,
          created_at: new Date(),
          modified_by: null
        },
        {
          station_name: "Station 4",
          created_by: 1,
          created_at: new Date(),
          modified_by: null
        },
        {
          station_name: "Station 5",
          created_by: 1,
          created_at: new Date(),
          modified_by: null
        },
        {
          station_name: "Station 6",
          created_by: 1,
          created_at: new Date(),
          modified_by: null
        },
        {
          station_name: "Station 7",
          created_by: 1,
          created_at: new Date(),
          modified_by: null
        },
        {
          station_name: "Station 8",
          created_by: 1,
          created_at: new Date(),
          modified_by: null
        },
        {
          station_name: "Station 9",
          created_by: 1,
          created_at: new Date(),
          modified_by: null
        },
        {
          station_name: "Station 10",
          created_by: 1,
          created_at: new Date(),
          modified_by: null
        },
        {
          station_name: "Station 11",
          created_by: 1,
          created_at: new Date(),
          modified_by: null
        },
        {
          station_name: "Station 12",
          created_by: 1,
          created_at: new Date(),
          modified_by: null
        },
        {
          station_name: "Station 13",
          created_by: 1,
          created_at: new Date(),
          modified_by: null
        },
        {
          station_name: "Station 14",
          created_by: 1,
          created_at: new Date(),
          modified_by: null
        },
        {
          station_name: "Station 15",
          created_by: 1,
          created_at: new Date(),
          modified_by: null
        }
      ],
      {}
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("station", null, {});
  }
};
