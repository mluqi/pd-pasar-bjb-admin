'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('data_pasars', [ // Assumes table name is 'data_pasar'
      {
        pasar_code: 'PSR0001', 
        pasar_nama: 'Pasar Banjarbaru Utara',
        pasar_status: 'A', // Active
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        pasar_code: 'PSR0002',
        pasar_nama: 'Pasar Martapura Lama',
        pasar_status: 'A', // Active
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('data_pasars', { // Assumes table name is 'data_pasar'
      pasar_code: ['PSR0001', 'PSR0002'] // Delete the specific markets added
    }, {});
  }
};
