"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Certificate extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Certificate.belongsTo(models.Event);
      Certificate.belongsTo(models.CertificateTemplate, {
        as: "Signature",
        foreignKey: "CertificateTemplateId",
      });
      Certificate.belongsTo(models.CertificateTemplate);
    }
  }
  Certificate.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: DataTypes.STRING,
      origin: DataTypes.STRING,
      phone: DataTypes.STRING,
      status: DataTypes.STRING,
      email: DataTypes.STRING,
      EventId: DataTypes.UUID,
      CertificateTemplateId: DataTypes.UUID,
      accessedAt: DataTypes.DATE,
      // fileType: DataTypes.STRING,
      file: DataTypes.BLOB("medium"),
    },
    {
      sequelize,
      modelName: "Certificate",
    }
  );
  return Certificate;
};
