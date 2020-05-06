const express = require("express");
const routes = require("./routes");
const path = require("path");
const bodyParser = require("body-parser");

//DB
const db = require("./config/db");
require("./models/Proyectos");
db.sync()
  .then(() => console.log("Conectado al servidor"))
  .catch((err) => console.log(err));

//Server
const app = express();

//Static Assets
app.use(express.static("public"));

//TemplateEngine
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "./views"));

//BodyParser
app.use(bodyParser.urlencoded({ extended: true }));

//Rutas<
app.use("/", routes());

//Port
app.listen(3000);