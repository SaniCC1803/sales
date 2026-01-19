import 'dotenv/config';
// Log SMTP environment variables for debugging
import * as crypto from 'crypto';
import nodemailer from 'nodemailer';

export function generateConfirmationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function sendConfirmationEmail(
  email: string,
  token: string,
  appName: string,
  fromEmail?: string,
) {
  const confirmUrl = `http://localhost:3000/auth/confirm?token=${token}`;
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    secure: false,
  });

  const from = fromEmail
    ? `${appName} <${fromEmail}>`
    : `${appName} <no-reply@yourdomain.com>`;

  await transporter.sendMail({
    from,
    to: email,
    subject: `${appName}: Confirm your account`,
    text: `A user has been created for the application "${appName}".\n\nTo activate your account, please confirm your email by clicking the following link: ${confirmUrl}`,
    html: `<p>A user has been created for the application <b>${appName}</b>.</p><p>To activate your account, please <a href="${confirmUrl}">confirm your email</a>.</p>`,
  });
}
