import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Upload, AlertCircle, Info } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import BackendSetupGuide from "@/components/BackendSetupGuide";

const DETECTABLE_DISEASES = [
  "Bacterial diseases - Aeromoniasis",
  "Bacterial gill disease",
  "Bacterial Red disease",
  "Fungal diseases Saprolegniasis",
  "Parasitic diseases",
  "Viral diseases White tail disease",
];

const DiseaseDetection = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [detectionResult, setDetectionResult] = useState<any>(null);
  const [showSetupGuide, setShowSetupGuide] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
    };
    
    checkAuth();
  }, [navigate]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const detectDisease = async () => {
    if (!selectedImage) {
      toast.error("Please select an image first");
      return;
    }

    setLoading(true);
    try {
      // Convert image to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(selectedImage);
      });
      
      const base64Image = await base64Promise;
      
      // Call Flask backend for ML-based disease detection
      // Update this URL to your deployed Flask backend URL
      const FLASK_BACKEND_URL = import.meta.env.VITE_FLASK_BACKEND_URL || 'http://localhost:5000';
      
      const response = await fetch(`${FLASK_BACKEND_URL}/detect-disease`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageBase64: base64Image }),
        mode: 'cors'
      }).catch(err => {
        throw new Error("Flask backend not accessible. Please ensure:\n1. Flask server is running (python backend/app.py)\n2. Model is trained (python backend/train_model.py)\n3. VITE_FLASK_BACKEND_URL is set correctly in .env");
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to detect disease");
      }

      const functionData = await response.json();

      if (!functionData) {
        throw new Error("No data returned from disease detection");
      }

      const result = {
        ...functionData,
        imagePreview: imagePreview
      };

      setDetectionResult(result);
      
      toast.success(result.detected 
        ? `Disease detected: ${result.diseaseName}` 
        : "Analysis complete - Fish appears healthy!");
        
    } catch (error) {
      console.error("Disease detection error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to detect disease. Please try again.";
      toast.error(errorMessage, { duration: 6000 });
    } finally {
      setLoading(false);
    }
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
              <AlertCircle className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-3xl">Fish Disease Detection</CardTitle>
                <CardDescription>Upload an image to detect fish diseases using AI</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Backend Setup Guide */}
            {showSetupGuide && (
              <BackendSetupGuide 
                onHealthCheckSuccess={() => setShowSetupGuide(false)}
              />
            )}
            
            {/* Detectable Diseases Info */}
            <Alert className="bg-primary/5 border-primary/20">
              <Info className="h-4 w-4 text-primary" />
              <AlertDescription>
                <p className="font-semibold mb-2 text-foreground">We can detect the following diseases:</p>
                <ul className="grid md:grid-cols-2 gap-2 text-sm text-foreground">
                  {DETECTABLE_DISEASES.map((disease) => (
                    <li key={disease} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{disease}</span>
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>

            {/* Image Upload */}
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-foreground font-medium mb-2">Click to upload fish image</p>
                  <p className="text-sm text-muted-foreground">Supports: JPG, PNG, JPEG</p>
                </label>
              </div>

              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Selected fish"
                    className="w-full max-h-96 object-contain rounded-lg border border-border"
                  />
                </div>
              )}
            </div>

            <Button 
              onClick={detectDisease} 
              className="w-full" 
              disabled={!selectedImage || loading}
            >
              {loading ? "Detecting Disease..." : "Detect Disease"}
            </Button>

            {/* Detection Results */}
            {detectionResult && (
              <div className="space-y-4 animate-fade-in">
                <div className="border-t pt-6">
                  <h3 className="text-xl font-semibold mb-4 text-foreground">Detection Results</h3>
                  
                  <Card className={`${
                    detectionResult.detected 
                      ? 'bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30' 
                      : 'bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30'
                  }`}>
                    <CardHeader>
                      <CardTitle className={`text-2xl ${
                        detectionResult.detected ? 'text-orange-600 dark:text-orange-400' : 'text-primary'
                      }`}>
                        {detectionResult.diseaseName}
                      </CardTitle>
                      {detectionResult.detected && (
                        <p className="text-sm text-foreground">
                          Confidence: <span className="font-bold text-foreground">{detectionResult.confidence}%</span>
                        </p>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {detectionResult.reasoning && (
                        <div>
                          <h4 className="font-semibold mb-2 text-foreground">Analysis:</h4>
                          <p className="text-sm text-foreground">{detectionResult.reasoning}</p>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="font-semibold mb-2 text-foreground">Description:</h4>
                        <p className="text-sm text-foreground">{detectionResult.description}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2 text-foreground">Treatment & Action:</h4>
                        <p className="text-sm text-foreground">{detectionResult.treatment}</p>
                      </div>
                      
                      {detectionResult.prevention && (
                        <div>
                          <h4 className="font-semibold mb-2 text-foreground">Prevention:</h4>
                          <p className="text-sm text-foreground">{detectionResult.prevention}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {!detectionResult.detected && (
                    <Alert className="mt-4 bg-primary/5 border-primary/20">
                      <Info className="h-4 w-4 text-primary" />
                      <AlertDescription className="text-foreground">
                        The uploaded image does not show signs of any diseases from our database. 
                        If you suspect a disease, please consult with an aquaculture veterinarian.
                      </AlertDescription>
                    </Alert>
                  )}
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

export default DiseaseDetection;
