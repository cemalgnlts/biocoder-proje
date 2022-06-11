const { registerFormControl } = require("../libs/formController");

const errorMessages = require("../libs/errorMessages.json");
const User = require("../models/User");

const defaultValues = {
    title: "Kayıt Ol",
    action: "register",
    formTitle: "Kayıt Ol",
    formSubmitText: "Kayıt Ol",
    otherFormText: "Hesabınıza giriş yapmak için",
    otherFormLinkText: "tıklayın.",
    otherFormLink: "/"
};

module.exports.getRegisterPage = (req, res) => {
    res.render("register", defaultValues);
};

module.exports.saveUser = async (req, res) => {
    if (!registerFormControl(req.body)) {
        res.sendStatus(401);
        return;
    }

    try {
        await User.save(req.body);
    } catch (error) {
        res.render("register", {
            formData: req.body,
            error: errorMessages[error.code] || error,
            ...defaultValues
        });
        return;
    }

    res.redirect("/");
};