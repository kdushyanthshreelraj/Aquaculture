import { Fish } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 border-t mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* About System */}
          <div>
            <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              About Our System
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Computer vision approach for automated fish species identification and disease diagnosis 
              in aquaculture systems using machine learning. Our platform helps fish farmers optimize 
              pond design, species selection, disease prevention, and feed management with AI-powered insights.
            </p>
          </div>

          {/* Fish Farming Info */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-primary">Fish Farming</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Fish className="h-4 w-4 mt-1 text-primary" />
                <span>Sustainable aquaculture practices</span>
              </li>
              <li className="flex items-start gap-2">
                <Fish className="h-4 w-4 mt-1 text-primary" />
                <span>Species: Catla, Rohu, Mrigal, Tilapia, Pangasius</span>
              </li>
              <li className="flex items-start gap-2">
                <Fish className="h-4 w-4 mt-1 text-primary" />
                <span>Climate-adapted recommendations</span>
              </li>
              <li className="flex items-start gap-2">
                <Fish className="h-4 w-4 mt-1 text-primary" />
                <span>Disease prevention & management</span>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Our Features</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• AI-powered pond design calculator</li>
              <li>• Weather-based species detection</li>
              <li>• Comprehensive disease database</li>
              <li>• Yield & feed optimization</li>
              <li>• AI disease detection</li>
              <li>• Real-time AI chatbot support</li>
              <li>• Data persistence & tracking</li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            {/* © {new Date().getFullYear()} Aquaculture CV System. All rights reserved. Empowering sustainable aquaculture with machine learning. */}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
