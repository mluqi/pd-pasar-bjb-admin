'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('USER_LEVEL_AKSES', [
      { LEVAC_CODE: 'SUA_AKSES_01', LEVAC_MASTER: 'SUA', LEVAC_MENU: '1' },
      { LEVAC_CODE: 'SUA_AKSES_02', LEVAC_MASTER: 'SUA', LEVAC_MENU: '2' },
      { LEVAC_CODE: 'SUA_AKSES_03', LEVAC_MASTER: 'SUA', LEVAC_MENU: '3' },
      { LEVAC_CODE: 'SUA_AKSES_04', LEVAC_MASTER: 'SUA', LEVAC_MENU: '4' },
      { LEVAC_CODE: 'SUA_AKSES_05', LEVAC_MASTER: 'SUA', LEVAC_MENU: '5' },
      { LEVAC_CODE: 'SUA_AKSES_06', LEVAC_MASTER: 'SUA', LEVAC_MENU: '6' },
      { LEVAC_CODE: 'SUA_AKSES_07', LEVAC_MASTER: 'SUA', LEVAC_MENU: '7' },
      { LEVAC_CODE: 'SUA_AKSES_08', LEVAC_MASTER: 'SUA', LEVAC_MENU: '8' },
      { LEVAC_CODE: 'SUA_AKSES_09', LEVAC_MASTER: 'SUA', LEVAC_MENU: '9' },

      // Akses untuk Petugas (PTG)
      { LEVAC_CODE: 'PTG_AKSES_01', LEVAC_MASTER: 'PTG', LEVAC_MENU: '1' },  
      { LEVAC_CODE: 'PTG_AKSES_02', LEVAC_MASTER: 'PTG', LEVAC_MENU: '2' }, 
      { LEVAC_CODE: 'PTG_AKSES_03', LEVAC_MASTER: 'PTG', LEVAC_MENU: '3' },  
      { LEVAC_CODE: 'PTG_AKSES_04', LEVAC_MASTER: 'PTG', LEVAC_MENU: '4' },  
      { LEVAC_CODE: 'PTG_AKSES_05', LEVAC_MASTER: 'PTG', LEVAC_MENU: '5' },

      // Akses untuk Pengguna (PGN)
      { LEVAC_CODE: 'PGN_AKSES_01', LEVAC_MASTER: 'PGN', LEVAC_MENU: '1' }, 
      { LEVAC_CODE: 'PGN_AKSES_02', LEVAC_MASTER: 'PGN', LEVAC_MENU: '2' }, 
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('USER_LEVEL_AKSES', null, {});
  }
};
