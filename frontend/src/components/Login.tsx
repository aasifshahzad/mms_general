'use client'
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {LoginAPI}  from '@/api/Login/Login';
import { toast } from 'sonner';

type FormData = {
  username: string;
  password: string;
};

interface LoginResponse {
  access_token: string;
  user: string;
}

interface ApiErrorResponse {
  response?: {
    data?: {
      detail?: string;
    };
  };
}

export default function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();


  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const response: LoginResponse = await LoginAPI({
        username: data.username,
        password: data.password,
      });
  
      if (response && response.access_token) {
        console.log("Login successful:", response);
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('user', JSON.stringify(response.user));
        toast.success("Login Successfully!", {
          position: "bottom-center",
          duration: 3000,
        });
        router.push('/dashboard');
      } else {
        console.error("Login failed: Invalid response format");
        // Show error message to user
      }
    } catch (error: unknown) {
      if (error instanceof Error && 'response' in error) {
        const apiError = error as Error & ApiErrorResponse;
        if (apiError.response?.data?.detail) {
          toast.error(apiError.response.data.detail, {
          position: "bottom-center",
          duration: 3000,
          });
        } else {
          toast.error("Login failed. Please check your credentials.", {
            position: "bottom-center",
            duration: 3000,
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white shadow-xl border border-gray-200 rounded-2xl">
        <h2 className="mb-6 text-2xl font-semibold text-center text-gray-800">
          Welcome Back
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email or Phone</label>
            <div className="relative mt-1">
              <input
                type="text"
                placeholder="Enter your email or phone"
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                {...register('username', { required: 'This field is required' })}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-500">{errors.username.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <div className="relative mt-1">
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                {...register('password', { required: 'Password is required' })}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div className="text-right">
            <a href="#" className="text-sm text-emerald-500 hover:underline">Forgot password?</a>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center items-center gap-2 p-3 text-white bg-gray-800 rounded-lg hover:bg-black transition disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Login'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <span className="text-gray-600">Not a member? </span>
          <a href="#" className="text-emerald-500 hover:underline">Signup now</a>
        </div>
      </div>
    </div>
  );
}
