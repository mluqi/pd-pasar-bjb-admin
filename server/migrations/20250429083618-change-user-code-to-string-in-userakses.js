'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Change the column 'user_code' in table 'userakses' to STRING type
    await queryInterface.changeColumn('userakses', 'user_code', { // Ensure 'userakses' is your correct table name
      type: Sequelize.STRING, // Change the type to STRING
      allowNull: false 
    });
  },

  async down (queryInterface, Sequelize) {
    // Revert the column 'user_code' back to INTEGER if needed (use the original type)
    // Be cautious with down migrations involving type changes, data might be lost/truncated.
    await queryInterface.changeColumn('userakses', 'user_code', { // Ensure 'userakses' is your correct table name
      type: Sequelize.INTEGER, // Change back to the original type (assuming it was INTEGER)
      allowNull: false 
    });
  }
};
