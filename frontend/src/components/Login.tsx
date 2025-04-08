"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Loader2, Lock, Mail } from "lucide-react"
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
  const router = useRouter()

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      const response: LoginResponse = await LoginAPI(data)
      if (response?.access_token) {
        localStorage.setItem("access_token", response.access_token)
        localStorage.setItem("user", JSON.stringify(response.user))
        toast.success("Login Successfully!")
        router.push("/dashboard")
      } else {
        toast.error("Invalid credentials, please try again.")
      }
    } catch (error: unknown) {
      const apiError = error as ApiErrorResponse
      toast.error(apiError.response?.data?.detail || "Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6">
        <div className="flex justify-center">
          <Image src="/logo.png" alt="logo" width={100} height={100} className="object-contain" />
        </div>
        <h2 className="text-center text-2xl font-semibold mt-4">Sign In</h2>
        <p className="text-center text-gray-500 mb-4">Enter your credentials to access your account</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Email or Phone</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                id="username"
                type="text"
                className="w-full border rounded-md px-10 py-2 focus:ring focus:ring-indigo-300"
                {...register("username", { required: "This field is required" })}
              />
            </div>
            {errors.username && <p className="text-sm text-red-500 mt-1">{errors.username.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                id="password"
                type="password"
                className="w-full border rounded-md px-10 py-2 focus:ring focus:ring-indigo-300"
                {...register("password", { required: "Password is required" })}
              />
            </div>
            {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-md flex justify-center items-center"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign In"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Not a member? <a href="#" className="text-indigo-600">Sign up now</a>
        </p>
      </div>
    </div>
  )
}
