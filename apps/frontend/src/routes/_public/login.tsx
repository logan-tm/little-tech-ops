import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod/v3";

import { trpc, trpcUtils } from "@/router";
// import { useAuth } from '@/contexts/AuthContext'

export const Route = createFileRoute("/_public/login")({
  component: LoginComponent,
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

function LoginComponent() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });
  const loginMutation = useMutation(
    trpc.auth.login.mutationOptions({
      onSuccess: async () => {
        await trpcUtils.auth.getSession.refetch();
        await router.invalidate();
      },
      onError(error) {
        alert(error.message);
      },
    }),
  );

  return (
    <form
      className="py-4"
      onSubmit={handleSubmit(data => loginMutation.mutate(data))}
    >
      <div className="flex gap-2">
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          className="border border-black/20"
          {...register("email")}
        />
        <label htmlFor="password">Password:</label>
        <input
          id="password"
          className="border border-black/20"
          type="password"
          {...register("password")}
        />
        <input type="submit" />
      </div>
      <p>{errors.email?.message}</p>
    </form>
  );
}
