const mongoose = require("mongoose");
const express = require("express");
const app = express();
const leadFormSchema = new mongoose.Schema({
  bname: String,
  b_email: String,
  phone: String,
  productBS: String,
  b_type: String,
  info: String,

  date: { type: Date, default: Date.now },
});
const leadForms = mongoose.model("leadForms", leadFormSchema);
module.exports = leadForms;
