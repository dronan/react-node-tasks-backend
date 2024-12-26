const express = require("express");
const db = require("./config/db");
const consign = require("consign");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const middlewares = require("./config/middlewares");

middlewares.initialize(app);

app.use("/files", express.static("uploads"));

app.db = db;

consign()
  .include("./config/passport.js")
  .then("./api")
  .then("./config/routes.js")
  .into(app);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Erro Interno do Servidor");
});
