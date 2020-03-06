"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "block",
      [
        {
          block_name: "Block 1",
          block_number: 1,
          created_by: 1,
          created_at: new Date(),
          modified_by: null
        },
        {
          block_name: "Block 2",
          block_number: 2,
          created_by: 1,
          created_at: new Date(),
          modified_by: null
        },
        {
          block_name: "Block 3",
          block_number: 3,
          created_by: 1,
          created_at: new Date(),
          modified_by: null
        },
        {
          block_name: "Block 4",
          block_number: 4,
          created_by: 1,
          created_at: new Date(),
          modified_by: null
        },
        {
          block_name: "Block 13",
          block_number: 13,
          created_by: 1,
          created_at: new Date(),
          modified_by: null
        },
        {
          block_name: "Block 14",
          block_number: 14,
          created_by: 1,
          created_at: new Date(),
          modified_by: null
        },
        {
          block_name: "1 Left",
          block_parent: 1,
          created_by: 1,
          created_at: new Date(),
          modified_by: null
        },
        {
          block_name: "1 Right",
          block_parent: 1,
          created_by: 1,
          created_at: new Date(),
          modified_by: null
        },

        {
          block_name: "2 Left",
          block_parent: 2,
          created_by: 1,
          created_at: new Date(),
          modified_by: null
        },
        {
          block_name: "2 Right",
          block_parent: 2,
          created_by: 1,
          created_at: new Date(),
          modified_by: null
        },
        {
          block_name: "3 Left",
          block_parent: 3,
          created_by: 1,
          created_at: new Date(),
          modified_by: null
        },
        {
          block_name: "3 Right",
          block_parent: 3,
          created_by: 1,
          created_at: new Date(),
          modified_by: null
        },
        {
          block_name: "4 Left",
          block_parent: 4,
          created_by: 1,
          created_at: new Date(),
          modified_by: null
        },
        {
          block_name: "4 Right",
          block_parent: 4,
          created_by: 1,
          created_at: new Date(),
          modified_by: null
        },
        {
          block_name: "13 Left",
          block_parent: 5,
          created_by: 1,
          created_at: new Date(),
          modified_by: null
        },
        {
          block_name: "13 Right",
          block_parent: 5,
          created_by: 1,
          created_at: new Date(),
          modified_by: null
        },
        {
          block_name: "14 Left",
          block_parent: 6,
          created_by: 1,
          created_at: new Date(),
          modified_by: null
        },
        {
          block_name: "14 Right",
          block_parent: 6,
          created_by: 1,
          created_at: new Date(),
          modified_by: null
        }
      ],
      {}
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("block", null, {});
  }
};
