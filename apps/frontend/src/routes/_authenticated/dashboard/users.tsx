import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { trpc } from '../../../utils/trpc'

import { Card } from '@/components/ui/Card'

export const Route = createFileRoute('/_authenticated/dashboard/users')({
  component: RouteComponent,
})

function RouteComponent() {
  return <UserList />
}

function UserCard({
  user,
  deleteUser,
}: {
  user: any
  deleteUser: (id: number) => void
}) {
  return (
    <Card className="mb-2 max-w-md">
      <Card.Header className="italic">{user.id}</Card.Header>
      <Card.Title>
        {user.firstName} {user.lastName}
      </Card.Title>
      <Card.Description>{user.email}</Card.Description>
      <Card.Content className="italic">
        <p>Role: {user.role}</p>
      </Card.Content>
      <Card.Footer>
        <button
          onClick={(e) => {
            e.stopPropagation()
            deleteUser(user.id)
          }}
        >
          Delete User
        </button>
      </Card.Footer>
    </Card>
  )
}

function UserList() {
  const userQuery = useQuery(trpc.users.list.queryOptions())
  const { status, data: users, error, isFetching } = userQuery
  const userCreator = useMutation(
    trpc.users.create.mutationOptions({
      onSuccess: () => {
        userQuery.refetch()
      },
    }),
  )
  const userDeletor = useMutation(
    trpc.users.remove.mutationOptions({
      onSuccess: () => {
        userQuery.refetch()
      },
    }),
  )

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">User Management</h2>
      <p>Status: {status}</p>
      <p>Fetching: {isFetching ? 'Yes' : 'No'}</p>
      {error && <p className="text-red-500">Error: {error.message}</p>}
      <div className="flex gap-3">
        {users?.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            deleteUser={(id: number) => userDeletor.mutate(id)}
          />
        ))}
      </div>

      <button
        onClick={() => {
          userCreator.mutate({
            firstName: 'New',
            lastName: 'User',
            email: `newuser${Date.now()}@example.com`,
            passwordHash: 'hashedpassword',
            role: 'user',
          })
        }}
      >
        Create User
      </button>
    </div>
  )
}
