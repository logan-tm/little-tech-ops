import type { AppRouter } from './router';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';

export function createTRPCClient(url: string) {
  return createTRPCProxyClient<AppRouter>({
    links: [httpBatchLink({ url })],
  });
}
