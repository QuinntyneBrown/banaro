/**
 * A query string as an object: `role[]=a&role[]=b` and `role[0]=a` become arrays, as the Angular
 * client and Laravel's parser wrote and read them.
 */
export function parseQuery(req: Request): Record<string, string | string[]> {
  const result: Record<string, string | string[]> = {};
  for (const [key, value] of new URL(req.url).searchParams) {
    const list = /^(.+)\[\d*\]$/.exec(key);
    if (list) {
      const existing = result[list[1]];
      result[list[1]] = [...(Array.isArray(existing) ? existing : []), value];
    } else {
      result[key] = value;
    }
  }
  return result;
}
