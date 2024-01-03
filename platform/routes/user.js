const express = require("express");
const { connection } = require("../config/db");
const fs = require("fs");
const router = express.Router();
const requestIp = require("request-ip");
router.get("/", (req, res) => {
  res.render("user/login");
});

router.get("/register", (req, res) => {
  res.render("user/register");
});

router.get("/control", (req, res) => {
  res.render("user/control");
});

router.get("/history", (req, res) => {
  res.render("user/history");
});

router.post("/register", async (req, res) => {
  console.log(req.body);
  const { user_name, password, password1 } = req.body;
  let u = req.body.user_name;
  let p = req.body.password;
  let ag = req.body.password1;
  if (p === ag) {
    connection.connect(function (err) {
      if (err) throw err;
      var sql =
        "INSERT INTO Register (Account, Password) VALUES ('" +
        u +
        "', '" +
        p +
        "')";
      connection.query(sql, function (err, result) {
        if (err) throw err;
      });
    });
    res.redirect("/user");
  } else {
    res.render("user/register");
  }
});

module.exports = router;
