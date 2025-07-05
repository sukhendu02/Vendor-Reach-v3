const axios = require('axios');
require('dotenv').config();

const sendEmail = async (name, toEmail) => {
  try {
    await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: {
          name: 'Team Aabhaar',
          email: process.env.SUPPORTEMAIL,
        },
        to: [
          {
            email: toEmail,
          },
        ],
       'templateId':2,
       'params':{
        "name": name,
        
       }
      },
      {
        headers: {
          'api-key': process.env.BREVO_APIKEY,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`Email successfully sent to ${toEmail}`);
  } catch (error) {
    console.error(`Email failed to ${toEmail}:`, error.response?.data || error.message);
  }
};

module.exports = sendEmail;
