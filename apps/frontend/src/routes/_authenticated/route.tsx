import {
  Outlet,
  createFileRoute,
  // isRedirect,
  redirect,
} from '@tanstack/react-router'
import { z } from 'zod/v3'
import type { VerifiedUserSession } from '../../../../backend/src/types'
import type { Permission } from '../../../../backend/src/modules/permission/permission.types'

export const Route = createFileRoute('/_authenticated')({
  validateSearch: z.object({
    redirect: z.string().optional().catch(''),
  }),
  beforeLoad: ({
    context: { isAuthenticated, session, permissions },
    location,
  }): { session: VerifiedUserSession; permissions: Array<Permission> } => {
    // console.log("CHECKING AUTH IN 'AUTHENTICATED'...")
    if (!isAuthenticated || !session || !session.user || !permissions) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }
    return {
      session: session as VerifiedUserSession,
      permissions,
    }
  },
  component: () => <Outlet />,
})
