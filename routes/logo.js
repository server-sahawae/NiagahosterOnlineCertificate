const Controller = require("../controllers/logo");

const routes = require("express").Router();

routes.get("/", Controller.getAllLogoInList);

module.exports = routes;
