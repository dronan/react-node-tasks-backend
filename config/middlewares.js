const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const express = require("express");
const passport = require("passport");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, "..", "uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

module.exports = {
  initialize: (app) => {
    app.use(bodyParser.json());
    app.use(cors({ origin: "*" }));
    app.use(passport.initialize());
    app.use("/files", express.static(path.resolve(__dirname, "..", "uploads")));
  },
  upload,
};
