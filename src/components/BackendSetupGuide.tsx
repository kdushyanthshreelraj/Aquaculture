import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, Terminal, FileCode, Play } from "lucide-react";
import { toast } from "sonner";

interface BackendSetupGuideProps {
  onHealthCheckSuccess?: () => void;
}

const BackendSetupGuide = ({ onHealthCheckSuccess }: BackendSetupGuideProps) => {
  const [checking, setChecking] = useState(false);
  const [backendStatus, setBackendStatus] = useState<{
    isOnline: boolean;
    modelLoaded: boolean;
    error?: string;
  } | null>(null);

  const checkBackendHealth = async () => {
    setChecking(true);
    try {
      const FLASK_BACKEND_URL = import.meta.env.VITE_FLASK_BACKEND_URL || 'http://localhost:5000';
      
      const response = await fetch(`${FLASK_BACKEND_URL}/health`, {
        method: 'GET',
        mode: 'cors'
      });

      if (response.ok) {
        const data = await response.json();
        setBackendStatus({
          isOnline: true,
          modelLoaded: data.model_loaded
        });
        
        if (data.model_loaded) {
          toast.success("Backend is ready! ✅");
          onHealthCheckSuccess?.();
        } else {
          toast.warning("Backend is running but model not loaded. Please train/place model.");
        }
      } else {
        throw new Error("Backend returned error");
      }
    } catch (error) {
      setBackendStatus({
        isOnline: false,
        modelLoaded: false,
        error: "Cannot connect to Flask backend"
      });
      toast.error("Backend not accessible");
    } finally {
      setChecking(false);
    }
  };

  return (
    <Card className="mb-6 border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-red-500/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-orange-500" />
              Backend Setup Required
            </CardTitle>
            <CardDescription>
              Disease detection uses a separate Flask ML backend
            </CardDescription>
          </div>
          <Button 
            onClick={checkBackendHealth} 
            disabled={checking}
            variant="outline"
            size="sm"
          >
            {checking ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              "Test Connection"
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Display */}
        {backendStatus && (
          <Alert className={backendStatus.isOnline ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"}>
            <AlertDescription className="space-y-2">
              <div className="flex items-center gap-2">
                {backendStatus.isOnline ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="font-semibold">
                  Backend: {backendStatus.isOnline ? "Online" : "Offline"}
                </span>
              </div>
              {backendStatus.isOnline && (
                <div className="flex items-center gap-2">
                  {backendStatus.modelLoaded ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-orange-500" />
                  )}
                  <span className="font-semibold">
                    ML Model: {backendStatus.modelLoaded ? "Loaded ✓" : "Not Loaded"}
                  </span>
                </div>
              )}
              {backendStatus.error && (
                <p className="text-sm text-muted-foreground">{backendStatus.error}</p>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Setup Instructions */}
        {(!backendStatus || !backendStatus.isOnline) && (
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Play className="h-4 w-4 text-orange-500" />
              Quick Setup (3 steps):
            </h4>
            
            <div className="space-y-3 text-sm">
              <div className="flex gap-3 p-3 rounded-lg bg-background/50">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <div>
                  <p className="font-semibold text-foreground mb-1">Install Python Dependencies</p>
                  <code className="block bg-muted p-2 rounded text-xs text-foreground">
                    cd backend<br />
                    pip install -r requirements.txt
                  </code>
                </div>
              </div>

              <div className="flex gap-3 p-3 rounded-lg bg-background/50">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <div>
                  <p className="font-semibold text-foreground mb-1">
                    <FileCode className="h-3 w-3 inline mr-1" />
                    Place Trained Model
                  </p>
                  <p className="text-muted-foreground mb-1">
                    Put your <code className="bg-muted px-1 rounded text-foreground">fish_disease_model.keras</code> file here:
                  </p>
                  <code className="block bg-muted p-2 rounded text-xs text-foreground">
                    backend/models/fish_disease_model.keras
                  </code>
                  <p className="text-muted-foreground text-xs mt-1">
                    ⚠️ Model file not included in repo (too large)
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-3 rounded-lg bg-background/50">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <div>
                  <p className="font-semibold text-foreground mb-1">Start Flask Server</p>
                  <code className="block bg-muted p-2 rounded text-xs text-foreground">
                    python app.py
                  </code>
                  <p className="text-muted-foreground text-xs mt-1">
                    Server will run on: <code className="bg-muted px-1 rounded text-foreground">http://localhost:5000</code>
                  </p>
                </div>
              </div>
            </div>

            <Alert className="bg-blue-500/10 border-blue-500/30">
              <AlertDescription className="text-sm text-foreground">
                <p className="font-semibold mb-1">Need to train the model?</p>
                <p>Place your fish disease dataset in <code className="bg-muted px-1 rounded">backend/dataset/</code> and run:</p>
                <code className="block bg-muted p-2 rounded text-xs mt-2 text-foreground">
                  python train_model.py
                </code>
                <p className="text-xs text-muted-foreground mt-1">
                  Training takes 1-2 hours with GPU
                </p>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Success State */}
        {backendStatus?.isOnline && backendStatus?.modelLoaded && (
          <Alert className="bg-green-500/10 border-green-500/30">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-foreground">
              <p className="font-semibold">Backend is ready! 🎉</p>
              <p className="text-sm text-muted-foreground">You can now upload fish images for disease detection.</p>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default BackendSetupGuide;
