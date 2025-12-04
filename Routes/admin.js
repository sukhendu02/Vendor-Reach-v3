const hbs = require("hbs");
const path = require("path");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
// const NonRegisteredVen= require("../modals/NonRegisteredVen");


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
const registeredVen = require("../modals/RegisteredVen");
const NonRegisteredVen= require("../modals/NonRegisteredVen");
const QueryForm = require("../modals/QueryForm");
const user = require("../modals/User");
// const QueryForm = require("../modals/QueryForm");

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


  app.get("/admin/queries", adminauth, async (req, res) => {
    const allquery = await QueryForm.find({}).sort({ date: -1 });
    // console.log(allquery);
    res.render("./admin/adminQuery.hbs", {
      allquery,
    });
  })
  app.get("/admin/users", adminauth, async (req, res) => {
    const alluser = await user.find({}).sort({ date: -1 });
    // console.log(alluser);
    res.render("./admin/admin-user.hbs", {
      alluser,
    });
  })

  

  // check for the firstname or firstName for the registered vendor schema


  app.get("/admin/reg/approve-vendor",adminauth,async(req,res)=>{
    const registerVendor = await registeredVen.find({}).sort({date:-1})
    const InReviewregVendor = await registeredVen.find({"applicationStatus":"InReview"}).sort({date:-1})
    const approvedregVendor = await registeredVen.find({"applicationStatus":"Approved"}).sort({date:-1})
    const rejectregVendor = await registeredVen.find({ applicationStatus: { $in: ["Pending", "Rejected"] }}).sort({date:-1})
    // console.log(registerVendor)
    
    const totalCount = await registeredVen.find({"applicationStatus":"InReview"}).countDocuments()
    // console.log(totalCount)
 
    res.render("./admin/admin-newvendor.hbs",{
      registerVendor,totalCount,approvedregVendor,InReviewregVendor,rejectregVendor
    })
  })
 
  app.post("/admin/reg/approve-vendor/:id",adminauth,async(req,res)=>{
   try {
    const vendor = await registeredVen.findById(req.params.id);
    if (!vendor) 
      return res.render("./admin/admin-newvendor.hbs", {
        error_msg: "Vendor not found",
      });
    // res.status(404).redi("Vendor not found");

    if(vendor.attempt> 3) {
      req.flash('error_msg', 'Vendor has exceeded the maximum number of attempts.');
      return res.redirect('/admin/reg/approve-vendor');
    }

    vendor.applicationStatus = "Approved";
    vendor.lastupdate = new Date();

    await vendor.save();

    // await sendApprovalEmail(vendor.email, vendor.firstname);
req.flash('success_msg'," approved successfully! Email sent.");
    res.redirect('/admin/reg/approve-vendor');
  } catch (err) {
    console.error("Approval error:", err);
    
    req.flash('error_msg', 'Something went wrong during approval.');
    // res.status(500).send("Error approving vendor");
    res.redirect('/admin/reg/approve-vendor');
  }

  })
//   app.post("/admin/reg/approve-vendor/:id",adminauth,async(req,res)=>{
//    try {
//     const vendor = await registeredVen.findById(req.params.id);
//     if (!vendor) 
//       return res.render("./admin/admin-newvendor.hbs", {
//         error_msg: "Vendor not found",
//       });
//     // res.status(404).redi("Vendor not found");

//     vendor.applicationStatus = "Approved";
//     vendor.lastupdate = new Date();

//     await vendor.save();

//     // await sendApprovalEmail(vendor.email, vendor.firstname);
// req.flash('success_msg'," approved successfully! Email sent.");
//     res.redirect('/admin/reg/approve-vendor');
//   } catch (err) {
//     console.error("Approval error:", err);
    
//     req.flash('error_msg', 'Something went wrong during approval.');
//     // res.status(500).send("Error approving vendor");
//     res.redirect('/admin/reg/approve-vendor');
//   }

