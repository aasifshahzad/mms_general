"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Loader2, Lock, Mail } from "lucide-react"
import { useRouter } from "next/navigation"
import { LoginAPI } from "@/api/Login/Login"
import { toast } from "sonner"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/libs/utils"

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

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-4xl overflow-hidden border-none shadow-xl">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Logo Section */}
          <div className="hidden md:flex flex-col items-center justify-center p-8 bg-primary/5">
            <div className="relative w-full max-w-[280px] aspect-square">
              <Image src="/logo.png" alt="logo" width={350} height={350} className="object-contain" />
            </div>
            <div className="mt-8 text-center">
              <h2 className="text-xl font-medium text-primary">Welcome Back</h2>
              <p className="mt-2 text-muted-foreground">Sign in to access your account</p>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-8">
            <CardHeader className="p-0 pb-6">
              <CardTitle className="text-2xl font-semibold">Sign In</CardTitle>
              <CardDescription>Enter your credentials to access your account</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Email or Phone</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your email or phone"
                      className={cn("pl-10", errors.username && "border-destructive focus-visible:ring-destructive")}
                      {...register("username", { required: "This field is required" })}
                    />
                  </div>
                  {errors.username && <p className="text-sm font-medium text-destructive">{errors.username.message}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Button variant="link" className="p-0 h-auto text-xs" asChild>
                      <a href="#">Forgot password?</a>
                    </Button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      className={cn("pl-10", errors.password && "border-destructive focus-visible:ring-destructive")}
                      {...register("password", { required: "Password is required" })}
                    />
                  </div>
                  {errors.password && <p className="text-sm font-medium text-destructive">{errors.password.message}</p>}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center p-0 pt-6">
              <p className="text-sm text-muted-foreground">
                Not a member?{" "}
                <Button variant="link" className="p-0 h-auto" asChild>
                  <a href="#">Sign up now</a>
                </Button>
              </p>
            </CardFooter>
          </div>
        </div>
      </Card>
    </div>
  )
}

