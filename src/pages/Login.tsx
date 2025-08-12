import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const Login = () => {
  const { toast } = useToast();
  useEffect(() => {
    document.title = "Login | ThaparAcad";
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Login stub", description: "Connect Supabase to enable secure authentication." });
  };

  return (
    <main className="container mx-auto py-10 max-w-md">
      <h1 className="text-3xl font-bold mb-6">Login</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required />
        </div>
        <Button type="submit" variant="hero" className="w-full">Login</Button>
      </form>
      <p className="text-sm text-muted-foreground mt-4">
        No account? <Link to="/register" className="text-primary">Register</Link>
      </p>
    </main>
  );
};

export default Login;
