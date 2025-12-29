import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import type { AuthContext } from '@/lib/auth'
import type { QueryClient } from '@tanstack/react-query'
import Header from '@/components/Header'
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

interface RouterContext {
  auth: AuthContext
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <>
      <Header />
      <Outlet />
      {/* <ReactQueryDevtools buttonPosition="top-right" /> */}
      <TanStackRouterDevtools />
    </>
  ),
})
