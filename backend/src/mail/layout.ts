import { t } from '../services/user-experience/catalogue-service';

export interface MailContent {
  greeting?: string;
  intro: string[];
  action?: { text: string; url: string };
  outro?: string[];
  /** A trusted catalogue line after the others; a Markdown link in it becomes a link. */
  footer?: string;
}

const MARKDOWN_LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;

/** Plain text and HTML of a transactional e-mail: greeting, lines, one button, sign-off. */
export function renderMail({ greeting, intro, action, outro = [], footer }: MailContent) {
  const signOff = ['Regards,', 'Banaro'];
  const text = [
    ...(greeting ? [greeting, ''] : []),
    ...intro.flatMap((line) => [line, '']),
    ...(action ? [`${action.text}: ${action.url}`, ''] : []),
    ...outro.flatMap((line) => [line, '']),
    ...(footer ? [footer.replace(MARKDOWN_LINK, '$1: $2'), ''] : []),
    ...signOff,
  ].join('\n');

  const paragraph = (line: string) => `<p>${escapeHtml(line)}</p>`;
  const html = [
    '<!doctype html><html><body style="font-family: Arial, sans-serif; color: #101828">',
    ...(greeting ? [`<h1 style="font-size: 18px">${escapeHtml(greeting)}</h1>`] : []),
    ...intro.map(paragraph),
    ...(action
      ? [
          `<p><a href="${escapeHtml(action.url)}" style="display: inline-block; padding: 10px 16px; background: #1d4ed8; color: #ffffff; text-decoration: none; border-radius: 6px">${escapeHtml(action.text)}</a></p>`,
        ]
      : []),
    ...outro.map(paragraph),
    ...(footer
      ? [`<p>${escapeHtml(footer).replace(MARKDOWN_LINK, '<a href="$2">$1</a>')}</p>`]
      : []),
    `<p>${signOff.map(escapeHtml).join('<br>')}</p>`,
    '</body></html>',
  ].join('\n');

  return { text, html };
}

/** Values from members are text, never markup (L2-045 criterion 5). */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

export const greeting = (name: string) => t('email.greeting', { name });

/** The Banaro Web address that links in e-mail point to. */
export const webUrl = (path: string) =>
  `${(process.env.FRONTEND_URL ?? 'http://localhost:4300').replace(/\/$/, '')}${path}`;
