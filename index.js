const app = require("express")();
const db = require("./config/db");
const consign = require("consign");

consign()
  .include("./config/passport.js")
  .then("./config/middlewares.js")
  .then("./api")
  .then("./config/routes.js")
  .into(app);

app.db = db;

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
