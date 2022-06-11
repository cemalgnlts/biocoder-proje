const ililce = require("../libs/ililce.json");
const productTypes = require("../libs/productTypes.json");

const { productFormControl } = require("../libs/formController");

const User = require("../models/User");
const Product = require("../models/Product");

const Heat = require("../models/Heat");
const Moisture = require("../models/Moisture");
const Weight = require("../models/Weight");

module.exports.getHomePage = async (req, res) => {
    let user;

    try {
        user = await User.findById(req.session.user);
    } catch (err) {
        console.error(err);
        res.redirect("/");
        return;
    }

    res.render("dashboard", {
        title: "Dashboard",
        userName: user.name,
        ililce,
        productTypes
    });
};

module.exports.addProduct = async (req, res) => {
    if (!productFormControl(req.body)) {
        res.sendStatus(401);
        return;
    }

    let ret = { ok: true };

    try {
        const productId = await Product.save(req.session.user, req.body);
        await Moisture.save(productId, req.body.moisture);
        await Weight.save(productId, req.body.weight);
        await Heat.save(productId, req.body.heat);
    } catch (err) {
        console.error(err);
        ret.ok = false;
        ret.message = err.message;
    }

    res.send(ret);
}

module.exports.getProductsPage = async (req, res) => {
    let ret = null;

    try {
        ret = await Product.getAll(req.session.user);
    } catch (err) {
        console.error(err);
    }

    res.render("products", {
        title: "Ürünler",
        products: ret
    });
}

module.exports.getProductEditPage = async (req, res) => {
    let product;
    let heat;
    let moisture;
    let weight;

    try {
        product = await Product.getProduct(req.session.user, req.params.id);
        heat = await Heat.findByIdProductId(product.id);
        moisture = await Moisture.findByIdProductId(product.id);
        weight = await Weight.findByIdProductId(product.id);
    } catch (err) {
        console.error(err);
    }

    res.render("productEdit", {
        title: "Ürün Detay",
        ililce,
        productTypes,
        product,
        heat,
        moisture,
        weight,
    });
};

module.exports.deleteProduct = async (req, res) => {
    let ret = { ok: true };

    try {
        await Product.deleteProduct(req.session.user, req.params.id);
    } catch (err) {
        console.error(err);
        ret.ok = false;
        ret.message = err.message;
    }

    res.send(ret);
};

module.exports.updateProductData = async (req, res) => {
    let ret = { ok: true };

    const map = {
        "info": Product,
        "heat": Heat,
        "moisture": Moisture,
        "weight": Weight
    };

    try {
        await map[req.params.type].update(req.params.id, req.body);
        ret.type = req.params.type;
    } catch (err) {
        console.error(err);
        ret.ok = false;
        ret.message = err.message;
    }

    res.send(ret);
}
