import { z } from 'zod';
import { t } from '../../services/user-experience/catalogue-service';

/** A message from the catalogue, for the zod `error` option. */
export const message = (key: string) => ({ error: () => t(key) });

/** E-mail address for every form; control characters, CR and LF included, never pass. */
export const emailAddress = (key: string) => z.email(message(key)).max(254, message(key));
