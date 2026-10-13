import { sendContactMessage } from '@/src/actions/public-site/send-contact-message';
import { apiStack, handle } from '@/src/http/pipeline';
import { SendContactMessageRequest } from '@/src/http/requests/public-site/send-contact-message-request';
import { validate } from '@/src/http/validation/validate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const stack = apiStack;

/** Visitors write to the team. The answer is the same whether the message was queued or discarded. */
export const POST = handle(stack, async (ctx) => {
  await sendContactMessage(await validate(SendContactMessageRequest, ctx.req), ctx.deps);
  return Response.json({}, { status: 202 });
});
