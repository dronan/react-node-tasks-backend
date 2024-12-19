const app = require("express")();
const db = require("./config/db");
const consign = require("consign");

consign().then("./config/middlewares.js").into(app);

app.db = db;

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
