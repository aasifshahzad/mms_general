"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Loader2, Lock, Mail, Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { LoginAPI } from "@/api/Login/Login"
import { toast } from "sonner"
import Image from "next/image"

type FormData = {
  username: string
  password: string
}

interface LoginResponse {
  access_token: string
  user: string
}

interface ApiErrorResponse {
  response?: {
    data?: {
      detail?: string
    }
  }
}

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter()

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      const response: LoginResponse = await LoginAPI({
        username: data.username,
        password: data.password,
      })

      if (response?.access_token) {
        localStorage.setItem("access_token", response.access_token)
        localStorage.setItem("user", JSON.stringify(response.user))
        toast.success("Login Successfully!", {
          position: "bottom-center",
          duration: 3000,
        })
        router.push("/dashboard")
      } else {
        toast.error("Invalid credentials, please try again.", {
          position: "bottom-center",
          duration: 3000,
        })
      }
    } catch (error: unknown) {
      const apiError = error as ApiErrorResponse
      toast.error(apiError.response?.data?.detail || "Login failed. Please try again.", {
        position: "bottom-center",
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-4xl overflow-hidden shadow-xl rounded-lg bg-white dark:bg-gray-800">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Logo Section */}
          <div className="hidden md:flex flex-col items-center justify-center p-8 bg-primary/5">
            <div className="relative w-full max-w-[280px] aspect-square">
              <Image src="/logo.png" alt="logo" width={350} height={350} className="object-contain" />
            </div>
            <div className="mt-8 text-center">
              <h2 className="text-xl font-medium text-primary">Welcome Back</h2>
              <p className="mt-2 text-gray-500 dark:text-gray-400">Sign in to access your account</p>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-8">
            <div className="pb-6">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Sign In</h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Enter your credentials to access your account</p>
            </div>
            <div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email or Username
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      id="username"
                      type="text"
                      placeholder="Enter your email or phone"
                      className={`w-full pl-10 pr-3 py-2 border rounded-md transition-all focus:ring-2 focus:ring-primary ${errors.username ? "border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600"}`}

                      {...register("username", { required: "This field is required" })}
                    />
                  </div>
                  {errors.username && <p className="text-sm font-medium text-red-500 mt-1">{errors.username.message}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Password
                    </label>
                    <a 
                      href="#" 
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className={`w-full pl-10 pr-10 py-2 border rounded-md transition-all focus:ring-2 focus:ring-primary ${errors.password ? "border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600"}`}

                      {...register("password", { required: "Password is required" })}
                    />
                    <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>

                  </div>
                  {errors.password && <p className="text-sm font-medium text-red-500 mt-1">{errors.password.message}</p>}
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>
            </div>
            <div className="flex justify-center mt-6">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Not a member?{" "}
                <a 
                  href="#" 
                  className="text-primary hover:underline"
                >
                  Sign up now
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}