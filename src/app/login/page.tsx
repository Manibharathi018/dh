"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/lib/axios";

const loginSchema = z.object({
  userName: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post("/auth/login", {
        userNameOrPhoneNumber: data.userName,
        password: data.password,
      });
      if (response.data) {
        const user = response.data;
        const token = user.token || "http-only-cookie";
        document.cookie = `role=${user.role}; path=/; max-age=7776000; SameSite=Lax`;
        login(user, token);

        if (user.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f7f5] px-4 relative overflow-hidden">
      {/* Subtle decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40" style={{ background: "radial-gradient(circle at 50% 0%, rgba(200,180,150,0.1) 0%, transparent 70%)" }} />
      
      <Link href="/" className="absolute top-8 left-8 md:top-12 md:left-12 text-gray-500 z-10 flex items-center hover:text-black transition-colors uppercase text-[10px] tracking-widest">
        <ArrowLeft className="w-3 h-3 mr-2" /> Return to Store
      </Link>
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[440px] bg-white p-10 md:p-14 shadow-2xl z-10 relative"
      >
        <div className="text-center mb-10">
          <h2 className="font-heading tracking-[0.2em] font-bold text-foreground text-xl md:text-2xl mb-2">DHANYA</h2>
          <div className="w-8 h-px bg-gray-200 mx-auto mb-6" />
          <h1 className="text-2xl font-display text-foreground mb-2">Welcome Back</h1>
          <p className="text-muted-foreground text-sm">Enter your credentials to access your account.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-1 group">
            <Label htmlFor="userName" className="text-[10px] uppercase tracking-widest text-muted-foreground transition-colors group-focus-within:text-black">Email Address</Label>
            <Input 
              id="userName" 
              type="email" 
              placeholder=""
              className={`h-12 rounded-none border-x-0 border-t-0 border-b border-gray-300 focus-visible:ring-0 focus-visible:border-black px-0 shadow-none transition-colors bg-transparent ${errors.userName ? 'border-red-500 focus-visible:border-red-500' : ''}`}
              {...register("userName")} 
            />
            {errors.userName && <p className="text-red-500 text-[10px] mt-1">{errors.userName.message}</p>}
          </div>

          <div className="space-y-1 group">
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="text-[10px] uppercase tracking-widest text-muted-foreground transition-colors group-focus-within:text-black">Password</Label>
              <Link href="/forgot-password" className="text-[10px] text-gray-400 hover:text-black transition-colors uppercase tracking-widest">Forgot?</Link>
            </div>
            <Input 
              id="password" 
              type="password" 
              placeholder=""
              className={`h-12 rounded-none border-x-0 border-t-0 border-b border-gray-300 focus-visible:ring-0 focus-visible:border-black px-0 shadow-none transition-colors bg-transparent ${errors.password ? 'border-red-500 focus-visible:border-red-500' : ''}`}
              {...register("password")} 
            />
            {errors.password && <p className="text-red-500 text-[10px] mt-1">{errors.password.message}</p>}
          </div>

          {error && <div className="bg-red-50 text-red-500 p-3 text-xs border border-red-100">{error}</div>}

          <Button 
            type="submit" 
            className="w-full h-12 rounded-none bg-black text-white hover:bg-gray-800 text-xs tracking-widest uppercase transition-all mt-8 hover-lift"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Sign In"}
          </Button>
        </form>

        <div className="mt-10 text-center text-xs text-muted-foreground tracking-wide">
          Don't have an account?{" "}
          <Link href="/register" className="text-black font-semibold border-b border-black pb-0.5 hover:text-gray-600 hover:border-gray-600 transition-colors">
            Create one
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
