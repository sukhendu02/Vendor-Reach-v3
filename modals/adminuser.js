const mongoose =require('mongoose')

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const hbs = require('hbs');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv')
dotenv.config({path:'./config.env'})
const cookieParser = require('cookie-parser')
app.use(cookieParser());


const adminuserSchema = new mongoose.Schema({
   
    username: String,
    email: String,
    role:String,
    securitykey:String,
    password:String,
    // cpassword:String,
    Date:{ type:Date,
        default:Date.now},
    tokens:[
        {
            token:{
                type:String,
                required:true
            }
        }
    ]

    

})

adminuserSchema.pre('save', async function (next) {
    // const user = this

    // bcrypt.hash(user.password && user.cpassword, 12, function (error, encrypted) {
    //     user.password = encrypted
    //     user.cpassword = encrypted
        
    //     next()
    // })
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password,12)
        // this.cpassword = await bcrypt.hash(this.cpassword,12)

    }
next();
    
})
adminuserSchema.methods.generateAuthToken = async function(){
    try{
        let token = jwt.sign({_id:this._id}, process.env.ADMINSEC_KEY)
       this.tokens = this.tokens.concat({token:token})
       
       await this.save();
       return token;
    }
    catch{
        res.send('error')
    }
}

const adminuser = mongoose.model('adminuser', adminuserSchema);
module.exports = adminuser;
