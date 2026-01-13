import {
  Outlet,
  createFileRoute,
  isRedirect,
  redirect,
} from '@tanstack/react-router'
import { z } from 'zod'
import type { UserSession } from '../../../../backend/src/types'

export const Route = createFileRoute('/_authenticated')({
  validateSearch: z.object({
    redirect: z.string().optional().catch(''),
  }),
  beforeLoad: async ({
    context: { trpcUtils },
    location,
  }): Promise<{ session: UserSession | null }> => {
    try {
      console.log("CHECKING AUTH IN 'AUTHENTICATED'...")
      const { isAuthenticated, session } =
        await trpcUtils.auth.isAuthenticated.ensureData()
      console.log('SESSION', session)
      if (!isAuthenticated) {
        throw redirect({
          to: '/login',
          search: { redirect: location.href },
        })
      }
      return { session }
    } catch (error) {
      if (isRedirect(error)) throw error
      console.log(error)
      return { session: null }
    }
  },
  // loader: ({ context }) => {
  //   return { context }
  // },
  component: () => <Outlet />,
})
