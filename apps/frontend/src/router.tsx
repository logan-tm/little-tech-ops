import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query'
import { createTRPCQueryUtils } from '@trpc/react-query'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

import type { AppRouter } from '../../backend/src/router'

export const queryClient = new QueryClient()

const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:4000/trpc',
      fetch: (url, options) => {
        return fetch(url, {
          ...(options as RequestInit),
          credentials: 'include',
        })
      },
    }),
  ],
})

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
})

// Useful for invalidations and refetching
export const trpcUtils = createTRPCQueryUtils({
  queryClient,
  client: trpcClient,
})

export function createRouter() {
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: false,
    context: {
      trpc,
      trpcUtils,
      // trpcClient,
      queryClient,
    },
    // defaultPendingComponent: () => (
    //   <div className={`p-2 text-2xl`}>
    //     <Spinner />
    //   </div>
    // ),
    Wrap: function WrapComponent({ children }) {
      return (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      )
    },
  })

  return router
}

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>
  }
}
