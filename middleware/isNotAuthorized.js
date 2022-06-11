module.exports = (req, res, next) => {
    if (req.session.user)
        return res.redirect("/dashboard");
    next();
};