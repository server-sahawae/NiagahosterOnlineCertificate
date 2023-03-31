const Controller = require("../controllers/event");

const routes = require("express").Router();

routes.post("/", Controller.createEvent);
routes.get("/image/:EventId", Controller.getEventImage);
routes.get("/company/:CompanyId", Controller.getEventByCompanyId);
routes.get("/:EventId", Controller.getEventByEventId);

module.exports = routes;
