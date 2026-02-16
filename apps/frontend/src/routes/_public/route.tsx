import {
  createFileRoute,
  isRedirect,
  Link,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/_public")({
  validateSearch: z.object({
    redirect: z.string().optional().catch(""),
  }),
  beforeLoad: ({ context: { isAuthenticated }, search }) => {
    try {
      // console.log("CHECKING AUTH IN 'PUBLIC'...")
      if (isAuthenticated) {
        throw redirect({ to: search.redirect || "/dashboard" });
      }
    }
    catch (error) {
      if (isRedirect(error))
        throw error;
      console.log(error);
    }
  },
  component: App,
});

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
            // preload={false}
          >
            Home
          </Link>
        </li>
        <li>
          <Link
            to="/login"
            className="hover:underline data-[status='active']:font-semibold"
            // preload={false}
          >
            Login
          </Link>
        </li>
        <li>
          <Link
            to="/register"
            className="hover:underline data-[status='active']:font-semibold"
            // preload={false}
          >
            Register
          </Link>
        </li>
      </ul>
      <hr />
      <Outlet />
    </div>
  );
}
