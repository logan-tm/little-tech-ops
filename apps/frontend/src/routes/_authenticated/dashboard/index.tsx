import { createFileRoute } from '@tanstack/react-router'
import CodeBlock from '@/components/CodeBlock'

export const Route = createFileRoute('/_authenticated/dashboard/')({
  loader: ({ context }) => {
    return context.session
  },
  component: RouteComponent,
})

function RouteComponent() {
  const session = Route.useLoaderData()

  return (
    <div>
      <CodeBlock code={JSON.stringify(session, null, 2)} language="JSON" />
    </div>
  )
}
