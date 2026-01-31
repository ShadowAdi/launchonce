"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import { loginUser } from "@/actions/user.action";
import { retryAction } from "@/lib/retry-helper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {

  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const router = useRouter();
  const { login, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setRetryCount(0);

    try {
      const result = await retryAction(
        () => loginUser(data.email, data.password),
        {
          maxRetries: 3,
          onRetry: (attempt) => {
            setRetryCount(attempt);
            toast.info(`Connecting... (attempt ${attempt}/3)`);
          },
        }
      );

      if (!result.success) {
        toast.error(result.error || "Login failed");
        setIsLoading(false);
        return;
      }

      login(result.data.token, result.data.user);

      toast.success("Login successful!");

      router.push("/document");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      redirect("/document")
    }
  }, [isAuthLoading, isAuthenticated])

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">Welcome back</h1>
        <p className="text-muted-foreground text-base">Sign in to your account to continue</p>
      </div>

      <div className="bg-background border border-border/50 rounded-2xl p-6 sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email")}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
              className={errors.password ? "border-red-500" : ""}
            />
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-foreground text-background hover:bg-foreground/90 h-11"
            disabled={isLoading}
          >
            {isLoading 
              ? retryCount > 0 
                ? `Retrying... (${retryCount}/3)` 
                : "Signing in..."
              : "Sign in"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">Don't have an account? </span>
          <Link
            href="/register"
            className="font-medium hover:underline underline-offset-4"
          >
            Sign up
          </Link>
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-6">
        By signing in, you agree to our Terms of Service and Privacy Policy
      </p>
    </>
  );
}