'use strict';

const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('admin123', 10); // Hash the password

    // Generate the FIRST Super Admin user_code according to the new rule
    const userCode = 'USR001'; // First Super Admin

    await queryInterface.bulkInsert('userakses', [ // Assumes table name is 'userakses'
      {
        user_code: userCode, // Use the new code format
        user_name: 'superadmin',
        user_pass: hashedPassword,
        user_phone: '080000000000', // Placeholder phone
        user_email: 'superadmin@example.com', // Placeholder email
        user_level: 'SUA', // Foreign key referencing user_level.level_code
        user_foto: null, // No photo initially
        user_owner: null, // Super Admin is not tied to a specific market
        user_status: 'A', // Active status
        user_validation: null, // No active token initially
        createdAt: new Date(),
        updatedAt: new Date()
      }
      // You could add more seed users here (e.g., a Petugas for PSR0001)
      // Example Petugas for PSR0001:
      // ,{
      //   user_code: 'PSRPSR0001001', // First Petugas for market PSR0001
      //   user_name: 'petugas_psr0001',
      //   user_pass: await bcrypt.hash('petugas123', 10),
      //   user_phone: '081111111111',
      //   user_email: 'petugas1@example.com',
      //   user_level: 'PTG',
      //   user_foto: null,
      //   user_owner: 'PSR0001', // Assigned to market PSR0001
      //   user_status: 'A',
      //   user_validation: null,
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('userakses', { 
      user_code: ['USR001']
    }, {});
  }
};
