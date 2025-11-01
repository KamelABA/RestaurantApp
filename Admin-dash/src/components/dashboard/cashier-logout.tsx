import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import axios from "axios";

interface CashierLogoutProps {
  onLogout?: () => void;
}

export function CashierLogout({ onLogout }: CashierLogoutProps) {
  const { t } = useLanguage();
  const [cashierName, setCashierName] = useState<string>('');

  useEffect(() => {
    // Get cashier names from server
    const checkActiveCashiers = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/cashiers/active-session');
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          const cashierNames = response.data.map(session => session.name).join(', ');
          setCashierName(cashierNames);
        } else {
          setCashierName('');
        }
      } catch (error) {
        console.error('Error checking active cashiers:', error);
        setCashierName('');
      }
    };

    checkActiveCashiers();
    
    // Check every 30 seconds for updates
    const interval = setInterval(checkActiveCashiers, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      // Get current cashier data from server
      const response = await axios.get('http://localhost:8000/api/cashiers/active-session');
      if (response.data && Array.isArray(response.data)) {
        // Logout all active cashiers
        for (const session of response.data) {
          await axios.post('http://localhost:8000/api/cashiers/logout', {
            cashier_id: session.id
          });
        }
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear local storage as well
      localStorage.removeItem('cashier');
      
      // Redirect back to cashier login (cashier-app frontend runs on port 3000)
      window.location.href = 'http://localhost:3000';
      
      if (onLogout) {
        onLogout();
      }
    }
  };

  if (!cashierName) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-medium text-blue-800">
          {t('cashiers.loggedInAs')}: {cashierName}
        </span>
      </div>
      <Button
        onClick={handleLogout}
        variant="outline"
        size="sm"
        className="ml-auto"
      >
        <LogOut className="h-4 w-4 mr-1" />
        {t('cashiers.logout')}
      </Button>
    </div>
  );
}
