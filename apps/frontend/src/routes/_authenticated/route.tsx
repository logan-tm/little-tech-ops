import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'

export const Route = createFileRoute('/_authenticated')({
  validateSearch: z.object({
    redirect: z.string().optional().catch(''),
  }),
  beforeLoad: async ({ context: { trpc, queryClient }, location }) => {
    const isAuthenticated = await queryClient.fetchQuery(
      trpc.auth.isAuthenticated.queryOptions(),
    )
    if (!isAuthenticated) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }
    // console.log(`isAuthenticated`, isAuthenticated)
  },
  component: () => <Outlet />,
})
