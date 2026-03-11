"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRegister } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Store, User, HeartHandshake, Leaf, ArrowRight } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function Register() {
  const registerMutation = useRegister();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Individual", // default
    locationLat: "40.7128", // Mock default data
    locationLng: "-74.0060"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(formData, {
      onSuccess: () => router.push("/")
    });
  };

  const handleRoleChange = (val: string) => {
    setFormData({ ...formData, role: val });
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background">
      {/* Form side */}
      <div className="flex items-center justify-center p-8 sm:p-12 relative order-2 lg:order-1">
        <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium transition-colors">
          <ArrowRight className="w-4 h-4 rotate-180" /> Back to home
        </Link>
        
        <div className="w-full max-w-md space-y-8 mt-12 lg:mt-0">
          <div>
            <h2 className="text-3xl font-display font-bold text-foreground">Create an Account</h2>
            <p className="text-muted-foreground mt-2">Join the movement and start making an impact.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Label className="text-base">I am joining as a...</Label>
              <RadioGroup value={formData.role} onValueChange={handleRoleChange} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                <Label htmlFor="r-ind" className={`
                  flex flex-col items-center justify-center p-4 border-2 rounded-2xl cursor-pointer transition-all
                  ${formData.role === 'Individual' ? 'border-primary bg-primary/5 shadow-sm' : 'border-border/50 bg-card hover:bg-muted/50'}
                `}>
                  <RadioGroupItem value="Individual" id="r-ind" className="sr-only" />
                  <User className={`w-6 h-6 mb-2 ${formData.role === 'Individual' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="font-semibold">Individual</span>
                </Label>

                <Label htmlFor="r-ngo" className={`
                  flex flex-col items-center justify-center p-4 border-2 rounded-2xl cursor-pointer transition-all
                  ${formData.role === 'NGO' ? 'border-primary bg-primary/5 shadow-sm' : 'border-border/50 bg-card hover:bg-muted/50'}
                `}>
                  <RadioGroupItem value="NGO" id="r-ngo" className="sr-only" />
                  <HeartHandshake className={`w-6 h-6 mb-2 ${formData.role === 'NGO' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="font-semibold">NGO</span>
                </Label>

                <Label htmlFor="r-prov" className={`
                  flex flex-col items-center justify-center p-4 border-2 rounded-2xl cursor-pointer transition-all
                  ${formData.role === 'Provider' ? 'border-primary bg-primary/5 shadow-sm' : 'border-border/50 bg-card hover:bg-muted/50'}
                `}>
                  <RadioGroupItem value="Provider" id="r-prov" className="sr-only" />
                  <Store className={`w-6 h-6 mb-2 ${formData.role === 'Provider' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="font-semibold text-center leading-tight">Provider <br/><span className="text-[10px] font-normal text-muted-foreground">(Store/Cafe)</span></span>
                </Label>
              </RadioGroup>
            </div>

            <div className="space-y-4 pt-4 border-t border-border/50">
              <div className="space-y-2">
                <Label htmlFor="name">{formData.role === 'Provider' ? 'Business Name' : 'Full Name'}</Label>
                <Input 
                  id="name" 
                  required 
                  className="rounded-xl h-12 px-4 bg-card"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  required 
                  className="rounded-xl h-12 px-4 bg-card"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  className="rounded-xl h-12 px-4 bg-card"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={registerMutation.isPending}
              className="w-full h-12 rounded-xl text-base shadow-lg shadow-primary/20 hover:shadow-xl transition-all font-semibold mt-8"
            >
              {registerMutation.isPending ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>

      {/* Visual side */}
      <div className="hidden lg:flex flex-col justify-center items-center p-12 bg-primary relative overflow-hidden text-white order-1 lg:order-2">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-300/40 via-emerald-600/20 to-emerald-900/80 mix-blend-overlay"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 max-w-lg text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-white text-primary rounded-full flex items-center justify-center mb-8 shadow-2xl">
            <Leaf className="w-10 h-10" />
          </div>
          <h2 className="text-4xl font-display font-bold leading-tight mb-6">
            Small Actions, <br/>Massive Impact.
          </h2>
          <p className="text-emerald-50 text-lg leading-relaxed">
            By joining Reserve, you are becoming part of a global community dedicated to fighting food waste and protecting our environment.
          </p>
        </div>
      </div>
    </div>
  );
}
