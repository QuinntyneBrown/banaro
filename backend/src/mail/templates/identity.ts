import type { Mail } from '../../contracts/mailer';
import { t } from '../../services/user-experience/catalogue-service';
import { greeting, renderMail, webUrl } from '../layout';

interface Recipient {
  name: string;
  email: string;
}

/** Security e-mail: member e-mail preferences never suppress it (L2-029). */
export function verifyEmailMail(user: Recipient, link: string): Mail {
  return {
    to: user.email,
    subject: t('email.verify.subject'),
    ...renderMail({
      greeting: greeting(user.name),
      intro: [t('email.verify.intro')],
      action: { text: t('email.verify.action'), url: link },
      outro: [t('email.verify.expiry')],
    }),
  };
}

/** Security e-mail with a 60-minute, single-use reset link (L2-004, L2-029). */
export function resetPasswordMail(user: Recipient, token: string): Mail {
  const query = new URLSearchParams({ token, email: user.email });
  return {
    to: user.email,
    subject: t('email.reset.subject'),
    ...renderMail({
      greeting: greeting(user.name),
      intro: [t('email.reset.intro')],
      action: { text: t('email.reset.action'), url: webUrl(`/reset-password?${query}`) },
      outro: [t('email.reset.expiry')],
    }),
  };
}

/** Security e-mail after a password change (L2-004 criterion 9). */
export function passwordChangedMail(user: Recipient): Mail {
  return {
    to: user.email,
    subject: t('email.passwordChanged.subject'),
    ...renderMail({
      greeting: greeting(user.name),
      intro: [t('email.passwordChanged.intro'), t('email.passwordChanged.notYou')],
      action: { text: t('email.passwordChanged.reset'), url: webUrl('/forgot-password') },
      outro: [t('email.passwordChanged.help', { url: webUrl('/contact') })],
    }),
  };
}

/**
 * Sent when someone joins with a registered address (L2-001 criteria 3 and 10). It carries no
 * verification link, only the ways back in.
 */
export function accountExistsMail(user: Recipient): Mail {
  return {
    to: user.email,
    subject: t('email.accountExists.subject'),
    ...renderMail({
      greeting: greeting(user.name),
      intro: [t('email.accountExists.intro')],
      action: { text: t('email.accountExists.signIn'), url: webUrl('/sign-in') },
      outro: [
        t('email.accountExists.reset', { url: webUrl('/forgot-password') }),
        t('email.accountExists.ignore'),
      ],
    }),
  };
}
