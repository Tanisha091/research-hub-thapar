import { useState } from "react";
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

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState<"email" | "otp" | "password">("email");
  const [isLoading, setIsLoading] = useState(false);
  const { sendPasswordResetOtp, verifyOtpAndResetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await sendPasswordResetOtp(email);
    
    if (!error) {
      setStep("otp");
    }
    
    setIsLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    
    setStep("password");
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await verifyOtpAndResetPassword(email, otp, newPassword);
    
    if (!error) {
      navigate("/login");
    }
    
    setIsLoading(false);
  };

  return (
    <main className="container mx-auto py-10 max-w-md">
      <h1 className="text-3xl font-bold mb-6">Reset Password</h1>
      
      {step === "email" && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required 
            />
          </div>
          <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
            {isLoading ? "Sending OTP..." : "Send OTP"}
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
            disabled={otp.length !== 6}
          >
            Verify OTP
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            className="w-full"
            onClick={() => setStep("email")}
          >
            Back to Email
          </Button>
        </form>
      )}

      {step === "password" && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <Input 
              id="newPassword" 
              type="password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              required 
              minLength={6}
            />
          </div>
          <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
            {isLoading ? "Resetting Password..." : "Reset Password"}
          </Button>
        </form>
      )}

      <p className="text-sm text-muted-foreground mt-4">
        Remember your password? <Link to="/login" className="text-primary">Login</Link>
      </p>
    </main>
  );
};

export default ForgotPassword;
