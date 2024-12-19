const moment = require("moment");

module.exports = (app) => {
  /**
   * Retrieves tasks for the authenticated user up to a specified date.
   *
   * @param {Object} req - The request object.
   * @param {Object} req.query - The query parameters.
   * @param {string} [req.query.date] - The optional date to filter tasks by.
   * @param {Object} req.user - The authenticated user object.
   * @param {number} req.user.id - The ID of the authenticated user.
   * @param {Object} res - The response object.
   * @returns {void} Responds with a JSON array of tasks or an error status.
   */
  const getTasks = (req, res) => {
    const date = req.query.date
      ? req.query.date
      : moment().endOf("day").toDate();
    app
      .db("tasks")
      .where({ userId: req.user.id })
      .where("estimateAt", "<=", date)
      .orderBy("estimateAt")
      .then((tasks) => res.json(tasks))
      .catch((err) => res.status(400).json(err));
  };

  /**
   * Saves a new task to the database.
   *
   * @param {Object} req - The request object.
   * @param {Object} req.body - The body of the request.
   * @param {string} req.body.desc - The description of the task.
   * @param {Object} req.user - The user object.
   * @param {number} req.user.id - The ID of the user.
   * @param {Object} res - The response object.
   * @returns {Object} - The response status and message.
   */
  const save = (req, res) => {
    if (!req.body.desc.trim()) {
      return res.status(400).send("Description is required!");
    }
    req.body.userId = req.user.id;
    app
      .db("tasks")
      .insert(req.body)
      .then((_) => res.status(204).send())
      .catch((err) => res.status(400).json(err));
  };

  /**
   * Removes a task from the database.
   *
   * @param {Object} req - The request object.
   * @param {Object} req.params - The request parameters.
   * @param {string} req.params.id - The ID of the task to be removed.
   * @param {Object} req.user - The authenticated user object.
   * @param {string} req.user.id - The ID of the authenticated user.
   * @param {Object} res - The response object.
   * @returns {void}
   */
  const remove = (req, res) => {
    app
      .db("tasks")
      .where({ id: req.params.id, userId: req.user.id })
      .del()
      .then((rowsDeleted) => {
        if (rowsDeleted > 0) {
          return res.status(204).send();
        }
        const msg = `Task with id ${req.params.id} not found!`;
        return res.status(400).send(msg);
      })
      .catch((err) => res.status(400).json(err));
  };

  /**
   * Updates the doneAt timestamp of a task for a specific user.
   *
   * @param {Object} req - The request object.
   * @param {Object} req.params - The request parameters.
   * @param {number} req.params.id - The ID of the task to update.
   * @param {Object} req.user - The authenticated user object.
   * @param {number} req.user.id - The ID of the authenticated user.
   * @param {Object} res - The response object.
   * @param {Date} doneAt - The timestamp indicating when the task was completed.
   */
  const updateTaskDoneAt = (req, res, doneAt) => {
    app
      .db("tasks")
      .where({ id: req.params.id, userId: req.user.id })
      .update({ doneAt })
      .then((_) => res.status(204).send())
      .catch((err) => res.status(400).json(err));
  };

  /**
   * Toggles the completion status of a task.
   *
   * This function retrieves a task by its ID and the user's ID from the database.
   * If the task is found, it toggles the `doneAt` field between `null` and the current date.
   * If the task is not found, it sends a 400 status response with an error message.
   *
   * @param {Object} req - The request object.
   * @param {Object} req.params - The request parameters.
   * @param {string} req.params.id - The ID of the task to toggle.
   * @param {Object} req.user - The authenticated user object.
   * @param {string} req.user.id - The ID of the authenticated user.
   * @param {Object} res - The response object.
   * @returns {void}
   */
  const toggleTask = (req, res) => {
    app
      .db("tasks")
      .where({ id: req.params.id, userId: req.user.id })
      .first()
      .then((task) => {
        if (!task) {
          const msg = `Task with id ${req.params.id} not found!`;
          return res.status(400).send(msg);
        }
        const doneAt = task.doneAt ? null : new Date();
        updateTaskDoneAt(req, res, doneAt);
      })
      .catch((err) => res.status(400).json(err));
  };
  return { getTasks, save, remove, toggleTask };
};
