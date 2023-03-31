const { Op } = require("sequelize");
const { Logo, CertificateTemplate, Event } = require("../models");
const fs = require("fs");
module.exports = class Controller {
  static async getAllLogoInList(req, res, next) {
    try {
      const data = await Logo.findAll({ attributes: ["name"] });
      res.status(200).json(data);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
};
