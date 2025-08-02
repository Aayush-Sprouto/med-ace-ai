import { Link, NavLink } from "react-router-dom"; // <<<--- CHANGE: NavLink import kiya
import { Button } from "@/components/ui/button";
import { Brain, MessageSquare, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Header = () => {
  const { user, signOut } = useAuth();
  
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo (No changes here) */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            MedTutor AI
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <NavLink 
            to="/chat" 
            className={({ isActive }) =>
              `transition-colors flex items-center gap-2 ${
                isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            <MessageSquare className="w-4 h-4" />
            Chat
          </NavLink>
          <NavLink 
            to="/profile" 
            className={({ isActive }) =>
              `transition-colors flex items-center gap-2 ${
                isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            <User className="w-4 h-4" />
            Profile
          </NavLink>
        </nav>

        {/* Right Side: Auth buttons and Mobile Icons */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* <<<--- CHANGE: Mobile Icons - Yeh naya block add kiya hai */}
              <div className="flex items-center gap-1 md:hidden">
                <NavLink 
                  to="/chat" 
                  className={({isActive}) => `p-2 rounded-md transition-colors ${isActive ? 'bg-accent' : 'hover:bg-accent/50'}`}
                >
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                </NavLink>
                <NavLink 
                  to="/profile" 
                  className={({isActive}) => `p-2 rounded-md transition-colors ${isActive ? 'bg-accent' : 'hover:bg-accent/50'}`}
                >
                  <User className="h-5 w-5 text-muted-foreground" />
                </NavLink>
              </div>

              <span className="text-sm text-muted-foreground hidden md:inline">
                Welcome, {user.user_metadata?.display_name || user.email?.split('@')[0]}
              </span>
              <Button variant="ghost" size="sm" onClick={signOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button variant="hero" size="sm" asChild>
                <Link to="/auth">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
