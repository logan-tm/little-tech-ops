import { createFileRoute } from "@tanstack/react-router";

import CodeBlock from "@/components/CodeBlock";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  loader: ({ context }) => {
    return { session: context.session, permissions: context.permissions };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { session, permissions } = Route.useLoaderData();

  return (
    <div>
      <CodeBlock
        code={JSON.stringify({ ...session, permissions }, null, 2)}
        language="JSON"
      />
    </div>
  );
}
