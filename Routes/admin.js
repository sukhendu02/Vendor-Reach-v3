const hbs = require("hbs");
const path = require("path");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");

// REQUIRE FLASH
const flash = require("express-flash");
app.use(flash());

const jwt = require("jsonwebtoken");

const bcrypt = require("bcrypt");
// const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const cookieParser = require("cookie-parser");
const adminauth = require("../middleware/adminauth");
app.use(cookieParser());

const adminuser = require("../modals/adminuser");
const leadForms = require("../modals/leadFrom");

module.exports = function (app) {
  app.get("/admin", adminauth, (req, res) => {
    res.render("./admin/admin.hbs", { title: "Admin Dashboard" });
  });
  app.get("/admin/leads", adminauth, async (req, res) => {
    const lead = await leadForms.find({}).sort({ date: -1 });
    res.render("./admin/leads.hbs", {
      lead,
    });
  });

  app.get("/admin/profile", adminauth, (req, res) => {
    var mydata = req.data;

    res.render("./admin/admin-profile.hbs", {
      username: req.data.username,
      email: req.data.email,
      role: req.data.role,
    });
  });

  app.post("/admin-register", (req, res) => {
    const { username, email, securitykey, role, password } = req.body;
    // console.log(username,email,securitykey,role,password)
    if (securitykey != process.env.ADMINSIGNUPSEC_KEY) {
      return res.render("./Admin/admin-login.hbs", { error: true });
    }
    if (password.length < 8) {
      return res.render("./Admin/admin-login.hbs", { error: true });
    }

    adminuser
      .findOne({ email: email })
      .then((adminuserExist) => {
        if (adminuserExist) {
          return res
            .status(422)
            .render("./Admin/admin-login.hbs", { error: true });
        }

        var myData = new adminuser(req.body);
        // console.log(req.body);

        myData
          .save()
          .then(() => {
            res.render("./Admin/admin-login.hbs", {
              success: true,
            });
          })
          .catch(() => {
            res.send("error");
          });
      })
      .catch(() => {
        res.send("findone error");
      });
  });

  app.post("/admin-login", async (req, res) => {
    try {
      let admintoken;
      const { email, password } = req.body;

      const adminuserlogin = await adminuser.findOne({ email: email });

      if (adminuserlogin) {
        const matched = await bcrypt.compare(password, adminuserlogin.password);
        // console.log(matched)

        if (!matched) {
          // console.log('hi from not matched')
          res.status(400).render("./Admin/admin-login.hbs", {
            loginerror: true,
          });
        } else {
          admintoken = await adminuserlogin.generateAuthToken();
          // console.log(token);
          res.cookie("adminjwt", admintoken, {
            expires: new Date(Date.now() + 28800000),
            httpOnly: true,
          });
          res.redirect("/admin");
        }
      } else {
        res.render("./Admin/admin-login.hbs", {
          loginerror: true,
        });
      }
    } catch (error) {
      res.send("login-error");
    }
  });
  //  LOGOUT ROUTES           //

  app.get("/admin-logout", adminauth, async (req, res) => {
    try {
      //          DELETING CURRENT TOKEN FROM DATABSE         ///

      req.data.tokens = req.data.tokens.filter((currentToken) => {
        return currentToken.token != req.token;
      });

      //          OR JUST CLEAR COOKIES           //
      res.clearCookie("adminjwt");

      await req.data.save();
      res.redirect("/admin");
    } catch {
      res.status(500).send("error");
    }
  });
};
