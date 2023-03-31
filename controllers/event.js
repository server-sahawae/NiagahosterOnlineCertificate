const { Op } = require("sequelize");
const { Event } = require("../models");
const redisFile = require("../config/redisFiles");
const { loggerInfo } = require("../helpers/loggerDebug");
const { DATA_NOT_FOUND } = require("../constants/ErrorKeys");
const { filterRedisKeys, deleteRedisKeys } = require("../helpers/redis");
const redisText = require("../config/redisText");
const redisSearch = require("../config/redisSearch");

module.exports = class Controller {
  static async createEvent(req, res, next) {
    try {
      const data = await Event.create({ ...req.body });
      const redisClear = await filterRedisKeys(req.body.CompanyId);
      await deleteRedisKeys(redisClear);
      res.status(200).json(data);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  static async getEventByCompanyId(req, res, next) {
    try {
      const { CompanyId } = req.params;
      const { search } = req.query;
      const redisItem = await redisSearch.get(
        `Event:Company:${CompanyId}:search:${search}`
      );
      let result;
      if (!redisItem) {
        const options = search
          ? {
              [Op.or]: [
                { name: { [Op.substring]: search } },
                { location: { [Op.substring]: search } },
                { description: { [Op.substring]: search } },
              ],
            }
          : {};

        result = await Event.findAll({
          where: { CompanyId, ...options },
          attributes: [
            "id",
            "name",
            "location",
            "time",
            "description",
            "duration",
          ],
          order: [["time", "DESC"]],
        });
        loggerInfo(`SET REDIS: Event:Company:${CompanyId}:search:${search}`);
        await redisSearch.set(
          `Event:Company:${CompanyId}:search:${search}`,
          JSON.stringify(result, null, 2),
          { EX: 60 * 60 * 24 }
        );
      } else result = JSON.parse(redisItem);
      res.status(200).json(result);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  static async getEventByEventId(req, res, next) {
    try {
      const { EventId } = req.params;
      const redisItem = await redisText.get(`Event:${EventId}`);
      let result;
      if (!redisItem) {
        result = await Event.findOne({
          attributes: [
            "id",
            "name",
            "location",
            "time",
            "duration",
            "description",
          ],
          where: { id: EventId },
        });
        loggerInfo(`SET REDIS: Event:${EventId}`);
        await redisText.set(
          `Event:${EventId}`,
          JSON.stringify(result, null, 2),
          { EX: 60 * 60 * 24 }
        );
      } else result = JSON.parse(redisItem);
      res.status(200).json(result);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  static async getEventImage(req, res, next) {
    //REDIS
    try {
      const { EventId } = req.params;
      const redisItem = await redisFile.get(`Event:Image:${EventId}`);
      let result;
      if (!redisItem) {
        const { image } = await Event.findOne({
          where: { id: EventId },
          attributes: ["image"],
        });
        if (!image) throw { name: DATA_NOT_FOUND };
        result = image;
        loggerInfo(`SET REDIS: Event:Image:${EventId}`);
        await redisFile.set(`Event:Image:${EventId}`, JSON.stringify(result), {
          EX: 60 * 60 * 24,
        });
      } else result = JSON.parse(redisItem);
      res.type("image/webp").send(Buffer.from(result));
    } catch (error) {
      next(error);
    }
  }
};
