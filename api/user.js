const { authSecret } = require("../.env");
const jwt = require("jwt-simple");
const bcrypt = require("bcrypt-nodejs");
const { upload } = require("../config/middlewares");
const path = require("path");
const fs = require("fs").promises;

module.exports = (app) => {
  /**
   * Gera um hash para a senha fornecida.
   */
  const getHash = (password, callback) => {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, null, (err, hash) => callback(hash));
    });
  };

  /**
   * Função para deletar o avatar do usuário.
   */
  const deleteAvatar = async (req, res) => {
    const { id } = req.params;
    console.log(`Iniciando deleção de avatar para o usuário ID: ${id}`);

    try {
      const user = await app.db("users").where({ id }).first();

      if (!user || !user.avatarUrl) {
        console.log("Avatar não encontrado para deleção.");
        return res.status(400).json({ error: "Avatar não encontrado." });
      }

      console.log(`Avatar encontrado para deleção: ${user.avatarUrl}`);

      const filename = path.basename(user.avatarUrl);
      const filePath = path.resolve(__dirname, "..", "uploads", filename);
      console.log(`Caminho do arquivo a ser deletado: ${filePath}`);

      try {
        await fs.unlink(filePath); // Utiliza fs.promises.unlink corretamente
        console.log(`Arquivo deletado: ${filePath}`);
      } catch (err) {
        console.error("Erro ao deletar arquivo:", err);
        return res.status(500).json({ error: "Erro ao deletar arquivo." });
      }

      await app.db("users").where({ id }).update({ avatarUrl: null });
      console.log(`Avatar removido para o usuário ID: ${id}`);
      res.json({ message: "Avatar removido com sucesso." });
    } catch (error) {
      console.error("Erro ao remover avatar:", error);
      res.status(500).json({ error: "Erro ao remover avatar." });
    }
  };

  /**
   * Função para fazer upload do avatar do usuário.
   */
  const uploadAvatar = async (req, res) => {
    const { id } = req.params;
    console.log(`Iniciando upload de avatar para o usuário ID: ${id}`);

    if (!req.file) {
      console.error("Nenhum arquivo enviado.");
      return res.status(400).json({ error: "Nenhum arquivo enviado." });
    }

    const avatarUrl = `http://localhost:3000/files/${req.file.filename}`;
    console.log(`Avatar URL gerado: ${avatarUrl}`);

    try {
      await app.db("users").where({ id }).update({ avatarUrl });
      const user = await app.db("users").where({ id }).first();
      const payload = {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      };
      const token = jwt.encode(payload, authSecret);
      console.log(`Avatar atualizado para o usuário ID: ${user.id}`);
      res.json({ ...payload, token });
    } catch (err) {
      console.error("Erro ao atualizar avatar:", err);
      res.status(400).json({ error: "Erro ao atualizar avatar" });
    }
  };

  /**
   * Edit a user in the database.
   *
   */
  const update = async (req, res) => {
    const userToUpdate = {
      name: req.body.name,
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

  return { save, update, remove, uploadAvatar, deleteAvatar };
};
