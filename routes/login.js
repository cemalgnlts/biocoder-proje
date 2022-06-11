const { Router } = require("express");

const loginController = require("../controllers/loginController");

const route = new Router();

route.get("/", loginController.getPage);
route.post("/", loginController.loadUser);

module.exports = route;