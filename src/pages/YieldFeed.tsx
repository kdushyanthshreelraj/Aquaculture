import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp } from "lucide-react";
import Navigation from "@/components/Navigation";
import { toast } from "sonner";
import Footer from "@/components/Footer";

const SPECIES_DATA = {
  "Catla": { stockingDensity: 4.5, avgFinalWeight: 1.75, feedingRate: 4, survivalRate: 90, feedingSessions: 3 },
  "Rohu": { stockingDensity: 5, avgFinalWeight: 1.2, feedingRate: 3.5, survivalRate: 90, feedingSessions: 3 },
  "Mrigal": { stockingDensity: 5, avgFinalWeight: 1.2, feedingRate: 3.5, survivalRate: 90, feedingSessions: 3 },
  "Tilapia": { stockingDensity: 4, avgFinalWeight: 0.5, feedingRate: 4, survivalRate: 90, feedingSessions: 2 },
  "Pangasius": { stockingDensity: 4, avgFinalWeight: 0.8, feedingRate: 4, survivalRate: 90, feedingSessions: 2 }
};

const YieldFeed = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedSpecies, setSelectedSpecies] = useState("");
  const [singlePondLength, setSinglePondLength] = useState("");
  const [singlePondWidth, setSinglePondWidth] = useState("");
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Load from location state or sessionStorage
      if (location.state?.species) {
        setSelectedSpecies(location.state.species);
      }
      
      if (location.state?.singlePondLength && location.state?.singlePondWidth) {
        setSinglePondLength(location.state.singlePondLength.toString());
        setSinglePondWidth(location.state.singlePondWidth.toString());
      }
      
      const savedPondDimensions = sessionStorage.getItem('singlePondDimensions');
      const savedSpeciesData = sessionStorage.getItem('fishSpeciesData');
      const savedYieldData = sessionStorage.getItem('yieldFeedData');
      
      if (savedPondDimensions) {
        const dims = JSON.parse(savedPondDimensions);
        setSinglePondLength(dims.length.toString());
        setSinglePondWidth(dims.width.toString());
      }
      
      if (savedSpeciesData && !location.state?.species) {
        const data = JSON.parse(savedSpeciesData);
        if (data.detectedSpecies) {
          setSelectedSpecies(data.detectedSpecies);
        }
      }
      
      if (savedYieldData) {
        setResults(JSON.parse(savedYieldData));
      }
    };
    
    checkAuth();
  }, [navigate, location]);

  const calculateYieldAndFeed = () => {
    if (!selectedSpecies || !singlePondLength || !singlePondWidth) {
      toast.error("Please fill in all fields");
      return;
    }

    const speciesInfo = SPECIES_DATA[selectedSpecies as keyof typeof SPECIES_DATA];
    const L = parseFloat(singlePondLength);
    const W = parseFloat(singlePondWidth);

    // Calculations
    const pondArea = L * W;
    const numFingerlings = pondArea * speciesInfo.stockingDensity;
    const survivingFish = (numFingerlings * speciesInfo.survivalRate) / 100;
    const estimatedYield = survivingFish * speciesInfo.avgFinalWeight;
    const totalBiomass = estimatedYield;
    const dailyFeed = (totalBiomass * speciesInfo.feedingRate) / 100;
    const feedPerSession = dailyFeed / speciesInfo.feedingSessions;

    const resultData = {
      pondArea: pondArea.toFixed(2),
      numFingerlings: Math.round(numFingerlings),
      survivingFish: Math.round(survivingFish),
      estimatedYield: estimatedYield.toFixed(2),
      totalBiomass: totalBiomass.toFixed(2),
      dailyFeed: dailyFeed.toFixed(2),
      feedPerSession: feedPerSession.toFixed(2),
      feedingSessions: speciesInfo.feedingSessions,
      stockingDensity: speciesInfo.stockingDensity,
      avgFinalWeight: speciesInfo.avgFinalWeight,
      feedingRate: speciesInfo.feedingRate,
      survivalRate: speciesInfo.survivalRate,
    };
    
    setResults(resultData);
    
    // Store in sessionStorage for session-based persistence
    sessionStorage.setItem('yieldFeedData', JSON.stringify(resultData));

    toast.success("Yield and feed calculated successfully!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <Card
          className="group relative max-w-4xl mx-auto overflow-hidden border border-border/60 bg-gradient-to-br from-background/70 via-background/90 to-primary/10 backdrop-blur-xl cursor-default transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(0,0,0,0.35)] hover:border-primary/70 hover:saturate-150"
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-3xl">Yield & Feed Prediction</CardTitle>
                <CardDescription>Calculate expected yield and feeding requirements</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="species">Fish Species</Label>
                <Select value={selectedSpecies} onValueChange={setSelectedSpecies}>
                  <SelectTrigger id="species">
                    <SelectValue placeholder="Select species" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Catla">Catla</SelectItem>
                    <SelectItem value="Rohu">Rohu</SelectItem>
                    <SelectItem value="Mrigal">Mrigal</SelectItem>
                    <SelectItem value="Tilapia">Tilapia</SelectItem>
                    <SelectItem value="Pangasius">Pangasius</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="length">Single Pond Length (meters)</Label>
                <Input
                  id="length"
                  type="number"
                  // placeholder="Auto-filled from design"
                  value={singlePondLength}
                  onChange={(e) => setSinglePondLength(e.target.value)}
                  step="0.1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="width">Single Pond Width (meters)</Label>
                <Input
                  id="width"
                  type="number"
                  // placeholder="Auto-filled from design"
                  value={singlePondWidth}
                  onChange={(e) => setSinglePondWidth(e.target.value)}
                  step="0.1"
                />
              </div>
            </div>

            <Button onClick={calculateYieldAndFeed} className="w-full">
              Calculate Yield & Feed
            </Button>

            {results && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-t pt-6">
                  <h3 className="text-xl font-semibold mb-4">Prediction Results</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <Card className="bg-primary/10">
                      <CardHeader>
                        <CardTitle className="text-lg">Expected Yield</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-4xl font-bold text-primary">{results.estimatedYield} kg</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          From {results.survivingFish} surviving fish
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-secondary/15 to-accent/10 border-2 border-secondary/40 shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-lg text-foreground">Daily Feed Required</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-4xl font-bold text-secondary">{results.dailyFeed} kg</p>
                        <p className="text-base text-foreground mt-1">
                          <span className="font-semibold text-foreground">{results.feedPerSession} kg</span> per session
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="bg-muted p-6 rounded-lg space-y-3">
                    <h4 className="font-semibold mb-3">Stocking Details</h4>
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Pond Area:</span>
                        <span className="ml-2 font-medium">{results.pondArea} m²</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Stocking Density:</span>
                        <span className="ml-2 font-medium">{results.stockingDensity} fish/m²</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Initial Fingerlings:</span>
                        <span className="ml-2 font-medium">{results.numFingerlings}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Survival Rate:</span>
                        <span className="ml-2 font-medium">{results.survivalRate}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Avg Final Weight:</span>
                        <span className="ml-2 font-medium">{results.avgFinalWeight} kg</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Feeding Rate:</span>
                        <span className="ml-2 font-medium">{results.feedingRate}% body weight</span>
                      </div>
                    </div>
                  </div>

                  <Card className="mt-4 border-l-4 border-l-secondary">
                    <CardHeader>
                      <CardTitle className="text-lg">Feeding Schedule</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Feed <span className="font-bold">{results.feedPerSession} kg</span> per session,{" "}
                        <span className="font-bold">{results.feedingSessions} times daily</span>
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Total daily feed: {results.dailyFeed} kg
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default YieldFeed;