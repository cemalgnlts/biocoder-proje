const { Router } = require("express");

const dashboardController = require("../controllers/dashboardController");

const route = new Router();

route.patch("/products/:type/:id", dashboardController.updateProductData);
route.get("/products/:id", dashboardController.getProductEditPage);
route.get("/products", dashboardController.getProductsPage);

route.delete("/:id", dashboardController.deleteProduct);
// route.patch("/:id", dashboardController.updateProduct);
route.post("/", dashboardController.addProduct);
route.get("/", dashboardController.getHomePage);

module.exports = route;