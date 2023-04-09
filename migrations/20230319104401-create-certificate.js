"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "Certificates",
      {
        id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        origin: {
          type: Sequelize.STRING,
        },
        phone: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        status: {
          type: Sequelize.STRING,
        },
        EventId: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: "Events" },
        },
        CertificateTemplateId: {
          type: Sequelize.UUID,
          references: { model: "CertificateTemplates" },
        },
        // fileType: {
        //   type: Sequelize.STRING,
        // },
        file: {
          type: Sequelize.BLOB("medium"),
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      },
      {
        participant: {
          uploadedFile: {
            fields: ["EventId", "phone", "email"],
          },
        },
      }
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Certificates");
  },
};
