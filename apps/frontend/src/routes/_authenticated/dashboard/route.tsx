/**
 * This file contains the route definition for the dashboard page(s).
 * It acts as a layout for the dashboard and contains the navigation links.
 * It also handles the logout functionality.
 */

import { useMutation } from "@tanstack/react-query";
import {
  createFileRoute,
  Link,
  Outlet,
  useRouter,
} from "@tanstack/react-router";

import { trpc, trpcUtils } from "@/router";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardLayout,
});

function DashboardLayout() {
  const router = useRouter();
  const context = Route.useRouteContext();
  const logoutMutation = useMutation(
    trpc.auth.logout.mutationOptions({
      onSuccess: async () => {
        await trpcUtils.auth.getSession.refetch();
        await router.navigate({ to: "/login" });
      },
      onError(error) {
        alert(`Error logging out: ${error.message}`);
      },
    }),
  );

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logoutMutation.mutate();
    }
  };

  return (
    <div className="h-full p-2">
      <h1>Authenticated Route</h1>
      <p>This route's content is only visible to authenticated users.</p>
      <ul className="flex gap-2 py-2">
        <li>
          <Link
            to="/dashboard"
            activeOptions={{ exact: true }}
            className="hover:underline data-[status='active']:font-semibold"
          >
            Home
          </Link>
        </li>
        {context.permissions.includes("LIST:users") && (
          <li>
            <Link
              to="/dashboard/users"
              className="hover:underline data-[status='active']:font-semibold"
            >
              Users
            </Link>
          </li>
        )}
        <li>
          <button
            type="button"
            className="hover:underline"
            onClick={handleLogout}
          >
            Logout
          </button>
        </li>
      </ul>
      <hr className="pb-6" />
      <Outlet />
    </div>
  );
}
