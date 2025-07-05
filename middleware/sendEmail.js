const formData = require('form-data');
  const Mailgun = require('mailgun.js');
  const mailgun = new Mailgun(formData);
  const dotenv = require("dotenv");
  dotenv.config({ path: "./config.env" });



  // const mailgun = new Mailgun(formData); // Properly instantiate Mailgun.js
  const DOMAIN = "sandbox72ba21b6982c4548ac4eb23d3ae91739.mailgun.org";
  const mg = mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API // Load API key from .env file
  });
  
  // const sendEmail = async () => {
  function sendEmail(bname, b_email){
    const data = {
      from: "Mailgun Sandbox <postmaster@sandbox72ba21b6982c4548ac4eb23d3ae91739.mailgun.org>",
      // to: "gmail.com",
      to: b_email,
      // subject: "Hello",
      template: "test form template", // Ensure the template exists in Mailgun
      'h:X-Mailgun-Variables': JSON.stringify({ test: "test" ,
        subject: "We Got You! You're In! Let's Grow Together 🚀",
        name:bname
      }),
    };
  
    try {
      const body =  mg.messages.create(DOMAIN, data); // Use `create` to send email
      console.log("Email sent successfully:", body);
    } catch (error) {
      console.error("Error sending email:", error);
    }
    return
  };

  module.exports =  sendEmail ;