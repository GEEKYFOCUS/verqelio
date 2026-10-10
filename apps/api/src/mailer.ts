import nodemailer from 'nodemailer';
import { config } from './config.js';

export async function sendMail(args: { to: string; subject: string; text: string; html?: string }) {
  const { host, port, username, password, from } = config.email;
  if (!host || !username || !password || !from) {
    return { skipped: true, reason: 'email_not_configured' };
  }

  const transport = nodemailer.createTransport({
    host,
    port,
    auth: { user: username, pass: password },
  });

  const info = await transport.sendMail({
    from,
    to: args.to,
    subject: args.subject,
    text: args.text,
    html: args.html,
  });

  return { skipped: false, messageId: info.messageId };
}