//   })
  app.post("/admin/reg/reject-vendor/:id",adminauth,async(req,res)=>{
   try {
    const vendor = await registeredVen.findById(req.params.id);
    if (!vendor) 
      return res.render("./admin/admin-newvendor.hbs", {
        error_msg: "Vendor not found",
      });
    // res.status(404).redi("Vendor not found");
      if(vendor.attempt>=3) {

        vendor.applicationStatus = "Rejected";
      }
      else{
        vendor.applicationStatus = "Pending";
      
      }
    vendor.lastupdate = new Date();

    await vendor.save();

    // await sendApprovalEmail(vendor.email, vendor.firstname);
req.flash('success_msg'," Vendor Rejected! Email sent.");
    res.redirect('/admin/reg/approve-vendor');
  } catch (err) {
    console.error("Reject error:", err);
    
    req.flash('error_msg', 'Something went wrong during approval.');
    // res.status(500).send("Error approving vendor");
    res.redirect('/admin/reg/approve-vendor');
  }

  })


// -----------Non-Registered Vendor Approval-----------



   app.get("/admin/nonreg/approve-vendor",adminauth,async(req,res)=>{
    const nonregVendor = await NonRegisteredVen.find({}).sort({date:-1})
    const InReviewnonregVendor = await NonRegisteredVen.find({"applicationStatus":"InReview"}).sort({date:-1})
    const approvedNonregVendor = await NonRegisteredVen.find({"applicationStatus":"Approved"}).sort({date:-1})
   
  //  Get all non-registered vendors with Pending or Rejected status

    // const rejectNonregVendor = await NonRegisteredVen.find({"applicationStatus":"Pending" && "Rejected"}).sort({date:-1})
    const rejectNonregVendor = await NonRegisteredVen.find({
  applicationStatus: { $in: ["Pending", "Rejected"] }
}).sort({ date: -1 });

    // console.log(registerVendor)
    
    const totalCount = await NonRegisteredVen.countDocuments({"applicationStatus":"InReview"});
    // console.log(totalCount)
    res.render("./admin/admin-nonreg.hbs",{
      rejectNonregVendor,
      approvedNonregVendor,
      InReviewnonregVendor,
      totalCount
    })
  })
  app.post("/admin/nonreg/approve-vendor/:id",adminauth,async(req,res)=>{
   try {
    const vendor = await NonRegisteredVen.findById(req.params.id);
    if (!vendor) 
      return res.render("./admin/admin-nonreg.hbs", {
        error_msg: "Vendor not found",
      });
    // res.status(404).redi("Vendor not found");

    if(vendor.attempt> 3) {
      req.flash('error_msg', 'Vendor has exceeded the maximum number of attempts.');
      return res.redirect('/admin/reg/approve-vendor');
    }
    vendor.applicationStatus = "Approved";
    vendor.approvalDate = new Date();

    await vendor.save();

    // await sendApprovalEmail(vendor.email, vendor.firstname);
req.flash('success_msg'," approved successfully! Email sent.");
    res.redirect('/admin/nonreg/approve-vendor');
  } catch (err) {
    console.error("Approval error:", err);
    
    req.flash('error_msg', 'Something went wrong during approval.');
    // res.status(500).send("Error approving vendor");
    res.redirect('/admin/nonreg/approve-vendor');
  }

  })
    app.post("/admin/nonreg/reject-vendor/:id",adminauth,async(req,res)=>{
   try {
    const vendor = await NonRegisteredVen.findById(req.params.id);
    if (!vendor) 
      return res.render("./admin/admin-nonreg.hbs", {
        error_msg: "Vendor not found",
      });
    // res.status(404).redi("Vendor not found");

    // vendor.applicationStatus = "Rejected";
     if(vendor.attempt>=3) {

        vendor.applicationStatus = "Rejected";
      }
      else{
        vendor.applicationStatus = "Pending";
      
      }
    vendor.lastupdate = new Date();

    await vendor.save();

    // await sendApprovalEmail(vendor.email, vendor.firstname);
req.flash('success_msg'," Vendor Rejected! Email sent.");
    res.redirect('/admin/nonreg/approve-vendor');
  } catch (err) {
    console.error("Reject error:", err);
    
    req.flash('error_msg', 'Something went wrong during approval.');
    // res.status(500).send("Error approving vendor");
    res.redirect('/admin/nonreg/approve-vendor');
  }

  })


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
            res.render("./admin/admin-login.hbs", {
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
          res.status(400).render("./admin/admin-login.hbs", {
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
        res.render("./admin/admin-login.hbs", {
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
