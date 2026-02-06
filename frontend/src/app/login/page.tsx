'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MessageCircle, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setError('');
    setIsLoading(true);

    try {
      await login(data);
      router.push('/chat');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 via-white to-jade-50 dark:from-warm-950 dark:via-warm-900 dark:to-jade-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-jade-400 to-jade-600 text-white shadow-jade">
              <MessageCircle className="h-7 w-7" />
            </div>
            <span className="text-3xl font-semibold text-warm-900 dark:text-warm-50">Her</span>
          </Link>
        </div>

        {/* Login Card */}
        <div className="card p-8">
          <div className="mb-6 text-center">
            <h1 className="mb-2 text-2xl font-bold text-warm-900 dark:text-warm-50">
              Welcome back
            </h1>
            <p className="text-warm-600 dark:text-warm-400">Sign in to continue to Her</p>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-warm-700 dark:text-warm-300"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-warm-400" />
                <input
                  {...register('email')}
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="input pl-10"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-warm-700 dark:text-warm-300"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-warm-400" />
                <input
                  {...register('password')}
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="input pl-10"
                  disabled={isLoading}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-warm-600 dark:text-warm-400">Don&apos;t have an account? </span>
            <Link
              href="/register"
              className="font-medium text-jade-600 hover:text-jade-700 dark:text-jade-400 dark:hover:text-jade-300"
            >
              Sign up
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-warm-500 dark:text-warm-400">
          By continuing, you agree to Her&apos;s Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
