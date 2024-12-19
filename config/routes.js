module.exports = (app) => {
  app.post("/signup", app.api.user.save);
  app.post("/signin", app.api.auth.signin);

  app
    .route("/tasks")
    .all(app.config.passport.authenticate()) // Authenthication all routes inside /tasks
    .get(app.api.task.getTasks)
    .post(app.api.task.save);

  app
    .route("/tasks/:id")
    .all(app.config.passport.authenticate()) // Authenthication all routes inside /tasks/:id
    .delete(app.api.task.remove);

  app
    .route("/tasks/:id/toggle")
    .all(app.config.passport.authenticate()) // Authenthication all routes inside /tasks/:id
    .put(app.api.task.toggleTask);
};
