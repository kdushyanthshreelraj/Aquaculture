import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AlertCircle, ArrowRight, ShieldAlert } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const FISH_DISEASES = {
  "Catla": [
    {
      name: "Columnaris Disease",
      symptoms: "Yellowish lesions on gills and body, rapid gill movement, lethargy",
      precautions: "Maintain optimal water quality, avoid overcrowding, and use 3% salt baths for 5–10 minutes as a preventive measure"
    },
    {
      name: "Dactylogyrosis (Gill Flukes)",
      symptoms: "Respiratory distress, gill damage",
      precautions: "Regular gill examinations, use of formalin or potassium permanganate baths, and maintaining clean water conditions"
    },
    {
      name: "Vibriosis",
      symptoms: "Hemorrhagic lesions, abdominal swelling",
      precautions: "Use of antibiotics like oxytetracycline or furazolidone in feed, maintaining water hygiene, and reducing stress factors"
    }
  ],
  "Rohu": [
    {
      name: "Epizootic Ulcerative Syndrome (EUS)",
      symptoms: "Skin ulcers, hemorrhages, lethargy",
      precautions: "Maintain good water quality, avoid handling stress, and use potassium permanganate baths for disinfection"
    },
    {
      name: "Motile Aeromonas Septicemia (MAS)",
      symptoms: "Skin ulcers, hemorrhages, abdominal swelling",
      precautions: "Use of antibiotics like oxytetracycline in feed, maintaining water hygiene, and reducing stress factors"
    },
    {
      name: "Dropsy (Ascites)",
      symptoms: "Abdominal swelling, lethargy",
      precautions: "Maintain optimal water quality, avoid overcrowding, and use of probiotics to enhance immunity"
    }
  ],
  "Mrigal": [
    {
      name: "Leech Infestation",
      symptoms: "Visible leeches on skin and gills",
      precautions: "Application of malathion at 1 liter per acre, maintaining clean water conditions, and regular monitoring"
    },
    {
      name: "Vibriosis",
      symptoms: "White or gray lesions on spleen and intestines",
      precautions: "Use of antibiotics like oxytetracycline or furazolidone in feed, maintaining water hygiene, and reducing stress factors"
    }
  ],
  "Tilapia": [
    {
      name: "Tilapia Lake Virus (TiLV)",
      symptoms: "Sudden deaths, neurological signs",
      precautions: "Implement strict biosecurity measures, control movement of fish, disinfect equipment, and monitor water sources"
    },
    {
      name: "Streptococcosis",
      symptoms: "Skin lesions, lethargy",
      precautions: "Use of vaccines, maintain optimal water quality, and reduce stress factors"
    },
    {
      name: "Parasitic Infections",
      symptoms: "Skin lesions, abnormal swimming behavior",
      precautions: "Regular monitoring for parasites, use of anti-parasitic treatments, and maintaining clean water conditions"
    }
  ],
  "Pangasius": [
    {
      name: "Saprolegniasis (Fungal Infection)",
      symptoms: "Cotton-like growths on skin and gills",
      precautions: "Use of antifungal treatments, maintain clean water conditions, and reduce handling stress"
    },
    {
      name: "Aeromonas Hydrophila Infection",
      symptoms: "Skin ulcers, hemorrhages",
      precautions: "Use of vaccines like ALPHA JECT Panga 2, maintain optimal water quality, and reduce stress factors"
    },
    {
      name: "Protozoan Infections",
      symptoms: "Skin lesions, abnormal swimming behavior",
      precautions: "Use of anti-protozoan treatments, maintain clean water conditions, and regular monitoring"
    }
  ]
};

const FishDisease = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedSpecies, setSelectedSpecies] = useState("");
  const [singlePondLength, setSinglePondLength] = useState("");
  const [singlePondWidth, setSinglePondWidth] = useState("");

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
      } else {
        const savedSpeciesData = sessionStorage.getItem('fishSpeciesData');
        if (savedSpeciesData) {
          const data = JSON.parse(savedSpeciesData);
          if (data.detectedSpecies) {
            setSelectedSpecies(data.detectedSpecies);
          }
        }
      }

      if (location.state?.singlePondLength && location.state?.singlePondWidth) {
        setSinglePondLength(location.state.singlePondLength.toString());
        setSinglePondWidth(location.state.singlePondWidth.toString());
      } else {
        const savedPondDimensions = sessionStorage.getItem('singlePondDimensions');
        if (savedPondDimensions) {
          const dims = JSON.parse(savedPondDimensions);
          setSinglePondLength(dims.length?.toString() || "");
          setSinglePondWidth(dims.width?.toString() || "");
        }
      }
    };
    
    checkAuth();
  }, [navigate, location]);

  const diseases = selectedSpecies ? FISH_DISEASES[selectedSpecies as keyof typeof FISH_DISEASES] : [];

  const goToYieldFeed = () => {
    navigate("/yield-feed", {
      state: {
        species: selectedSpecies,
        singlePondLength,
        singlePondWidth,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <Card
          className="group relative max-w-4xl mx-auto overflow-hidden border border-border/60 bg-gradient-to-br from-background/70 via-background/90 to-destructive/10 backdrop-blur-xl cursor-default transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(0,0,0,0.35)] hover:border-destructive/70 hover:saturate-150"
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-3xl">Fish Disease Information</CardTitle>
                <CardDescription>Common diseases and precautionary measures</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="species">Select Fish Species</Label>
              <Select value={selectedSpecies} onValueChange={setSelectedSpecies}>
                <SelectTrigger id="species">
                  <SelectValue placeholder="Choose a species" />
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

            {selectedSpecies && diseases.length > 0 && (
              <div className="space-y-4 animate-fade-in">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Here are the common diseases for {selectedSpecies} and their prevention methods
                  </AlertDescription>
                </Alert>

                {diseases.map((disease, index) => (
                  <Card key={index} className="border-l-4 border-l-destructive">
                    <CardHeader>
                      <CardTitle className="text-lg">{disease.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">Symptoms:</h4>
                        <p className="text-sm">{disease.symptoms}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">Precautionary Measures:</h4>
                        <p className="text-sm">{disease.precautions}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Button onClick={goToYieldFeed} className="w-full mt-6" size="lg">
                  Next: Yield & Feed Prediction
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

export default FishDisease;