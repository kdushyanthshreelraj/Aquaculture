import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowRight, Fish } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const FishSpecies = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [waterType, setWaterType] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [temperature, setTemperature] = useState<number | null>(null);
  const [detectedSpecies, setDetectedSpecies] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Load from location state
      if (location.state?.singlePondLength && location.state?.singlePondWidth) {
        setLength(location.state.singlePondLength.toString());
        setWidth(location.state.singlePondWidth.toString());
      }
    };
    
    checkAuth();
  }, [navigate, location]);

  const detectSpecies = async () => {
    if (!length || !width || !waterType || !locationInput) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      // Call edge function to get weather and detect species
      const { data, error } = await supabase.functions.invoke("detect-fish-species", {
        body: {
          location: locationInput,
          waterType,
          pondLength: parseFloat(length),
          pondWidth: parseFloat(width),
        },
      });

      if (error) throw error;

      setTemperature(data.temperature);
      setDetectedSpecies(data.species);
      
      // Save to database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("fish_species_data").insert({
          user_id: user.id,
          pond_length: parseFloat(length),
          pond_width: parseFloat(width),
          water_type: waterType,
          location: locationInput,
          temperature: data.temperature,
          detected_species: data.species,
        });
      }

      toast.success("Fish species detected successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to detect species");
    } finally {
      setLoading(false);
    }
  };

  const goToDisease = () => {
    navigate("/fish-disease", {
      state: {
        species: detectedSpecies,
        singlePondLength: length,
        singlePondWidth: width,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <Card
          className="group relative max-w-4xl mx-auto overflow-hidden border border-border/60 bg-gradient-to-br from-background/70 via-background/90 to-secondary/10 backdrop-blur-xl cursor-default transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(0,0,0,0.35)] hover:border-secondary/70 hover:saturate-150"
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <Fish className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-3xl">Fish Species Identification</CardTitle>
                <CardDescription>Detect suitable fish species for your pond</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="length">Single Pond Length (meters)</Label>
                <Input
                  id="length"
                  type="number"
                  // placeholder="Auto-filled from design"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  step="0.1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="width">Single Pond Width (meters)</Label>
                <Input
                  id="width"
                  type="number"
                  // placeholder="Auto-filled from design"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  step="0.1"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="water-type">Water Type</Label>
                <Select value={waterType} onValueChange={setWaterType}>
                  <SelectTrigger id="water-type">
                    <SelectValue placeholder="Select water type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="freshwater">Freshwater</SelectItem>
                    <SelectItem value="brackish">Brackish Water</SelectItem>
                    <SelectItem value="saltwater">Saltwater</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location (City)</Label>
                <Input
                  id="location"
                  type="text"
                  placeholder="Mumbai"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                />
              </div>
            </div>

            <Button onClick={detectSpecies} className="w-full" disabled={loading}>
              {loading ? "Detecting Species..." : "Detect Fish Species"}
            </Button>

            {detectedSpecies && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-t pt-6">
                  <h3 className="text-xl font-semibold mb-4">Detection Results</h3>
                  
                  {temperature !== null && (
                    <Card className="mb-4 border-2 border-primary/30 shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-lg text-foreground">Weather Conditions (7-Day Average)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-4xl font-bold text-primary">{temperature}°C</p>
                        <p className="text-sm text-foreground/80 mt-2">Average temperature at {locationInput}</p>
                      </CardContent>
                    </Card>
                  )}

                  <Card className="bg-gradient-to-br from-secondary/15 to-accent/10 border-2 border-secondary/40 shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-2xl text-foreground">Recommended Species</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-5xl font-bold text-secondary mb-4">{detectedSpecies}</p>
                      <p className="text-foreground text-base leading-relaxed">
                        This species is well-suited for your pond conditions based on size, water type, and local climate patterns.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Button onClick={goToDisease} className="w-full" size="lg">
                  Next: Disease Information
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default FishSpecies;