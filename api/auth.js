const { authSecret } = require("../.env");
const jwt = require("jwt-simple");
const bcrypt = require("bcrypt-nodejs");

module.exports = (app) => {
  const signin = async (req, res) => {
    if (!req.body.email || !req.body.password) {
      return res.status(400).send("Incorrect data!");
    }

    // Search for the user in the database
    const user = await app.db("users").where({ email: req.body.email }).first();

    if (user) {
      // Compare the password sent with the password in the database
      bcrypt.compare(req.body.password, user.password, (err, isMatch) => {
        // If the password is incorrect, return a 401 status code
        if (err || !isMatch) {
          return res.status(401).send();
        }
        // If the password is correct, generate the payload + token and send it to the client
        const payload = {
          id: user.id,
          name: user.name,
          email: user.email,
        };

        res.json({
          ...payload,
          token: jwt.encode(payload, authSecret),
        });
      });
    } else {
      res.status(400).send("User not found!");
    }
  };

  return { signin };
};
