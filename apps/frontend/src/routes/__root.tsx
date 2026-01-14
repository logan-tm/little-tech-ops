import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import type { QueryClient } from '@tanstack/react-query'
import type { TRPCOptionsProxy } from '@trpc/tanstack-react-query'
import type { AppRouter } from '../../../backend/src/router'
import type { createTRPCQueryUtils } from '@trpc/react-query'
import type { UserSession } from '../../../backend/src/types'

interface RouterContext {
  trpc: TRPCOptionsProxy<AppRouter>
  trpcUtils: ReturnType<typeof createTRPCQueryUtils<AppRouter>>
  queryClient: QueryClient
}

/**
 * For child routes, provide authentication details
 */
export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async ({
    context: { trpcUtils },
  }): Promise<{ isAuthenticated: boolean; session: UserSession | null }> => {
    try {
      return await trpcUtils.auth.isAuthenticated.ensureData(undefined, {
        staleTime: 60 * 1000, // 1 minute
      })
    } catch (error) {
      console.log(error)
      return { isAuthenticated: false, session: null }
    }
  },
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
})
