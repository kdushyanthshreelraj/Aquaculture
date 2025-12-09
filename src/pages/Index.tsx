import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Fish, Grid3x3, ShieldAlert, TrendingUp, Camera } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      }
    });
  }, [navigate]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1
            className="relative inline-block text-4xl font-bold mb-4 max-w-4xl mx-auto bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent transition-transform duration-300 hover:scale-[1.02]"
          >
            Computer Vision Approach for Automated Fish Species Identification and Disease Diagnosis in Aquaculture Systems Using AI
          </h1>
          <p className="text-xl text-muted-foreground">
            AI-Powered Intelligent Aquaculture Management System
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <Card
            className="group relative overflow-hidden border border-border/60 bg-gradient-to-br from-background/70 via-background/90 to-primary/10 backdrop-blur-xl cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(0,0,0,0.35)] hover:border-primary/70 hover:saturate-150"
            onClick={() => navigate("/pond-design")}
          >
            <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(236,72,153,0.12),_transparent_55%)]" />
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary shadow-inner group-hover:bg-primary/20 transition-colors">
                  <Grid3x3 className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg font-semibold tracking-tight">Pond Design</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <CardDescription className="text-sm leading-relaxed">
                Design your aquaculture pond layout with optimal dimensions and infrastructure planning
              </CardDescription>
              <Button className="w-full mt-2 group-hover:translate-y-[1px] transition-transform" variant="outline">
                Start Design
              </Button>
            </CardContent>
          </Card>

          <Card
            className="group relative overflow-hidden border border-border/60 bg-gradient-to-br from-background/70 via-background/90 to-secondary/10 backdrop-blur-xl cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(0,0,0,0.35)] hover:border-secondary/70 hover:saturate-150"
            onClick={() => navigate("/fish-species")}
          >
            <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.2),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(45,212,191,0.16),_transparent_55%)]" />
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary shadow-inner group-hover:bg-primary/20 transition-colors">
                  <Fish className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg font-semibold tracking-tight">Fish Species</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <CardDescription className="text-sm leading-relaxed">
                Identify suitable fish species based on your pond conditions and local climate
              </CardDescription>
              <Button className="w-full mt-2 group-hover:translate-y-[1px] transition-transform" variant="outline">
                Identify Species
              </Button>
            </CardContent>
          </Card>

          <Card
            className="group relative overflow-hidden border border-border/60 bg-gradient-to-br from-background/70 via-background/90 to-destructive/10 backdrop-blur-xl cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(0,0,0,0.35)] hover:border-destructive/70 hover:saturate-150"
            onClick={() => navigate("/fish-disease")}
          >
            <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_top,_rgba(248,113,113,0.22),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(251,191,36,0.16),_transparent_55%)]" />
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary shadow-inner group-hover:bg-primary/20 transition-colors">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg font-semibold tracking-tight">Disease Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <CardDescription className="text-sm leading-relaxed">
                Learn about common fish diseases and preventive measures for healthy fish farming
              </CardDescription>
              <Button className="w-full mt-2 group-hover:translate-y-[1px] transition-transform" variant="outline">
                View Diseases
              </Button>
            </CardContent>
          </Card>

          <Card
            className="group relative overflow-hidden border border-border/60 bg-gradient-to-br from-background/70 via-background/90 to-primary/10 backdrop-blur-xl cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(0,0,0,0.35)] hover:border-primary/70 hover:saturate-150"
            onClick={() => navigate("/yield-feed")}
          >
            <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.2),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(52,211,153,0.16),_transparent_55%)]" />
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary shadow-inner group-hover:bg-primary/20 transition-colors">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg font-semibold tracking-tight">Yield & Feed</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <CardDescription className="text-sm leading-relaxed">
                Calculate expected yield and optimize feeding schedules for maximum productivity
              </CardDescription>
              <Button className="w-full mt-2 group-hover:translate-y-[1px] transition-transform" variant="outline">
                Calculate Yield
              </Button>
            </CardContent>
          </Card>

          <Card
            className="group relative overflow-hidden border border-border/60 bg-gradient-to-br from-background/70 via-background/90 to-secondary/10 backdrop-blur-xl cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(0,0,0,0.35)] hover:border-secondary/70 hover:saturate-150"
            onClick={() => navigate("/disease-detection")}
          >
            <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.22),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(56,189,248,0.16),_transparent_55%)]" />
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary shadow-inner group-hover:bg-primary/20 transition-colors">
                  <Camera className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg font-semibold tracking-tight">Disease Detection</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <CardDescription className="text-sm leading-relaxed">
                Upload fish images to detect diseases using AI-powered analysis
              </CardDescription>
              <Button className="w-full mt-2 group-hover:translate-y-[1px] transition-transform" variant="outline">
                Detect Disease
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
