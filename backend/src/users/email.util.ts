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
  requiresPasswordSetup = false,
) {
  const baseUrl =
    (process.env.FRONTEND_URL || 'http://localhost:5173').split(',')[0].trim();
  const path = requiresPasswordSetup ? '/activate' : '/confirm';
  const confirmUrl = `${baseUrl}${path}?token=${token}`;
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

  const action = requiresPasswordSetup
    ? 'set your password and activate your account'
    : 'confirm your email';

  await transporter.sendMail({
    from,
    to: email,
    subject: `${appName}: ${requiresPasswordSetup ? 'Activate your account' : 'Confirm your account'}`,
    text: `An account has been created for you on "${appName}".\n\nClick the link below to ${action}:\n${confirmUrl}\n\nThis link will expire in 24 hours. If you did not request this, you can ignore this email.`,
    html: `<p>An account has been created for you on <b>${appName}</b>.</p><p>Click the link below to ${action}:</p><p><a href="${confirmUrl}">${confirmUrl}</a></p><p>This link will expire in 24 hours. If you did not request this, you can ignore this email.</p>`,
  });
}
