import {
  Outlet,
  createFileRoute,
  // isRedirect,
  redirect,
} from '@tanstack/react-router'
import { z } from 'zod/v3'
import type { VerifiedUserSession } from '../../../../backend/src/types'

export const Route = createFileRoute('/_authenticated')({
  validateSearch: z.object({
    redirect: z.string().optional().catch(''),
  }),
  beforeLoad: ({
    context: { isAuthenticated, session },
    location,
  }): { session: VerifiedUserSession } => {
    // console.log("CHECKING AUTH IN 'AUTHENTICATED'...")
    if (!isAuthenticated || !session || !session.user) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }
    // At this point, no need for try/catch
    // try {
    // } catch (error) {
    //   if (isRedirect(error)) throw error
    //   console.log(error)
    // }
    return { session: session as VerifiedUserSession }
  },
  component: () => <Outlet />,
})
