import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { UserProfileDropdown } from "@/components/layout/UserProfileDropdown";
import { useUserRole } from "@/hooks/useUserRole";
import { Shield, GraduationCap } from "lucide-react";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
    isActive ? "bg-secondary text-secondary-foreground" : "hover:bg-accent hover:text-accent-foreground"
  }`;

const SiteHeader = () => {
  const { user } = useAuth();
  const { isAdmin, isTeacher } = useUserRole();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="text-xl">ThaparAcad</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/" className={navLinkClass} end>
            Research Portal
          </NavLink>
          {(isTeacher || isAdmin) && user && (
            <NavLink to="/teacher" className={navLinkClass}>
              <span className="flex items-center gap-1">
                <GraduationCap className="h-4 w-4" />
                Teacher Dashboard
              </span>
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" className={navLinkClass}>
              <span className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                Admin Portal
              </span>
            </NavLink>
          )}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <UserProfileDropdown />
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild variant="hero">
                <Link to="/register">Register</Link>
              </Button>
              <Button asChild variant="outline" className="gap-1">
                <Link to="/admin-login">
                  <Shield className="h-4 w-4" />
                  Admin
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
