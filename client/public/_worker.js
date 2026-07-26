export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const backend = 'https://maison-boutique-production.up.railway.app';

    // Proxy /api/* and /invoices/* to Railway
    if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/invoices/')) {
      const targetUrl = `${backend}${url.pathname}${url.search}`;
      
      const headers = new Headers();
      for (const [key, value] of request.headers.entries()) {
        if (!['host', 'cf-connecting-ip', 'cf-ipcountry', 'cf-ray'].includes(key.toLowerCase())) {
          headers.set(key, value);
        }
      }

      const response = await fetch(targetUrl, {
        method: request.method,
        headers,
        body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
      });

      const responseHeaders = new Headers(response.headers);
      responseHeaders.set('Access-Control-Allow-Origin', url.origin);
      responseHeaders.set('Access-Control-Allow-Credentials', 'true');
      responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    }

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': url.origin,
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Credentials': 'true',
        },
      });
    }

    // Everything else → serve static assets
    return env.ASSETS.fetch(request);
  },
};
