import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Clock, Activity } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

interface ActiveCashier {
  id: number;
  name: string;
  status: 'active' | 'inactive';
  loginTime?: string;
}

export function ActiveCashierStatus() {
  const { t } = useLanguage();
  const [activeCashier, setActiveCashier] = useState<ActiveCashier | null>(null);
  const [loginTime, setLoginTime] = useState<string>('');

  useEffect(() => {
    // Check if there's an active cashier session
    const checkActiveCashier = () => {
      try {
        const cashierData = localStorage.getItem('cashier');
        if (cashierData) {
          const cashier = JSON.parse(cashierData);
          if (cashier.status === 'active') {
            setActiveCashier(cashier);
            setLoginTime(new Date().toLocaleTimeString('fr-FR'));
          }
        }
      } catch (error) {
        console.error('Error checking active cashier:', error);
      }
    };

    checkActiveCashier();
    
    // Check every 30 seconds for updates
    const interval = setInterval(checkActiveCashier, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (!activeCashier) {
    return null;
  }

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-green-800">
          <Activity className="h-5 w-5" />
          {t('cashiers.activeCashier')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-green-600" />
            <span className="font-medium">{activeCashier.name}</span>
          </div>
          <Badge className="bg-green-500 text-white">
            {t('cashiers.active')}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-green-700">
          <Clock className="h-4 w-4" />
          <span>{t('cashiers.loggedInAt')}: {loginTime}</span>
        </div>
        
        <div className="text-xs text-green-600">
          {t('cashiers.activeSession')}
        </div>
      </CardContent>
    </Card>
  );
}
