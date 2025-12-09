import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowRight, Grid3x3 } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const PondDesign = () => {
  const navigate = useNavigate();
  const [landLength, setLandLength] = useState("");
  const [landWidth, setLandWidth] = useState("");
  const [design, setDesign] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      
      // Load from sessionStorage if available
      const savedDesign = sessionStorage.getItem('pondDesign');
      const savedDimensions = sessionStorage.getItem('pondDimensions');
      
      if (savedDesign) {
        setDesign(JSON.parse(savedDesign));
      }
      
      if (savedDimensions) {
        const dims = JSON.parse(savedDimensions);
        setLandLength(dims.length.toString());
        setLandWidth(dims.width.toString());
      }
    };
    
    checkAuth();
  }, [navigate]);

  const calculateDesign = async () => {
    if (!landLength || !landWidth) {
      toast.error("Please enter both length and width");
      return;
    }

    const L = parseFloat(landLength);
    const W = parseFloat(landWidth);

    // Constants
    const EMBANKMENT = 0.5;
    const PATH = 1;
    const POND_DEPTH = 1.5;
    const POND_PROPORTION = 0.7;
    const MIN_POND_DIMENSION = 10 + EMBANKMENT + PATH;
    
    // Check if land is too small
    if (L < MIN_POND_DIMENSION || W < MIN_POND_DIMENSION) {
      toast.error("The land size is too small for pond design. Minimum required dimensions are approximately 11.5m x 11.5m.");
      return;
    }
    
    // Calculations
    const totalArea = L * W;
    
    // Infrastructure areas proportional to land area (base: 1 acre = 4046.856 m²)
    const ACRE_IN_SQM = 4046.856;
    const areaRatio = totalArea / ACRE_IN_SQM;
    const PUMP_STORAGE = Math.round(150 * areaRatio);
    const FEED_SHED = Math.round(200 * areaRatio);
    const BUFFER_DRAINAGE = Math.round(300 * areaRatio);
    const pondArea = totalArea * POND_PROPORTION;
    
    const numRows = Math.floor(L / (10 + EMBANKMENT + PATH));
    const numColumns = Math.floor(W / (10 + EMBANKMENT + PATH));
    
    // Additional check for zero rows/columns
    if (numRows === 0 || numColumns === 0) {
      toast.error("The land size is too small to accommodate even a single pond. Please enter larger dimensions.");
      return;
    }
    
    const innerLength = (L - numRows * (EMBANKMENT + PATH)) / numRows - EMBANKMENT;
    const innerWidth = (W - numColumns * (EMBANKMENT + PATH)) / numColumns - EMBANKMENT;
    
    const pondVolume = innerLength * innerWidth * POND_DEPTH;

    const singlePondLength = innerLength.toFixed(2);
    const singlePondWidth = innerWidth.toFixed(2);

    const designData = {
      totalArea: totalArea.toFixed(2),
      pondArea: pondArea.toFixed(2),
      numRows,
      numColumns,
      totalPonds: numRows * numColumns,
      innerLength: singlePondLength,
      innerWidth: singlePondWidth,
      singlePondLength,
      singlePondWidth,
      pondVolume: pondVolume.toFixed(2),
      pondDepth: POND_DEPTH,
      pumpStorage: PUMP_STORAGE,
      feedShed: FEED_SHED,
      bufferDrainage: BUFFER_DRAINAGE,
    };

    setDesign(designData);
    
    // Store in sessionStorage for session-based persistence
    sessionStorage.setItem('pondDesign', JSON.stringify(designData));
    sessionStorage.setItem('pondDimensions', JSON.stringify({ length: L, width: W }));
    sessionStorage.setItem('singlePondDimensions', JSON.stringify({
      length: parseFloat(singlePondLength),
      width: parseFloat(singlePondWidth)
    }));

    // Save to database
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { error } = await supabase.from("pond_designs").insert({
        user_id: user.id,
        land_length: L,
        land_width: W,
        total_land_area: totalArea,
        pond_area: pondArea,
        num_rows: numRows,
        num_columns: numColumns,
        inner_length: innerLength,
        inner_width: innerWidth,
        pond_volume: pondVolume,
        pond_depth: POND_DEPTH,
      });

      if (error) {
        toast.error("Failed to save design");
      } else {
        toast.success("Pond design saved successfully!");
      }
    }
    setLoading(false);
  };

  const goToFishSpecies = () => {
    if (design) {
      navigate("/fish-species", {
        state: {
          singlePondLength: design.singlePondLength,
          singlePondWidth: design.singlePondWidth,
        },
      });
    }
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
              <Grid3x3 className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-3xl">Pond Design Calculator</CardTitle>
                <CardDescription>Design your aquaculture pond layout</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="length">Land Length (meters)</Label>
                <Input
                  id="length"
                  type="number"
                  placeholder="100"
                  value={landLength}
                  onChange={(e) => setLandLength(e.target.value)}
                  step="0.1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="width">Land Width (meters)</Label>
                <Input
                  id="width"
                  type="number"
                  placeholder="50"
                  value={landWidth}
                  onChange={(e) => setLandWidth(e.target.value)}
                  step="0.1"
                />
              </div>
            </div>

            <Button onClick={calculateDesign} className="w-full" disabled={loading}>
              {loading ? "Calculating..." : "Calculate Design"}
            </Button>

            {design && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-t pt-6">
                  <h3 className="text-xl font-semibold mb-4">Design Results</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Land Area</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold text-primary">{design.totalArea} m²</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Pond Configuration</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold text-primary">
                          {design.numRows} × {design.numColumns}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {design.totalPonds} total ponds
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-6 rounded-xl space-y-3 border-2 border-primary/20 shadow-lg">
                    <h4 className="font-semibold mb-3 text-lg text-foreground">Pond Specifications</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-card p-4 rounded-lg shadow-sm border border-border">
                        <span className="text-muted-foreground text-sm font-medium block mb-1">Single Pond Length:</span>
                        <p className="text-2xl font-bold text-primary">{design.singlePondLength} m</p>
                      </div>
                      <div className="bg-card p-4 rounded-lg shadow-sm border border-border">
                        <span className="text-muted-foreground text-sm font-medium block mb-1">Single Pond Width:</span>
                        <p className="text-2xl font-bold text-primary">{design.singlePondWidth} m</p>
                      </div>
                      <div className="bg-card p-4 rounded-lg shadow-sm border border-border">
                        <span className="text-muted-foreground text-sm font-medium block mb-1">Pond Depth:</span>
                        <p className="text-2xl font-bold text-primary">{design.pondDepth} m</p>
                      </div>
                      <div className="bg-card p-4 rounded-lg shadow-sm border border-border">
                        <span className="text-muted-foreground text-sm font-medium block mb-1">Water Volume per Pond:</span>
                        <p className="text-2xl font-bold text-primary">{design.pondVolume} m³</p>
                      </div>
                      <div className="bg-card p-4 rounded-lg shadow-sm border border-border">
                        <span className="text-muted-foreground text-sm font-medium block mb-1">Total Pond Area:</span>
                        <p className="text-2xl font-bold text-primary">{design.pondArea} m²</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-secondary/10 to-accent/10 p-6 rounded-xl space-y-3 mt-4 border-2 border-secondary/20 shadow-lg">
                    <h4 className="font-semibold mb-3 text-lg text-foreground">Infrastructure Areas (Proportional to Land Size)</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-card p-5 rounded-lg text-center shadow-sm border border-border">
                        <span className="text-foreground text-sm font-medium block mb-2">Pump & Storage</span>
                        <p className="text-3xl font-bold text-secondary">{design.pumpStorage} m²</p>
                      </div>
                      <div className="bg-card p-5 rounded-lg text-center shadow-sm border border-border">
                        <span className="text-foreground text-sm font-medium block mb-2">Feed Shed</span>
                        <p className="text-3xl font-bold text-secondary">{design.feedShed} m²</p>
                      </div>
                      <div className="bg-card p-5 rounded-lg text-center shadow-sm border border-border">
                        <span className="text-foreground text-sm font-medium block mb-2">Buffer/Drainage</span>
                        <p className="text-3xl font-bold text-secondary">{design.bufferDrainage} m²</p>
                      </div>
                    </div>
                    <p className="text-xs text-foreground/70 mt-3 italic bg-background/60 p-2 rounded">Based on 1 acre (4046.86 m²) standard: Pump 150m², Feed 200m², Buffer 300m²</p>
                  </div>
                </div>

                <Button onClick={goToFishSpecies} className="w-full" size="lg">
                  Next: Fish Species Selection
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

export default PondDesign;