export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const backend = 'https://maison-boutique-production.up.railway.app';

    // Proxy /api/* and /invoices/* to Railway
    if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/invoices/')) {
      const targetUrl = `${backend}${url.pathname}${url.search}`;
      const headers = new Headers(request.headers);
      headers.set('Host', new URL(backend).host);
      headers.delete('cf-connecting-ip');
      headers.delete('cf-ipcountry');

      const response = await fetch(targetUrl, {
        method: request.method,
        headers,
        body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
      });

      // Clone response with CORS headers
      const responseHeaders = new Headers(response.headers);
      responseHeaders.set('Access-Control-Allow-Origin', url.origin);
      responseHeaders.set('Access-Control-Allow-Credentials', 'true');

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    }

    // Everything else → Cloudflare Pages (SPA)
    return env.ASSETS.fetch(request);
  },
};

interface Env {
  ASSETS: Fetcher;
}
