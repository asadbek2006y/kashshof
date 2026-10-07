import 'server-only';
import createClient from 'openapi-fetch';
import type { paths } from './schema';

/** Server Component client: straight to the API, never cached (statuses change). */
export const serverApi = createClient<paths>({
  baseUrl: process.env.API_INTERNAL_URL ?? 'http://localhost:4100',
  fetch: (request) => fetch(request, { cache: 'no-store' }),
});
