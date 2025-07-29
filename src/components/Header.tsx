import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Brain, MessageSquare, User } from "lucide-react";

const Header = () => {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            MedTutor AI
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link 
            to="/chat" 
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Chat
          </Link>
          <Link 
            to="/profile" 
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
          >
            <User className="w-4 h-4" />
            Profile
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">Sign In</Link>
          </Button>
          <Button variant="hero" size="sm" asChild>
            <Link to="/chat">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;