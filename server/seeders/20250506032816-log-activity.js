'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('LOG_ACTIVITY', [
      {
        LOG_TARGET: 'Dashboard',
        LOG_USER: 'user1',
        LOG_ACTION: 'View',
        LOG_DETAIL: 'User viewed the dashboard',
        LOG_SOURCE: 'Web',
        LOG_RECORD: new Date(),
        LOG_OWNER: 'Admin',
      },
      {
        LOG_TARGET: 'User Management',
        LOG_USER: 'user2',
        LOG_ACTION: 'Edit',
        LOG_DETAIL: 'User edited a profile',
        LOG_SOURCE: 'Web',
        LOG_RECORD: new Date(),
        LOG_OWNER: 'Admin',
      },
      {
        LOG_TARGET: 'Settings',
        LOG_USER: 'user3',
        LOG_ACTION: 'Update',
        LOG_DETAIL: 'User updated settings',
        LOG_SOURCE: 'Mobile',
        LOG_RECORD: new Date(),
        LOG_OWNER: 'Admin',
      },
      {
        LOG_TARGET: 'Settings',
        LOG_USER: 'user3',
        LOG_ACTION: 'Update',
        LOG_DETAIL: 'User updated settings',
        LOG_SOURCE: 'Mobile',
        LOG_RECORD: new Date(),
        LOG_OWNER: 'Admin',
      },
      {
        LOG_TARGET: 'Settings',
        LOG_USER: 'user3',
        LOG_ACTION: 'Update',
        LOG_DETAIL: 'User updated settings',
        LOG_SOURCE: 'Mobile',
        LOG_RECORD: new Date(),
        LOG_OWNER: 'Admin',
      },
      {
        LOG_TARGET: 'Settings',
        LOG_USER: 'user3',
        LOG_ACTION: 'Update',
        LOG_DETAIL: 'User updated settings',
        LOG_SOURCE: 'Mobile',
        LOG_RECORD: new Date(),
        LOG_OWNER: 'Admin',
      },
      {
        LOG_TARGET: 'Settings',
        LOG_USER: 'user3',
        LOG_ACTION: 'Update',
        LOG_DETAIL: 'User updated settings',
        LOG_SOURCE: 'Mobile',
        LOG_RECORD: new Date(),
        LOG_OWNER: 'Admin',
      },
      {
        LOG_TARGET: 'Settings',
        LOG_USER: 'user3',
        LOG_ACTION: 'Update',
        LOG_DETAIL: 'User updated settings',
        LOG_SOURCE: 'Mobile',
        LOG_RECORD: new Date(),
        LOG_OWNER: 'Admin',
      },
      {
        LOG_TARGET: 'Settings',
        LOG_USER: 'user3',
        LOG_ACTION: 'Update',
        LOG_DETAIL: 'User updated settings',
        LOG_SOURCE: 'Mobile',
        LOG_RECORD: new Date(),
        LOG_OWNER: 'Admin',
      },
      {
        LOG_TARGET: 'Settings',
        LOG_USER: 'user3',
        LOG_ACTION: 'Update',
        LOG_DETAIL: 'User updated settings',
        LOG_SOURCE: 'Mobile',
        LOG_RECORD: new Date(),
        LOG_OWNER: 'Admin',
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('LOG_ACTIVITY', null, {});
  },
};