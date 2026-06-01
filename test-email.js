import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
dotenv.config({ path: "firebase-functions/.env" });

const user = process.env.GMAIL_USER || process.env.EMAIL_USER;
const pass = process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASS;
const to = process.env.ADMIN_EMAIL || process.env.TEST_EMAIL_TO;

if (!user || !pass) {
  console.error(
    "Set GMAIL_USER and GMAIL_APP_PASSWORD (or EMAIL_USER / EMAIL_PASS) in firebase-functions/.env"
  );
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user, pass },
});

const mailOptions = {
  from: user,
  to: to || user,
  subject: "Test Email from RevoQuest",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f97316;">Test Email</h2>
      <p>This is a test email to verify that the email configuration is working correctly.</p>
    </div>
  `,
};

console.log("Testing email configuration...");

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error("Error sending email:", error);
  } else {
    console.log("Email sent successfully. Message ID:", info.messageId);
  }
});
