'use strict';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('MENU', 'MENU_PARENT_ID', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'MENU', // Nama tabel MENU
        key: 'id',     // Primary key dari tabel MENU
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // Atau 'CASCADE' jika Anda ingin sub-menu terhapus saat parent dihapus
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('MENU', 'MENU_PARENT_ID');
  }
};
