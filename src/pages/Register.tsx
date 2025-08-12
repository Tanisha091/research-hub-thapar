import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const Register = () => {
  const { toast } = useToast();
  useEffect(() => {
    document.title = "Register | ThaparAcad";
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Register stub", description: "Connect Supabase to enable secure sign up." });
  };

  return (
    <main className="container mx-auto py-10 max-w-md">
      <h1 className="text-3xl font-bold mb-6">Create your account</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" required />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required />
        </div>
        <Button type="submit" variant="hero" className="w-full">Register</Button>
      </form>
      <p className="text-sm text-muted-foreground mt-4">
        Already have an account? <Link to="/login" className="text-primary">Login</Link>
      </p>
    </main>
  );
};

export default Register;
