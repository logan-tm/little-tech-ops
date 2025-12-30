import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { trpc } from '../../../utils/trpc'

export const Route = createFileRoute('/_authenticated/dashboard/users')({
  component: RouteComponent,
})

function RouteComponent() {
  const userQuery = useQuery(trpc.userList.queryOptions())
  const userCreator = useMutation(
    trpc.userCreate.mutationOptions({
      onSuccess: () => {
        userQuery.refetch()
      },
    }),
  )

  return (
    <div>
      {userQuery.data &&
        userQuery.data.map((user) => (
          <div key={user.id}>
            {user.id}: {user.name}
          </div>
        ))}

      <button
        onClick={() => {
          userCreator.mutate({ name: 'New User' })
        }}
      >
        Create User
      </button>
    </div>
  )
}
