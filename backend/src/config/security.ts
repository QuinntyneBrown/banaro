/** Transport and browser hardening headers on every response (L2-045 criterion 3). */
export const securityHeaders: Record<string, string> = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  // The API serves only JSON and files, so its policy allows no script, style or frame at all.
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
};
