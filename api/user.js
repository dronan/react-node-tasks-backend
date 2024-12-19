const bcrypt = require("bcrypt-nodejs");

module.exports = (app) => {
  /**
   * Generates a hash for the given password.
   *
   * @param {string} password - The password to be hashed.
   * @param {function} callback - The callback function to be called with the generated hash.
   */
  const getHash = (password, callback) => {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, null, (err, hash) => callback(hash));
    });
  };

  /**
   * Saves a new user to the database.
   *
   * @param {Object} req - The request object.
   * @param {Object} req.body - The body of the request.
   * @param {string} req.body.name - The name of the user.
   * @param {string} req.body.email - The email of the user.
   * @param {string} req.body.password - The password of the user.
   * @param {Object} res - The response object.
   */
  const save = (req, res) => {
    getHash(req.body.password, (hash) => {
      const password = hash;

      app
        .db("users")
        .insert({
          name: req.body.name,
          email: req.body.email,
          password,
        })
        .then((_) => res.status(204).send())
        .catch((err) => res.status(400).json(err));
    });
  };

  return { save };
};
