import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { trpc, trpcUtils } from '@/router';

export const Route = createFileRoute('/_public/register')({
  component: RegisterComponent,
});

const registerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});
type FormData = z.infer<typeof registerSchema>;

function RegisterComponent() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = useMutation(
    trpc.auth.register.mutationOptions({
      onSuccess: async () => {
        await trpcUtils.auth.isAuthenticated.refetch();
        await router.invalidate();
      },
      onError(error) {
        alert(`Registration failed: ${error.message}`);
      },
    }),
  );

  return (
    <form
      className="py-4"
      onSubmit={handleSubmit((data: FormData) =>
        registerMutation.mutateAsync(data),
      )}
    >
      <div className="flex gap-2">
        <label htmlFor="firstName">First Name:</label>
        <input
          id="firstName"
          className="border border-black/20"
          {...register('firstName')}
        />
        <label htmlFor="lastName">Last Name:</label>
        <input
          id="lastName"
          className="border border-black/20"
          {...register('lastName')}
        />
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          className="border border-black/20"
          {...register('email')}
        />
        <label htmlFor="password">Password:</label>
        <input
          id="password"
          className="border border-black/20"
          type="password"
          {...register('password')}
        />
        <input type="submit" />
      </div>
      <p>{errors.email?.message}</p>
    </form>
  );
}
