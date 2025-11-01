import React from 'react';
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { User, LogOut, Clock } from "lucide-react";
import { useAuth } from '../contexts/AuthContext';

export function Header() {
  const { cashier, logout } = useAuth();
  const [currentTime, setCurrentTime] = React.useState(new Date());

  // Update time every second
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      logout();
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Interface Caissier</h1>
              <p className="text-sm text-muted-foreground">Gestion des tables et commandes</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Current Time */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {currentTime.toLocaleTimeString('fr-FR')}
          </div>

          {/* Cashier Info */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-medium">{cashier?.name}</div>
              <div className="flex items-center gap-1">
                <Badge 
                  variant={cashier?.status === 'active' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {cashier?.status === 'active' ? 'Actif' : 'Inactif'}
                </Badge>
              </div>
            </div>
            
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {cashier?.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Logout Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </Button>
        </div>
      </div>
    </header>
  );
}
