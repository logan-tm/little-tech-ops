import { QueryClient } from '@tanstack/react-query'
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query'
import type { AppRouter } from '../../../backend/src/router'

export const queryClient = new QueryClient()

const trpcClient = createTRPCClient<AppRouter>({
  links: [httpBatchLink({ url: 'http://localhost:5000' })],
})

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
})
