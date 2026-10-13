import type pg from 'pg';
import { isoStamp } from '../../../clock';
import type { HelpOffer } from '../../../db/schema/projects';
import { memberLinks, unknownMember } from './member-links';

/** Offers with their offerers linked by profile id; the message is plain text (L2-017). */
export async function helpOfferResources(db: pg.Pool, rows: HelpOffer[]) {
  const offerers = await memberLinks(
    db,
    rows.map((row) => row.offererId),
  );
  return rows.map((row) => ({
    id: String(row.id),
    role: row.role,
    message: row.message,
    status: row.status,
    created_at: row.createdAt ? isoStamp(row.createdAt) : null,
    conversation_id: row.conversationId === null ? null : String(row.conversationId),
    offerer: offerers.get(row.offererId) ?? unknownMember,
  }));
}
