"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLogin } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf, ArrowRight } from "lucide-react";
import { GoogleIcon } from "@/components/ui/google-icon";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const loginMutation = useLogin();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password }, {
      onSuccess: () => router.push("/")
    });
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background">
      {/* Visual side */}
      <div className="hidden lg:flex flex-col justify-center items-center p-12 bg-emerald-900 relative overflow-hidden text-white">
        {/* landing page hero scenic mountain landscape */}
        <img
          src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1920&h=1080&fit=crop"
          alt="Hero banner"
          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay"
        />
        <div className="relative z-10 max-w-lg">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-8 border border-white/20">
            <Leaf className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-5xl font-display font-bold leading-tight mb-6">
            Welcome back to <span className="text-emerald-400">Neednear.</span>
          </h1>
          <p className="text-emerald-100/80 text-xl leading-relaxed">
            Every login is another step towards zero waste. Thanks for being part of our community.
          </p>
        </div>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center p-8 sm:p-12 relative">
        <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium transition-colors">
          <ArrowRight className="w-4 h-4 rotate-180" /> Back to home
        </Link>
        
        <div className="w-full max-w-md space-y-10">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-display font-bold text-foreground">Sign In</h2>
            <p className="text-muted-foreground mt-2">Enter your credentials to access your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                required 
                placeholder="hello@example.com"
                className="rounded-xl h-12 px-4 bg-card"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-sm font-medium text-primary hover:underline">Forgot password?</Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                required 
                className="rounded-xl h-12 px-4 bg-card"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button 
              type="submit" 
              disabled={loginMutation.isPending}
              className="w-full h-12 rounded-xl text-base shadow-lg shadow-primary/20 hover:shadow-xl transition-all font-semibold"
            >
              {loginMutation.isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground font-medium">
                Or continue with
              </span>
            </div>
          </div>

          <Button 
            variant="outline" 
            type="button" 
            onClick={() => window.location.href = "/api/auth/google"}
            className="w-full h-12 rounded-xl text-base shadow-sm hover:shadow-md transition-all font-semibold"
          >
            <GoogleIcon className="mr-2 h-5 w-5" />
            Google
          </Button>

          <p className="text-center text-muted-foreground">
            Don't have an account yet?{" "}
            <Link href="/register" className="text-primary font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
