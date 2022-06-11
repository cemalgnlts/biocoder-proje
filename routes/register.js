const { Router } = require("express");

const registerController = require("../controllers/registerController");

const route = new Router();

route.get("/", registerController.getRegisterPage);

route.post("/", registerController.saveUser);

module.exports = route;