const { upload } = require("./middlewares");

module.exports = (app) => {
  app.post("/signup", app.api.user.save);
  app.post("/signin", app.api.auth.signin);
  app.put("/users/save/:id", app.api.user.update);
  app.delete("/users/delete/:id", app.api.user.remove);

  app
    .route("/users/:id/avatar")
    .put(
      app.config.passport.authenticate(),
      upload.single("avatar"),
      app.api.user.uploadAvatar
    );

  app
    .route("/users/:id/avatar/remove")
    .put(app.config.passport.authenticate(), app.api.user.deleteAvatar);

  app
    .route("/tasks")
    .all(app.config.passport.authenticate())
    .get(app.api.task.getTasks)
    .post(app.api.task.save);

  app
    .route("/tasks/:id")
    .all(app.config.passport.authenticate())
    .delete(app.api.task.remove);

  app
    .route("/tasks/:id/toggle")
    .all(app.config.passport.authenticate())
    .put(app.api.task.toggleTask);
};
