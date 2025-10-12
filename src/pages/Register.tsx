import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"register" | "otp">("register");
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, verifySignUpOtp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Register | ThaparAcad";
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await signUp(email, password, name);
    
    if (!error) {
      setStep("otp");
    }
    
    setIsLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    
    setIsLoading(true);
    
    const { error } = await verifySignUpOtp(email, otp, password, name);
    
    if (!error) {
      navigate("/");
    }
    
    setIsLoading(false);
  };

  return (
    <main className="container mx-auto py-10 max-w-md">
      <h1 className="text-3xl font-bold mb-6">Create your account</h1>
      
      {step === "register" && (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input 
              id="name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              minLength={6}
            />
          </div>
          <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
            {isLoading ? "Sending OTP..." : "Register"}
          </Button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <Label htmlFor="otp">Enter 6-digit OTP</Label>
            <p className="text-sm text-muted-foreground mb-4">
              We've sent a verification code to {email}
            </p>
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>
          <Button 
            type="submit" 
            variant="hero" 
            className="w-full" 
            disabled={otp.length !== 6 || isLoading}
          >
            {isLoading ? "Verifying..." : "Verify OTP"}
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            className="w-full"
            onClick={() => setStep("register")}
          >
            Back to Registration
          </Button>
        </form>
      )}

      <p className="text-sm text-muted-foreground mt-4">
        Already have an account? <Link to="/login" className="text-primary">Login</Link>
      </p>
    </main>
  );
};

export default Register;
