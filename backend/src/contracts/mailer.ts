export interface MailAddress {
  name: string;
  address: string;
}

export interface Mail {
  to: string;
  replyTo?: MailAddress;
  subject: string;
  text: string;
  html?: string;
  headers?: Record<string, string>;
}

/** Sends transactional e-mail; the vendor is not chosen yet (ADR-0004). */
export interface Mailer {
  send(mail: Mail): Promise<void>;
}
