import type { User } from "@packages/database/users";

const ROLE_LABELS: Record<User["role"], string> = {
  admin: "Admin",
  manager: "Manager",
  technician: "Technician",
};

interface UserCardProps {
  user: User;
  actions?: React.ReactNode;
}

function UserCard({ user, actions }: UserCardProps) {
  return (
    <div className="border border-gray-200 rounded p-4 max-w-lg">
      <div className="mb-3">
        <h2 className="text-xl font-semibold">
          {user.firstName} {user.lastName}
        </h2>
        <p className="text-gray-500 text-sm">{user.email}</p>
      </div>

      <div className="text-sm space-y-1 mb-3">
        <p>
          <span className="font-medium">ID:</span> #{user.id}
        </p>
        <p>
          <span className="font-medium">Role:</span>{" "}
          <span className="inline-block px-2 py-0.5 rounded bg-gray-100">
            {ROLE_LABELS[user.role]}
          </span>
        </p>
      </div>

      {actions && (
        <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-200">
          {actions}
        </div>
      )}
    </div>
  );
}

export default UserCard;
