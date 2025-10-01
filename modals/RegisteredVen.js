
const mongoose = require('mongoose')
const express = require("express");


const documentSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    required: true,
  },
  s3Key: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});


const registeredVenSchema = new mongoose.Schema({
   
    firstname: String,
    lastname: String,
    storeName:String,
    storeURL:String,
    phone:Number,
    email:String,
    B_name:String,
    extLinks:String,
    add_line1:String,
    add_line2:String,
    city:String,
    pincode:String,
    state:String,
    gstin:String,
    pan:String,
    bank_ac_number:String,
    ifsc:String,
    documents: [documentSchema], // Embedded subdocs array
 lastupdate:{
      type: Date,
      default: Date.now,
    },
   
    
    Date:{ type:Date,
        default:Date.now},
        applicationStatus: {
            type: String,
            enum: ["Pending","InReview" ,"Approved", "Rejected"],
            default: "InReview", 
          },
          attempt:{
            type:Number,
            default:1,
          },

    LastchangeDate: {
  type: Date,
  default: null
}

})
const registeredVen = mongoose.model('registeredVen', registeredVenSchema);
module.exports = registeredVen;