import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'

export const Route = createFileRoute('/_public/login')({
  component: LoginComponent,
})

const loginSchema = z.object({
  email: z.string().email(),
})
type FormData = z.infer<typeof loginSchema>

function LoginComponent() {
  const auth = useAuth()
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: FormData) => {
    await auth
      .login(data.email)
      .then(async () => {
        await router.invalidate() // _public.tsx handles the redirect
      })
      .catch((error) => {
        alert(`Login failed: ${error.message}`)
      })
  }

  return (
    <form className="py-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex gap-2">
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          className="border border-black/20"
          {...register('email')}
        />
        <input type="submit" />
      </div>
      <p>{errors.email?.message}</p>
    </form>
  )
}
