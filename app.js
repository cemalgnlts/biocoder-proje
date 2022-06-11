require("dotenv").config();
const path = require("path");
const express = require("express");
const nunjucks = require("nunjucks");
const session = require("express-session");

const routeDashboard = require("./routes/dashboard");
const routeLogin = require("./routes/login")
const routeRegister = require("./routes/register");
const isAuthorized = require("./middleware/isAuthorized");
const isNotAuthorized = require("./middleware/isNotAuthorized");

const app = express();

app.use(session({
	secret: "~my$3cr3t/4/6/22",
	resave: false,
	saveUninitialized: false,
	cookie: {
		sameSite: "lax"
	}
}));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "njk");
app.set("views", path.join(__dirname, "views"));

require("./libs/databaseConnection");

nunjucksEnv = nunjucks.configure(app.get("views"), {
	autoescape: true,
	express: app
});
nunjucksEnv.addFilter("keys", obj => Object.keys(obj));
nunjucksEnv.addFilter("toLocaleDate", date => date.toLocaleDateString("tr-TR"));
nunjucksEnv.addFilter("toLocaleTime", time => time.split(":").slice(0, 2).join(":"));
nunjucksEnv.addFilter("concat", (arr, txt) => [txt, ...arr]);

app.use("/dashboard", isAuthorized, routeDashboard);
app.use("/register", isNotAuthorized, routeRegister);

app.use("/exit", (req, res) => {
	req.session.destroy(err => {
		console.error(err);
		res.redirect("/");
	});
});

app.use("/", isNotAuthorized, routeLogin);
// app.use("/", isAuthorized, (req, res) => res.redirect("/dashboard"));
app.use("*", (req, res) => res.send("404"));

app.listen(process.env.PORT || 3000, () => console.log(`App listening on http://localhost:${process.env.PORT || 3000}`));
