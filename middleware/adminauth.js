const hbs = require("hbs");
const path = require("path");
const express = require("express");
const app = express();
// const mongoose = require('mongoose');
// const PPinterview = require('./modals/ppinterview');
// const interview_exp = require('./modals/interview_exp');
const bodyParser = require("body-parser");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const cookieParser = require("cookie-parser");

const adminuser = require("../modals/adminuser");

const adminauth = async (req, res, next) => {
  try {
    const token = req.cookies.adminjwt;
    // console.log(token)
    const verifyUser = jwt.verify(token, process.env.ADMINSEC_KEY);
    // console.log('hi from verify user')

    const data = await adminuser.findOne({ _id: verifyUser._id });
    // console.log(data)
    req.token = token;
    req.data = data;
    next();
  } catch {
    res.status(401).render("./admin/admin-login.hbs");
  }
};

module.exports = adminauth;
