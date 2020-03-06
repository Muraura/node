'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('personnel', [{
      personnel_first_name: 'William',
      personnel_last_name: 'Wamwalo',
      personnel_phone: '0700000000',
      personnel_status: 1,
      personnel_type_id: 1,
      personnel_password: '$2a$10$ECdOnZkH6ZRE9jzvUst4x.PNqKwgSHcaoceTxazjMRg1VojEpHh6S',
      created_by: 1,
      modified_by: 1,
      updated_at: new Date(),
      created_at: new Date(),
      modified_by: null,
      personnel_reset_password: 0
    }, {
      personnel_first_name: 'Grace',
      personnel_last_name: 'Nduta',
      personnel_phone: '0722222222',
      personnel_status: 1,
      personnel_type_id: 1,
      personnel_password: '$2a$10$ECdOnZkH6ZRE9jzvUst4x.PNqKwgSHcaoceTxazjMRg1VojEpHh6S',
      created_by: 1,
      modified_by: 1,
      updated_at: new Date(),
      created_at: new Date(),
      modified_by: null,
      personnel_reset_password: 0
    }, {
      personnel_first_name: 'Patricia',
      personnel_last_name: 'Kanana',
      personnel_phone: '0712345678',
      personnel_status: 1,
      personnel_type_id: 2,
      personnel_password: '$2a$10$ECdOnZkH6ZRE9jzvUst4x.PNqKwgSHcaoceTxazjMRg1VojEpHh6S',
      created_by: 1,
      modified_by: 1,
      updated_at: new Date(),
      created_at: new Date(),
      modified_by: null,
      personnel_reset_password: 0
    }, {
      personnel_first_name: 'Alvaro',
      personnel_last_name: 'Masitsa',
      personnel_phone: '0774834466',
      personnel_status: 1,
      personnel_type_id: 2,
      personnel_password: '$2a$10$ECdOnZkH6ZRE9jzvUst4x.PNqKwgSHcaoceTxazjMRg1VojEpHh6S',
      created_by: 1,
      modified_by: 1,
      updated_at: new Date(),
      created_at: new Date(),
      modified_by: null,
      personnel_reset_password: 0
    }, {
      personnel_first_name: 'Grace',
      personnel_last_name: 'Nduta',
      personnel_phone: '0722222222',
      personnel_status: 1,
      personnel_type_id: 1,
      personnel_password: '$2a$10$ECdOnZkH6ZRE9jzvUst4x.PNqKwgSHcaoceTxazjMRg1VojEpHh6S',
      created_by: 1,
      modified_by: 1,
      updated_at: new Date(),
      created_at: new Date(),
      modified_by: null,
      personnel_reset_password: 0
    }, {
      personnel_first_name: 'Grace',
      personnel_last_name: 'Nduta',
      personnel_phone: '0722222222',
      personnel_status: 0,
      personnel_type_id: 1,
      personnel_password: '$2a$10$ECdOnZkH6ZRE9jzvUst4x.PNqKwgSHcaoceTxazjMRg1VojEpHh6S',
      created_by: 1,
      modified_by: 1,
      updated_at: new Date(),
      created_at: new Date(),
      modified_by: null,
      personnel_reset_password: 0
    }, {
      personnel_first_name: 'Grace',
      personnel_last_name: 'Nduta',
      personnel_phone: '0722222222',
      personnel_status: 0,
      personnel_type_id: 1,
      personnel_password: '$2a$10$ECdOnZkH6ZRE9jzvUst4x.PNqKwgSHcaoceTxazjMRg1VojEpHh6S',
      created_by: 1,
      modified_by: 1,
      updated_at: new Date(),
      created_at: new Date(),
      modified_by: null,
      personnel_reset_password: 0
    }, {
      personnel_first_name: 'Grace',
      personnel_last_name: 'Nduta',
      personnel_phone: '0722222222',
      personnel_status: 0,
      personnel_type_id: 1,
      personnel_password: '$2a$10$ECdOnZkH6ZRE9jzvUst4x.PNqKwgSHcaoceTxazjMRg1VojEpHh6S',
      created_by: 1,
      modified_by: 1,
      updated_at: new Date(),
      created_at: new Date(),
      modified_by: null,
      personnel_reset_password: 0
    }, {
      personnel_first_name: 'Grace',
      personnel_last_name: 'Nduta',
      personnel_phone: '0722222222',
      personnel_status: 0,
      personnel_type_id: 2,
      personnel_password: '$2a$10$ECdOnZkH6ZRE9jzvUst4x.PNqKwgSHcaoceTxazjMRg1VojEpHh6S',
      created_by: 1,
      modified_by: 1,
      updated_at: new Date(),
      created_at: new Date(),
      modified_by: null,
      personnel_reset_password: 0
    }, {
      personnel_first_name: 'Grace',
      personnel_last_name: 'Nduta',
      personnel_phone: '0722222222',
      personnel_status: 0,
      personnel_type_id: 2,
      personnel_password: '$2a$10$ECdOnZkH6ZRE9jzvUst4x.PNqKwgSHcaoceTxazjMRg1VojEpHh6S',
      created_by: 1,
      modified_by: 1,
      updated_at: new Date(),
      created_at: new Date(),
      modified_by: null,
      personnel_reset_password: 0
    }], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('personnel', null, {});
  }
};