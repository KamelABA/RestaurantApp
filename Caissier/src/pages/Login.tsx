import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Lock, User } from "lucide-react";
import React from "react"; // Added missing import

interface LoginProps {
  onLogin: (username: string) => void;
}

export const Login = ({ onLogin }: LoginProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Prevent any redirects to admin dashboard
  const preventAdminRedirects = () => {
    // Clear any admin-related localStorage
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('cashier');
    
    // Set cashier-specific flags
    localStorage.setItem('cashierApp', 'true');
    localStorage.setItem('userRole', 'cashier');
    
    // Ensure we're in the right app
    if (window.location.port !== '3000') {
      console.warn('Cashier app should run on port 3000');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    
    // Prevent admin redirects before login
    preventAdminRedirects();
    
    setIsLoading(true);
    // Simulate login delay
    setTimeout(() => {
      onLogin(username);
      setIsLoading(false);
    }, 1000);
  };

  const clearStoredData = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('loginTime');
    localStorage.removeItem('cashierApp');
    localStorage.removeItem('userRole');
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('cashier');
    window.location.reload();
  };

  // Prevent redirects on component mount
  React.useEffect(() => {
    preventAdminRedirects();
  }, []);

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Nom d'utilisateur
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="Entrez votre nom d'utilisateur"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Mot de passe
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Entrez votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-3">
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || !username || !password}
          >
            {isLoading ? "Connexion..." : "Se connecter"}
          </Button>
          
          <Button 
            type="button" 
            variant="outline" 
            className="w-full text-sm"
            onClick={clearStoredData}
          >
            Effacer les données de session
          </Button>
        </div>
        
        {/* Clear message that this is cashier interface */}
        <div className="text-center text-sm text-muted-foreground pt-4 border-t">
          <p>🛒 Interface Caissier - Port 3000</p>
          <p className="text-xs">Vous resterez dans l'interface caissier</p>
          <p className="text-xs text-red-500">PAS de redirection vers admin dashboard</p>
        </div>
      </form>
    </AuthLayout>
  );
};