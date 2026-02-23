import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";

import UsersList from "@/components/UsersList";
import { trpc } from "@/router";

export const Route = createFileRoute("/_authenticated/dashboard/users/")({
  beforeLoad: ({ context }) => {
    if (!context.permissions.includes("LIST:users")) {
      if (document.referrer.includes(window.location.host)) {
        window.history.back();
      } else {
        throw redirect({
          to: "/",
        });
      }
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { permissions, userData } = Route.useRouteContext();

  const canCreate = permissions.includes("CREATE:user");

  const usersQuery = useQuery({
    ...trpc.users.list.queryOptions(),
    initialData: userData.users ?? undefined,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Users</h2>
        {canCreate && <CreateUserForm onCreated={() => usersQuery.refetch()} />}
      </div>

      {usersQuery.isLoading && <p>Loading...</p>}
      {usersQuery.error && (
        <p className="text-red-500">Error: {usersQuery.error.message}</p>
      )}
      {usersQuery.data && (
        <UsersList users={usersQuery.data} title="All Users" />
      )}
    </div>
  );
}

function CreateUserForm({ onCreated }: { onCreated: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "manager" | "technician">(
    "technician",
  );

  const createMutation = useMutation(
    trpc.users.create.mutationOptions({
      onSuccess: () => {
        setFirstName("");
        setLastName("");
        setEmail("");
        setPassword("");
        setRole("technician");
        setShowForm(false);
        onCreated();
      },
      onError(e) {
        alert(`Error creating user: ${e.message}`);
      },
    }),
  );

  if (!showForm) {
    return (
      <button
        type="button"
        className="px-3 py-1.5 bg-blue-400 text-white rounded hover:opacity-90 cursor-pointer"
        onClick={() => setShowForm(true)}
      >
        Create User
      </button>
    );
  }

  return (
    <div className="border border-gray-200 rounded p-3">
      <h3 className="font-semibold mb-2">New User</h3>
      <div className="flex flex-col gap-2">
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        />
        <input
          type="password"
          placeholder="Password (min 8 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        />
        <select
          value={role}
          onChange={(e) =>
            setRole(e.target.value as "admin" | "manager" | "technician")}
          className="border border-gray-300 rounded px-2 py-1"
        >
          <option value="technician">Technician</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>
        <div className="flex gap-2">
          <button
            type="button"
            className="px-3 py-1 bg-blue-400 text-white rounded hover:opacity-90 cursor-pointer"
            onClick={() => {
              if (
                !firstName.trim() ||
                !lastName.trim() ||
                !email.trim() ||
                !password.trim()
              ) {
                alert("All fields are required.");
                return;
              }
              if (password.length < 8) {
                alert("Password must be at least 8 characters.");
                return;
              }
              createMutation.mutate({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim(),
                password,
                role,
              });
            }}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "Creating..." : "Create"}
          </button>
          <button
            type="button"
            className="px-3 py-1 rounded hover:bg-gray-100 cursor-pointer"
            onClick={() => setShowForm(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
