const { Op } = require("sequelize");
const { Logo, CertificateTemplate, Event } = require("../models");
const fs = require("fs");
const redisFile = require("../config/redisFiles");
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

  static async getLogoImage(req, res, next) {
    try {
      console.log("masuk get logo");
      const { LogoId } = req.params;
      const redisItem = await redisFile.get(`logo:${LogoId}`);
      let result;
      if (!redisItem) {
        const { file } = await Logo.findOne({ where: { id: LogoId } });
        result = file;
        await redisFile.set(`logo:${LogoId}`, JSON.stringify(result, null, 2));
      } else {
        result = JSON.parse(redisItem);
      }
      res.type("image/png").send(Buffer.from(result));
    } catch (error) {
      next(error);
    }
  }
};
