import nodemailer from "nodemailer";
import { MailtrapTransport } from "mailtrap";

const transport = nodemailer.createTransport(
    MailtrapTransport({
        token: process.env.MAILTRAP_API_TOKEN,
    })
);

const sendEmail = async (options) => {
    if (!options?.email) {
        throw new Error("Email recipient is required");
    }

    if (!options?.subject) {
        throw new Error("Email subject is required");
    }

    if (!options?.html) {
        throw new Error("Email HTML content is required");
    }

    const message = {
        from: {
            address: process.env.SMTP_FROM_EMAIL,
            name: process.env.SMTP_FROM_NAME || "Tactical Trends",
        },

        to: [
            {
                address: options.email,
            },
        ],

        subject: options.subject,

        html: options.html,
    };

    try {
        const info = await transport.sendMail(message);

        console.log("Email sent successfully:", {
            messageId: info.messageId,
            to: options.email,
            subject: options.subject,
        });

        return info;

    } catch (error) {
        console.error("Mailtrap email failed:", {
            error: error.message,
            to: options.email,
            subject: options.subject,
        });

        throw error;
    }
};

export default sendEmail;