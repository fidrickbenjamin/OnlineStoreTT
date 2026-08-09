import nodemailer from "nodemailer";
import { MailtrapTransport } from "mailtrap";

const sendEmail = async (options) => {
  const transport = nodemailer.createTransport(
    MailtrapTransport({
      token: process.env.MAILTRAP_API_TOKEN,
    })
  );

  const message = {
    from: {
      address: process.env.SMTP_FROM_EMAIL,
      name: process.env.SMTP_FROM_NAME,
    },
    to: [
      {
        address: options.email,
      },
    ],
    subject: options.subject,
    html: options.message,
  };

  await transport.sendMail(message);
};

export default sendEmail;