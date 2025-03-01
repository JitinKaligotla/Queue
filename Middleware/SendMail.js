require("dotenv").config();

const nodemailer = require("nodemailer");


const sendMail = async (to, subject, text) => {
    try {
        //console.log("EMAIL_USER:", process.env.EMAIL_USER);
        //console.log("EMAIL_PASS:", process.env.EMAIL_PASS);

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER, 
                pass: process.env.EMAIL_PASS, 
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            text,
        };
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully");
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

module.exports = sendMail;
