import { Link, Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'

export const Route = createFileRoute('/_public')({
  validateSearch: z.object({
    redirect: z.string().optional().catch(''),
  }),
  beforeLoad: async ({ context: { trpc, queryClient }, search }) => {
    // Eventually, add an 'auth' context using useQuery on trpc.auth.user
    const isAuthenticated = await queryClient.fetchQuery(
      trpc.auth.isAuthenticated.queryOptions(),
    )
    if (isAuthenticated) {
      throw redirect({ to: search.redirect || '/dashboard' })
    }
    console.log('isAuthenticated', isAuthenticated)
  },
  component: App,
})

function App() {
  return (
    <div className="h-full p-2">
      <h1>Home Page</h1>
      <p>This route's content is visible to unauthenticated users.</p>
      <ul className="flex gap-2 py-2">
        <li>
          <Link
            to="/"
            className="hover:underline data-[status='active']:font-semibold"
          >
            Home
          </Link>
        </li>
        <li>
          <Link
            to="/login"
            className="hover:underline data-[status='active']:font-semibold"
          >
            Login
          </Link>
        </li>
        <li>
          <Link
            to="/register"
            className="hover:underline data-[status='active']:font-semibold"
          >
            Register
          </Link>
        </li>
      </ul>
      <hr />
      <Outlet />
    </div>
  )
}
