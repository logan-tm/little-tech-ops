import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";

import { Card } from "@/components/ui/Card";
import { trpc } from "@/router";

export const Route = createFileRoute("/_authenticated/dashboard/users")({
  beforeLoad: ({ context }) => {
    // if no permission to view users, don't load the page and go back
    if (!context.permissions.includes("LIST:users")) {
      if (document.referrer.includes(window.location.host)) {
        // If in the same app, just go back to previous page
        window.history.back();
      } else {
        // If coming straight from another source by typing in the url directly,
        // just redirect to the root of the app
        throw redirect({
          to: "/",
        });
      }
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const context = Route.useRouteContext();
  return <UserList selfId={context.session.user.id.toString()} />;
}

function UserCard({
  user,
  deleteUser,
}: {
  user: any;
  deleteUser: (id: number) => void;
}) {
  return (
    <Card className="mb-2 max-w-md">
      <Card.Header className="italic">{user.id}</Card.Header>
      <Card.Title>
        {user.firstName}
        {" "}
        {user.lastName}
      </Card.Title>
      <Card.Description>{user.email}</Card.Description>
      <Card.Content className="italic">
        <p>
          Role:
          {user.role}
        </p>
      </Card.Content>
      <Card.Footer>
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteUser(user.id);
          }}
        >
          Delete User
        </button>
      </Card.Footer>
    </Card>
  );
}

function UserList({ selfId }: { selfId: string }) {
  const userQuery = useQuery(trpc.users.list.queryOptions());
  const { status, data: users, error, isFetching } = userQuery;
  const userCreator = useMutation(
    trpc.users.create.mutationOptions({
      onSuccess: () => {
        userQuery.refetch();
      },
      onError(e) {
        console.error("Error creating user...", e);
      },
    }),
  );
  const userDeletor = useMutation(
    trpc.users.remove.mutationOptions({
      onSuccess: () => {
        userQuery.refetch();
      },
      onError(e) {
        console.error("Error deleting user...", e);
      },
    }),
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">User Management</h2>
      <p>
        Status:
        {status}
      </p>
      <p>
        Fetching:
        {isFetching ? "Yes" : "No"}
      </p>
      {error && (
        <p className="text-red-500">
          Error:
          {error.message}
        </p>
      )}
      <div className="flex gap-3">
        {users?.map(user => (
          <UserCard
            key={user.id}
            user={user}
            deleteUser={(id: number) => {
              if (id.toString() === selfId) {
                alert("You don't want to delete yourself!");
              } else {
                if (
                  confirm(
                    `Are you sure you want to delete user with id '${id}'?}`,
                  )
                ) {
                  userDeletor.mutate(id);
                }
              }
            }}
          />
        ))}
      </div>

      <button
        onClick={() => {
          userCreator.mutate({
            firstName: "New",
            lastName: "User",
            email: `newuser${Date.now()}@example.com`,
            password: "hashedpassword",
            role: "technician",
          });
        }}
      >
        Create User
      </button>
    </div>
  );
}
