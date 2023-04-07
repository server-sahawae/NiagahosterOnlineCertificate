const csvtojsonV2 = require("csvtojson/v2");
const {
  DATA_NOT_FOUND,
  CERTIFICATE_UNAVAILABLE,
} = require("../constants/ErrorKeys");
const { Certificate, Event, CertificateTemplate, Logo } = require("../models");
const redisText = require("../config/redisText");
const { loggerInfo } = require("../helpers/loggerDebug");
const redisFile = require("../config/redisFiles");

module.exports = class Controller {
  static async bulkInsertParticipants(req, res, next) {
    try {
      console.log("=========================================================");
      console.log(req.files.file.size);
      const file = req.files.file.data.toString();
      const { EventId } = req.body;
      console.log("=========================================================");
      const result = await csvtojsonV2({
        trim: true,
        delimiter: ";",
      }).fromString(file);
      const data = result
        .map((el) => {
          el.EventId = EventId;
          return el;
        })
        .filter((el) => el.name.length);
      // console.log(result);
      const insertData = await Certificate.bulkCreate(data);
      res.status(200).json({ message: `${insertData.length} data inserted` });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  static async patchCertificateTemplateParticipantsByStatus(req, res, next) {
    try {
      const { EventId, CertificateTemplateId, status } = req.body;
      console.log({ EventId, CertificateTemplateId, status });
      const data = await Certificate.update(
        { CertificateTemplateId },
        { where: { EventId, status } }
      );
      console.log(data);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  static async getCertificateByPhone(req, res, next) {
    try {
      console.log("on");
      const { eventid: EventId } = req.headers;
      const { phone } = req.params;
      const redisItem = await redisFile.get(
        `CertificateByPhone:${EventId}:${phone}`
      );
      let result;
      await Certificate.update(
        { accessedAt: new Date() },
        { where: { EventId, phone } }
      );
      if (!redisItem) {
        result = await Certificate.findOne({
          where: { phone, EventId },
        });
        if (!result) throw { name: DATA_NOT_FOUND };
        if (!result.file) throw { name: CERTIFICATE_UNAVAILABLE };
        loggerInfo(`SET REDIS: CertificateByPhone:${EventId}:${phone}`);
        await redisFile.set(
          `CertificateByPhone:${EventId}:${phone}`,
          JSON.stringify(result, null, 2),
          { EX: 60 * 60 * 24 }
        );
      } else result = JSON.parse(redisItem);
      const { file } = result;

      res.type("image/png").send(Buffer.from(file));
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  static async getCertificateListByEventId(req, res, next) {
    try {
      const { EventId } = req.params;
      const redisItem = await redisText.get(
        `CertificateListByEventId:${EventId}`
      );
      let result;
      if (!redisItem) {
        result = await Certificate.findAll({
          attributes: ["id", "name", "origin", "phone", "status", "email"],
          where: { EventId },
        });
        loggerInfo(`SET CertificateListByEventId:${EventId}`);
        await redisText.set(
          `CertificateListByEventId:${EventId}`,
          JSON.stringify(result, null, 2),
          { EX: 60 * 60 * 24 }
        );
      } else {
        result = JSON.parse(redisItem);
      }
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getCertificateVerification(req, res, next) {
    try {
      const { CertificateId } = req.params;
      const redisItem = await redisText.get(
        `CertificateVerification:${CertificateId}`
      );
      let result;
      await Certificate.update(
        { accessedAt: new Date() },
        { where: { id: CertificateId } }
      );
      if (!redisItem) {
        result = await Certificate.findOne({
          where: { id: CertificateId },
          attributes: ["id", "name", "status"],
          include: [
            {
              model: Event,
              attributes: [
                "name",
                "location",
                "description",
                "time",
                "duration",
                ["updatedAt", "signedAt"],
              ],
            },
            {
              model: CertificateTemplate,
              as: "Signature",
              attributes: [["signName", "name"]],
              include: [
                {
                  model: Logo,
                  as: "Company",
                  attributes: ["id", "name"],
                },
              ],
            },
          ],
        });
        if (!result) throw { name: DATA_NOT_FOUND };
        loggerInfo(`SET REDIS: CertificateVerification:${CertificateId}`);

        await redisText.set(
          `CertificateVerification:${CertificateId}`,
          JSON.stringify(result, null, 2),
          { EX: 60 * 60 * 24 }
        );
      } else {
        result = JSON.parse(redisItem);
      }
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
};
