'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('LOG_AKSES', [
      {
        AKSES_USER: 'user1',
        AKSES_IP: '192.168.1.1',
        AKSES_BROWSER: 'Chrome',
        AKSES_STATUS: 'Success',
        AKSES_RECORD: new Date(),
      },
      {
        AKSES_USER: 'user2',
        AKSES_IP: '192.168.1.2',
        AKSES_BROWSER: 'Firefox',
        AKSES_STATUS: 'Failed',
        AKSES_RECORD: new Date(),
      },
      {
        AKSES_USER: 'user3',
        AKSES_IP: '192.168.1.3',
        AKSES_BROWSER: 'Safari',
        AKSES_STATUS: 'Success',
        AKSES_RECORD: new Date(),
      },
      {
        AKSES_USER: 'user4',
        AKSES_IP: '192.168.1.4',
        AKSES_BROWSER: 'Safari',
        AKSES_STATUS: 'Success',
        AKSES_RECORD: new Date(),
      },
      {
        AKSES_USER: 'user4',
        AKSES_IP: '192.168.1.4',
        AKSES_BROWSER: 'Safari',
        AKSES_STATUS: 'Success',
        AKSES_RECORD: new Date(),
      },
      {
        AKSES_USER: 'user4',
        AKSES_IP: '192.168.1.4',
        AKSES_BROWSER: 'Safari',
        AKSES_STATUS: 'Success',
        AKSES_RECORD: new Date(),
      },
      {
        AKSES_USER: 'user4',
        AKSES_IP: '192.168.1.4',
        AKSES_BROWSER: 'Safari',
        AKSES_STATUS: 'Success',
        AKSES_RECORD: new Date(),
      },
      {
        AKSES_USER: 'user4',
        AKSES_IP: '192.168.1.4',
        AKSES_BROWSER: 'Safari',
        AKSES_STATUS: 'Success',
        AKSES_RECORD: new Date(),
      },
      {
        AKSES_USER: 'user4',
        AKSES_IP: '192.168.1.4',
        AKSES_BROWSER: 'Safari',
        AKSES_STATUS: 'Success',
        AKSES_RECORD: new Date(),
      },
      {
        AKSES_USER: 'user4',
        AKSES_IP: '192.168.1.4',
        AKSES_BROWSER: 'Safari',
        AKSES_STATUS: 'Success',
        AKSES_RECORD: new Date(),
      },
      {
        AKSES_USER: 'user4',
        AKSES_IP: '192.168.1.4',
        AKSES_BROWSER: 'Safari',
        AKSES_STATUS: 'Success',
        AKSES_RECORD: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('LOG_AKSES', null, {});
  },
};