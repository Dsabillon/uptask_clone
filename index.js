const express = require("express");
const routes = require("./routes");
const path = require("path");
const bodyParser = require("body-parser");
const expressValidator = require("express-validator");
const helpers = require("./helpers");
const flash = require("connect-flash");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const passport = require("./config/passport");
require("dotenv").config({ path: "variables.env" });

//DB
const db = require("./config/db");
require("./models/Proyectos");
require("./models/Tareas");
require("./models/Usuarios");
db.sync()
  .then(() => console.log("Conectado al servidor"))
  .catch((err) => console.log(err));

//Server
const app = express();

//BodyParser
app.use(bodyParser.urlencoded({ extended: true }));

//Static Assets
app.use(express.static("public"));

//TemplateEngine
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "./views"));

//Flash Messages
app.use(flash());

//CookieParser
app.use(cookieParser());

//Sessions
app.use(
  session({
    secret: "supersecreto",
    resave: false,
    saveUninitialized: false,
  })
);

//Passport
app.use(passport.initialize());
app.use(passport.session());

//Vardump
app.use((req, res, next) => {
  res.locals.vardump = helpers.vardump;
  res.locals.mensajes = req.flash();
  res.locals.usuario = { ...req.user } || null;

  next();
});

//Rutas
app.use("/", routes());

//Host
const host = process.env.HOST || "0.0.0.0";

//Port
const port = process.env.PORT || 3000;
app.listen(port, host, () => {
  console.log("El servidor esta funcionando");
});
