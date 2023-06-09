const Controller = require("../controllers/logo");

const routes = require("express").Router();

routes.get("/", Controller.getAllLogoInList);
routes.get("/:LogoId", Controller.getLogoImage);

module.exports = routes;
