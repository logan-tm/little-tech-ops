import { createFileRoute } from "@tanstack/react-router";

import CodeBlock from "@/components/CodeBlock";

export const Route = createFileRoute("/_authenticated/dashboard/about")({
  component: RouteComponent,
});

function RouteComponent() {
  const { session, permissions } = Route.useRouteContext();

  return (
    <div>
      <CodeBlock
        code={JSON.stringify({ ...session, permissions }, null, 2)}
        language="JSON"
      />
    </div>
  );
}
