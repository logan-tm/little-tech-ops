// import { QueryClient } from '@tanstack/react-query'
// import { createTRPCClient, httpBatchLink } from '@trpc/client'
// import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query'
// import type { AppRouter } from '../../../backend/src/router'

// export const queryClient = new QueryClient()

// const trpcClient = createTRPCClient<AppRouter>({
//   links: [httpBatchLink({ url: 'http://localhost:4000/trpc' })],
// })

// export const trpc = createTRPCOptionsProxy<AppRouter>({
//   client: trpcClient,
//   queryClient,
// })

import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '../../../backend/src/router'

export const trpc = createTRPCReact<AppRouter>()
