const { loginFormControl } = require("../libs/formController");

const errorMessages = require("../libs/errorMessages.json");
const User = require("../models/User");

const defaultValues = {
    title: "Giriş Yap",
    action: "login",
    formTitle: "Giriş Yap",
    formSubmitText: "Giriş Yap",
    otherFormText: "Hesabınız yok mu?",
    otherFormLinkText: "Oluştur.",
    otherFormLink: "/register"
};

module.exports.getPage = (req, res) => {
    res.render("login", defaultValues);
};

module.exports.loadUser = async (req, res) => {
    if (!loginFormControl(req.body)) {
        res.sendStatus(401);
        return;
    }

    try {
        const id = await User.login(req.body);
        req.session.user = id;
    } catch (error) {
        res.render("login", {
            error: errorMessages[error.code] || error,
            ...defaultValues
        });
        return;
    }

    res.redirect("/dashboard");
};