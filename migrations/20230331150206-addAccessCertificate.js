"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      "Certificates",
      "accessedAt",
      Sequelize.DATE
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Certificates", "accessedAt");
  },
};
