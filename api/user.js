const { authSecret } = require("../.env");
const jwt = require("jwt-simple");
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
   * Edit a user in the database.
   *
   */
  const update = async (req, res) => {
    const userToUpdate = {
      name: req.body.name,
      avatarUrl: req.body.avatarUrl || null,
    };

    getHash(req.body.password, (hash) => {
      userToUpdate.password = hash;
      app
        .db("users")
        .where({ id: req.params.id })
        .update(userToUpdate)
        .then(async () => {
          const user = await app
            .db("users")
            .where({ id: req.params.id })
            .first();
          const payload = {
            id: user.id,
            name: user.name,
            email: user.email,
            avatarUrl: user.avatarUrl,
            password: req.body.password,
          };
          res.json({
            ...payload,
            token: jwt.encode(payload, authSecret),
          });
        })
        .catch(() =>
          res.status(401).send("An error occurred while saving the user!")
        );
    });
  };

  /**
   * Delete a user from the database.
   */
  const remove = (req, res) => {
    // Delete the user tasks
    app
      .db("tasks")
      .where({ userId: req.params.id })
      .del()
      .then((_) => {
        // Delete the user
        return app.db("users").where({ id: req.params.id }).del();
      })
      .then((_) =>
        app
          .db("users")
          .where({ id: req.params.id })
          .del()
          .then((_) => res.status(204).send())
          .catch(() =>
            res.status(401).send("An error occurred while removing the user!")
          )
      );
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
        .whereRaw("LOWER(email) = LOWER(?)", req.body.email)
        .first()
        .then((user) => {
          if (user) {
            res.status(400).send("This email already exists!");
            throw new Error("UserExists");
          }

          return app.db("users").insert({
            name: req.body.name,
            email: req.body.email.toLowerCase(),
            password,
            avatarUrl: req.body.avatarUrl || null,
          });
        })
        .then(() => res.status(204).send())
        .catch((err) => {
          if (err.message !== "UserExists") {
            res.status(401).send("An error occurred while saving the user!");
          }
        });
    });
  };

  return { save, update, remove };
};
