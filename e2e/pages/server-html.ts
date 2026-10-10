import { type APIRequestContext } from '@playwright/test';

/** The HTML a crawler receives for a route, read without running any script. */
export class ServerHtml {
  private constructor(private readonly html: string) {}

  static async fetch(request: APIRequestContext, path: string): Promise<ServerHtml> {
    const response = await request.get(path, { headers: { Accept: 'text/html' } });
    return new ServerHtml(await response.text());
  }

  title(): string | undefined {
    return /<title>([^<]*)<\/title>/.exec(this.html)?.[1];
  }

  metaDescription(): string | undefined {
    return /<meta name="description" content="([^"]*)"/.exec(this.html)?.[1];
  }

  canonical(): string | undefined {
    return /<link rel="canonical" href="([^"]*)"/.exec(this.html)?.[1];
  }

  themeAttribute(): string | undefined {
    return /<html[^>]*\sdata-theme="([^"]*)"/.exec(this.html)?.[1];
  }

  headline(): string | undefined {
    const h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(this.html)?.[1];
    return h1?.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  }
}
