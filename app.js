// app.js

const express = require("express");
const path = require("path");
const hbs = require("hbs");
const app = express();
const mongoose = require("mongoose");
const PORT = 8000;

const session = require("express-session");

var bodyParser = require("body-parser");

const cookieParser = require("cookie-parser");
app.use(cookieParser());

//  BODY PARSER
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

// env IMPORT

const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

// ROUTES IMPORT

// REQUIRE SESSION
// const session = require('express-session');
// app.set('trust proxy', 1) // trust first proxy
// app.use(session({
//   secret: process.env.SESSIONFLASH,
//   resave: false,
//   saveUninitialized: true
// }));

// // REQUIRE FLASH
// const flash = require('express-flash');
// app.use(flash());

// // Make flash messages available to all views
// app.use((req, res, next) => {
//   res.locals.messages = req.flash();
//   // res.locals.failed = req.flash('failed');
//   next();
// });

// CONNECTION TO DATA-BASE OR MONGODB THROUGH MONGOOSE
const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = process.env.MONGODBURL;

const { EFAULT } = require("constants");
const { error, Console } = require("console");

mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("successful"))
  .catch((err) => console.log(err));

// REQUIRE SESSION

app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSIONFLASH,
    resave: false,
    saveUninitialized: true,
  })
);

// REQUIRE FLASH
const flash = require("express-flash");
app.use(flash());

// app.use((req, res, next) => {
//   res.locals.messages = req.flash();
//   next();
// });

const leadForms = require("./modals/leadFrom");
const sendEmail = require("./middleware/sendEmail");

const formRoute = require("./Routes/formRoute")(app);
const admin = require("./Routes/admin")(app);

// Set the viewsdf engine to hbs
app.set("view engine", "hbs");

// Set the views directory
app.set("views", path.join(__dirname, "views"));

hbs.registerHelper("inc", function (value, options) {
  return parseInt(value) + 1;
}); //


const { format } = require('date-fns');



hbs.registerHelper('formatDate', function (date) {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
});

// Register the partials directory
hbs.registerPartials(path.join(__dirname, "views", "partials"));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

// Define a route
app.get("/", (req, res) => {
  // console.log("Flash message set:", req.flash("success")); // Should l

  // sendEmail()
  res.render("index.hbs");
});


app.get('*',(req,res)=>{
  res.render('error.hbs')
})
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
