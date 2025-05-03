'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('user_levels', [ // Assumes table name is 'user_level'
      {
        level_code: 'SUA',
        level_name: 'Super Admin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        level_code: 'PTG',
        level_name: 'Petugas',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        level_code: 'PGN', 
        level_name: 'Pengguna', 
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    // Remove the specific levels added by this seed
    await queryInterface.bulkDelete('user_levels', { // Assumes table name is 'user_level'
      level_code: ['SUA', 'PTG', 'PGN']
    }, {});
  }
};
