import type { User } from "@packages/database/users";
import { Link } from "@tanstack/react-router";

const ROLE_LABELS: Record<User["role"], string> = {
  admin: "Admin",
  manager: "Manager",
  technician: "Technician",
};

interface UsersListProps {
  users: Array<User>;
  title?: string;
}

function UsersList({ users, title = "Users" }: UsersListProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {users.length === 0 ? (
        <p className="text-gray-500">No users.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {users.map((user) => (
            <Link
              key={user.id}
              to="/dashboard/users/$userId"
              params={{ userId: String(user.id) }}
              className="block border border-gray-200 rounded p-3 hover:bg-gray-50"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-medium">
                    {user.firstName} {user.lastName}
                  </span>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <div className="text-right text-sm">
                  <span className="inline-block px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                    {ROLE_LABELS[user.role]}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default UsersList;
