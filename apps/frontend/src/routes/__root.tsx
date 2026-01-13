import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
// import type { AuthContext } from '@/utils/auth'
import type { QueryClient } from '@tanstack/react-query'
import type { TRPCOptionsProxy } from '@trpc/tanstack-react-query'
import type { AppRouter } from '../../../backend/src/router'
import type { TRPCClient, createTRPCQueryUtils } from '@trpc/react-query'
// import Header from '@/components/Header'
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

interface RouterContext {
  trpc: TRPCOptionsProxy<AppRouter>
  trpcUtils: ReturnType<typeof createTRPCQueryUtils<AppRouter>>
  trpcClient: TRPCClient<AppRouter>
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <>
      {/* <Header /> */}
      <Outlet />
      {/* <ReactQueryDevtools buttonPosition="top-right" /> */}
      <TanStackRouterDevtools />
    </>
  ),
})
