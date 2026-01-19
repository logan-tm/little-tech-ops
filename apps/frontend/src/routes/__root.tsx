import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import type { QueryClient } from '@tanstack/react-query'
import type { TRPCOptionsProxy } from '@trpc/tanstack-react-query'
import type { AppRouter } from '../../../backend/src/router'
import type { createTRPCQueryUtils } from '@trpc/react-query'
import type { UserSession } from '../../../backend/src/types'
import type { Permission } from '../../../backend/src/modules/permission/permission.types'

interface RouterContext {
  trpc: TRPCOptionsProxy<AppRouter>
  trpcUtils: ReturnType<typeof createTRPCQueryUtils<AppRouter>>
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  // Provide auth details for child routes
  beforeLoad: async ({
    context: { trpcUtils },
  }): Promise<{
    isAuthenticated: boolean
    session: UserSession | null
    permissions: Array<Permission> | null
  }> => {
    try {
      return await trpcUtils.auth.getSession.ensureData(undefined, {
        staleTime: 60 * 1000, // 1 minute
      })
    } catch (error) {
      console.log(error)
      return { isAuthenticated: false, session: null, permissions: null }
    }
  },
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
})
