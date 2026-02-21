import type { Permission } from "@packages/rules";
import type { VerifiedUserSession } from "@packages/trpc";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import * as z from "zod/v4-mini";

export const Route = createFileRoute("/_authenticated")({
  validateSearch: z.object({
    // redirect: z.string().optional().catch(""),
    redirect: z.optional(z.catch(z.string(), "")),
  }),
  beforeLoad: ({
    context: { isAuthenticated, session, permissions },
    location,
  }): { session: VerifiedUserSession; permissions: Array<Permission> } => {
    // console.log("CHECKING AUTH IN 'AUTHENTICATED'...")
    if (!isAuthenticated || !session || !session.user || !permissions) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
    return {
      session: session as VerifiedUserSession,
      permissions,
    };
  },
  component: () => <Outlet />,
});
