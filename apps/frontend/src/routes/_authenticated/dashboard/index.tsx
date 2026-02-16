import { createFileRoute } from "@tanstack/react-router";

import AdminDashboard from "@/components/AdminDashboard";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { session } = Route.useRouteContext();

  if (session.user.role === "admin") {
    return <AdminDashboard />;
  }

  return <div>Who are you?</div>;
}
