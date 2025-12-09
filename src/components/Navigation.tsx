import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Fish, Moon, Sun, LogOut, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import ChatBot from "./ChatBot";
import { getInitialTheme, toggleTheme, type Theme } from "@/lib/theme";

const Navigation = () => {
  const navigate = useNavigate();
  const [showChat, setShowChat] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    try {
      const initial = getInitialTheme();
      setTheme(initial);
    } catch {
      // ignore
    }
  }, []);

  const handleToggleTheme = () => {
    setTheme((current) => toggleTheme(current));
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      // Clear all session data on logout
      sessionStorage.clear();
      toast.success("Signed out successfully");
      navigate("/auth");
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="relative">
          {/* subtle gradient glow behind nav */}
          <div className="pointer-events-none absolute inset-0 -z-10 opacity-70 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.25),transparent_55%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_55%)]" />

          <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
                <img
                  src="/fish-logo.png"
                  alt="Aqua AI"
                  className="h-7 w-7 object-contain"
                />
              </div>
              <span className="hidden md:inline-block text-sm font-semibold tracking-[0.18em] uppercase text-foreground/80">
                AquaAI
              </span>
            </Link>

            <div className="flex items-center gap-1 md:gap-2 text-sm">
              <Button variant="ghost" asChild className="px-3 md:px-4 hover:bg-primary/10">
                <Link to="/">Home</Link>
              </Button>
              <Button variant="ghost" asChild className="px-3 md:px-4 hover:bg-primary/10">
                <Link to="/pond-design">Pond Design</Link>
              </Button>
              <Button variant="ghost" asChild className="px-3 md:px-4 hover:bg-primary/10">
                <Link to="/fish-species">Fish Species</Link>
              </Button>
              <Button variant="ghost" asChild className="px-3 md:px-4 hover:bg-primary/10">
                <Link to="/fish-disease">Disease Info</Link>
              </Button>
              <Button variant="ghost" asChild className="px-3 md:px-4 hover:bg-primary/10">
                <Link to="/yield-feed">Yield & Feed</Link>
              </Button>
              <Button variant="ghost" asChild className="px-3 md:px-4 hover:bg-primary/10">
                <Link to="/disease-detection">Disease Detection</Link>
              </Button>

              <div className="ml-1 flex items-center gap-1 md:gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowChat(true)}
                  className="hover:bg-secondary/10"
                >
                  <MessageCircle className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleToggleTheme}
                  className="hover:bg-secondary/10"
                  aria-label="Toggle dark mode"
                >
                  {theme === "dark" ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleSignOut}
                  className="border-primary/30 bg-background/60 hover:bg-primary/10 hover:border-primary/70"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <ChatBot open={showChat} onClose={() => setShowChat(false)} />
    </>
  );
};

export default Navigation;