const nodemailer = require('nodemailer');

const sendMail = async (options) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2) Define the email options
  const emailOptions = {
    from: '"Desmond Miles" <milesdesmond53@gmail.com>', // sender address
    to: options.email, // list of receivers
    subject: options.subject, // Subject line
    text: options.message,
  };

  // 3) Send the email
  await transporter.sendMail(emailOptions);
};

module.exports = sendMail;
