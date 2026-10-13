import nodemailer, { type Transporter } from 'nodemailer';
import type { Mail, Mailer } from '../contracts/mailer';

/** SMTP, pointed at Mailpit locally (ADR-0004). */
export class SmtpMailer implements Mailer {
  private transport?: Transporter;

  async send(mail: Mail): Promise<void> {
    this.transport ??= nodemailer.createTransport({
      host: process.env.MAIL_HOST ?? 'mailpit',
      port: Number(process.env.MAIL_PORT ?? 1025),
    });
    await this.transport.sendMail({
      from: {
        name: process.env.MAIL_FROM_NAME ?? 'Banaro',
        address: process.env.MAIL_FROM_ADDRESS ?? 'hello@banaro.ca',
      },
      ...mail,
    });
  }
}
