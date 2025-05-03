'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Change the column 'pasar_code' in table 'data_pasar' to STRING type
    await queryInterface.changeColumn('data_pasars', 'pasar_code', { // <<< Verify 'data_pasar' is your correct table name
      type: Sequelize.STRING, // Change the type to STRING
      allowNull: false,       // Codes should not be null
      unique: true            // Codes should be unique
    });
  },

  async down (queryInterface, Sequelize) {
    // Revert the column 'pasar_code' back to INTEGER if needed
    // Warning: Data loss might occur if strings were inserted before reverting.
    await queryInterface.changeColumn('data_pasars', 'pasar_code', { // <<< Verify 'data_pasar' is your correct table name
      type: Sequelize.INTEGER, // Change back to the original type (assuming it was INTEGER)
      allowNull: false
      // Remove unique: true if it wasn't unique before
    });
  }
};
