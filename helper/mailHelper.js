const sgMail = require("@sendgrid/mail");
const dotenv = require("dotenv");
// const nodemailer = require("nodemailer");
// const transport = nodemailer.createTransport({
//   service: "SendGrid",
//   auth: {
//     user: "hemantmodi@gmail.com",
//     pass: "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",
//   },
//   port: 587,
//   host: "smtp.sendgrid.net",
// });
sgMail.setApiKey(
  "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"
);
async function sendEmail(to, from, subject, data) {
  const msg = {
    to: to, // Change to your recipient
    from: "arabboardorg@gmail.com", // Change to your verified sender
    subject: subject,
    html: data,
  };
  try {
    sgMail.send(msg);
  } catch (error) {
    console.log(err);
    throw new Error(error);
  }

  //reportName
  //fromDate
  //toDate
  //note

  // try {
  //   transport.sendMail({
  //     to: to,
  //     from: from,
  //     subject: subject,
  //     html: data,
  //   });
  //   return "sent successfull";
  // } catch (err) {
  //   throw err;
  // }
}
exports.sendEmail = sendEmail;
