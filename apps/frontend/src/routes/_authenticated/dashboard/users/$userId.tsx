import type { User } from "@packages/database/users";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  Link,
  redirect,
  useRouter,
} from "@tanstack/react-router";
import { useState } from "react";

import UserCard from "@/components/UserCard";
import { trpc } from "@/router";

export const Route = createFileRoute("/_authenticated/dashboard/users/$userId")(
  {
    beforeLoad: ({ context }) => {
      if (!context.permissions.includes("GET:user")) {
        if (document.referrer.includes(window.location.host)) {
          window.history.back();
        } else {
          throw redirect({ to: "/" });
        }
      }
    },
    component: RouteComponent,
  },
);

function RouteComponent() {
  const { userId } = Route.useParams();
  const { permissions, session } = Route.useRouteContext();
  const router = useRouter();

  const canUpdate = permissions.includes("UPDATE:user");
  const canDelete = permissions.includes("DELETE:user");

  const userQuery = useQuery(trpc.users.getById.queryOptions(Number(userId)));

  const { data: user, isLoading, error } = userQuery;

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error.message}</p>;
  if (!user) return <p>User not found.</p>;

  const isSelf = user.id === session.user.id;

  return (
    <div>
      <Link
        to="/dashboard/users"
        className="text-blue-500 hover:underline text-sm mb-3 inline-block"
      >
        &larr; Back to Users
      </Link>

      <UserCard
        user={user}
        actions={
          <>
            {canUpdate && (
              <EditAction user={user} onSuccess={() => userQuery.refetch()} />
            )}
            {canDelete && (
              <DeleteAction
                userId={user.id}
                isSelf={isSelf}
                onSuccess={async () => {
                  await router.navigate({ to: "/dashboard/users" });
                }}
              />
            )}
          </>
        }
      />
    </div>
  );
}

// -- Edit action --

function EditAction({
  user,
  onSuccess,
}: {
  user: User;
  onSuccess: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);

  const updateMutation = useMutation(
    trpc.users.update.mutationOptions({
      onSuccess: () => {
        setEditing(false);
        onSuccess();
      },
      onError(e) {
        alert(`Error updating user: ${e.message}`);
      },
    }),
  );

  if (!editing) {
    return (
      <button
        type="button"
        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm cursor-pointer"
        onClick={() => {
          setFirstName(user.firstName);
          setLastName(user.lastName);
          setEmail(user.email);
          setRole(user.role);
          setEditing(true);
        }}
      >
        Edit
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <input
        type="text"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        className="border border-gray-300 rounded px-2 py-1 text-sm"
        placeholder="First Name"
      />
      <input
        type="text"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        className="border border-gray-300 rounded px-2 py-1 text-sm"
        placeholder="Last Name"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border border-gray-300 rounded px-2 py-1 text-sm"
        placeholder="Email"
      />
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as User["role"])}
        className="border border-gray-300 rounded px-2 py-1 text-sm"
      >
        <option value="technician">Technician</option>
        <option value="manager">Manager</option>
        <option value="admin">Admin</option>
      </select>
      <div className="flex gap-2">
        <button
          type="button"
          className="px-3 py-1 rounded bg-blue-400 text-white hover:opacity-90 text-sm cursor-pointer"
          disabled={updateMutation.isPending}
          onClick={() => {
            if (!firstName.trim() || !lastName.trim() || !email.trim()) {
              alert("First name, last name, and email are required.");
              return;
            }
            updateMutation.mutate({
              id: user.id,
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              email: email.trim(),
              role,
            });
          }}
        >
          {updateMutation.isPending ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          className="px-3 py-1 rounded hover:bg-gray-100 text-sm cursor-pointer"
          onClick={() => setEditing(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// -- Delete action --

function DeleteAction({
  userId,
  isSelf,
  onSuccess,
}: {
  userId: number;
  isSelf: boolean;
  onSuccess: () => void;
}) {
  const deleteMutation = useMutation(
    trpc.users.remove.mutationOptions({
      onSuccess,
      onError(e) {
        alert(`Error deleting user: ${e.message}`);
      },
    }),
  );

  return (
    <button
      type="button"
      className="px-3 py-1 rounded bg-red-400 text-white hover:opacity-90 text-sm cursor-pointer"
      disabled={deleteMutation.isPending}
      onClick={() => {
        if (isSelf) {
          alert("You can't delete yourself!");
          return;
        }
        if (confirm("Are you sure you want to delete this user?")) {
          deleteMutation.mutate(userId);
        }
      }}
    >
      {deleteMutation.isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
