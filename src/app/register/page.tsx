"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import { api } from "@/lib/axios";

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  userName: z.string().email({ message: "Please enter a valid email address" }),
  phoneNumber: z.string().length(10, { message: "Phone number must be exactly 10 digits" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"details" | "otp">("details");
  const [pendingData, setPendingData] = useState<RegisterFormValues | null>(null);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onDetailsSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.post(`/auth/send-verification?email=${encodeURIComponent(data.userName)}`);
      setPendingData(data);
      setStep("otp");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send verification email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const onOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingData || !otp) return;
    
    setIsLoading(true);
    setError(null);
    try {
      // 1. Verify OTP
      await api.post("/auth/verify-otp", { userName: pendingData.userName, otp });
      
      // 2. Complete Registration
      await api.post("/auth/register", pendingData);
      
      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid OTP or registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!pendingData) return;
    setIsLoading(true);
    setError(null);
    try {
      await api.post(`/auth/resend-otp?email=${encodeURIComponent(pendingData.userName)}`);
      setError("A new OTP has been sent to your email."); // Using error state to show success message temporarily
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to resend OTP.");
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
        className="w-full max-w-[440px] bg-white p-10 md:p-14 shadow-2xl z-10 relative my-12 overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {step === "details" ? (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-10">
                <h2 className="font-heading tracking-[0.2em] font-bold text-foreground text-xl md:text-2xl mb-2">DHANYA</h2>
                <div className="w-8 h-px bg-gray-200 mx-auto mb-6" />
                <h1 className="text-2xl font-display text-foreground mb-2">Create Account</h1>
                <p className="text-muted-foreground text-sm">Join us to access exclusive collections and factory prices.</p>
              </div>

              <form onSubmit={handleSubmit(onDetailsSubmit)} className="space-y-6">
                <div className="space-y-1 group">
                  <Label htmlFor="name" className="text-[10px] uppercase tracking-widest text-muted-foreground transition-colors group-focus-within:text-black">Full Name</Label>
                  <Input 
                    id="name" 
                    placeholder=""
                    className={`h-12 rounded-none border-x-0 border-t-0 border-b border-gray-300 focus-visible:ring-0 focus-visible:border-black px-0 shadow-none transition-colors bg-transparent ${errors.name ? 'border-red-500 focus-visible:border-red-500' : ''}`}
                    {...register("name")} 
                  />
                  {errors.name && <p className="text-red-500 text-[10px] mt-1">{errors.name.message}</p>}
                </div>

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
                  <Label htmlFor="phoneNumber" className="text-[10px] uppercase tracking-widest text-muted-foreground transition-colors group-focus-within:text-black">Phone Number</Label>
                  <Input 
                    id="phoneNumber" 
                    placeholder=""
                    className={`h-12 rounded-none border-x-0 border-t-0 border-b border-gray-300 focus-visible:ring-0 focus-visible:border-black px-0 shadow-none transition-colors bg-transparent ${errors.phoneNumber ? 'border-red-500 focus-visible:border-red-500' : ''}`}
                    {...register("phoneNumber")} 
                  />
                  {errors.phoneNumber && <p className="text-red-500 text-[10px] mt-1">{errors.phoneNumber.message}</p>}
                </div>

                <div className="space-y-1 group">
                  <Label htmlFor="password" className="text-[10px] uppercase tracking-widest text-muted-foreground transition-colors group-focus-within:text-black">Password</Label>
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
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Continue"}
                </Button>
              </form>

              <div className="mt-10 text-center text-xs text-muted-foreground tracking-wide">
                Already have an account?{" "}
                <Link href="/login" className="text-black font-semibold border-b border-black pb-0.5 hover:text-gray-600 hover:border-gray-600 transition-colors">
                  Sign In
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-10">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MailCheck className="w-5 h-5 text-black" />
                </div>
                <h1 className="text-2xl font-display text-foreground mb-2">Verify Email</h1>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  We've sent a one-time passcode to<br/>
                  <span className="text-black font-medium">{pendingData?.userName}</span>
                </p>
              </div>

              <form onSubmit={onOtpSubmit} className="space-y-6">
                <div className="space-y-1 group">
                  <Label htmlFor="otp" className="text-[10px] uppercase tracking-widest text-muted-foreground transition-colors group-focus-within:text-black">6-Digit Code</Label>
                  <Input 
                    id="otp" 
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="000000"
                    className="h-14 text-center tracking-[1em] text-lg rounded-none border-x-0 border-t-0 border-b border-gray-300 focus-visible:ring-0 focus-visible:border-black px-0 shadow-none transition-colors bg-transparent"
                    required
                  />
                </div>

                {error && <div className={`p-3 text-xs border ${error.includes('sent') ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-500 border-red-100'}`}>{error}</div>}

                <div className="pt-4 space-y-3">
                  <Button 
                    type="submit" 
                    className="w-full h-12 rounded-none bg-black text-white hover:bg-gray-800 text-xs tracking-widest uppercase transition-all hover-lift"
                    disabled={isLoading || otp.length < 6}
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Verify & Register"}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="ghost"
                    onClick={() => setStep("details")}
                    className="w-full h-12 rounded-none text-xs tracking-widest uppercase transition-all"
                    disabled={isLoading}
                  >
                    Back to Details
                  </Button>
                </div>
              </form>

              <div className="mt-8 text-center text-xs text-muted-foreground tracking-wide">
                Didn't receive the code?{" "}
                <button 
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className="text-black font-semibold border-b border-black pb-0.5 hover:text-gray-600 hover:border-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Resend Code
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
