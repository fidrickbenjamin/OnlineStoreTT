// Load with: node --import ./tests/helpers/offline-mail.mjs --test ...
// Regression tests must never deliver mail through a configured real service.
import nodemailer from 'nodemailer';
nodemailer.createTransport = () => ({ sendMail: async () => ({ messageId: 'offline-test-only' }) });
