import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/language-context";
import { Users, Star } from "lucide-react";

interface Cashier {
  id: number;
  name: string;
  status: 'online' | 'offline' | 'break';
  totalSales: number;
  dailySales: number;
  monthlySales: number;
  transactions: number;
  rating: number;
  shift: string;
}

const mockCashiers: Cashier[] = [
  {
    id: 1,
    name: "Ahmed Benali",
    status: "online",
    totalSales: 125000,
    dailySales: 8500,
    monthlySales: 45000,
    transactions: 156,
    rating: 4.8,
    shift: "Matin"
  },
  {
    id: 2,
    name: "Fatima Zohra",
    status: "break",
    totalSales: 98000,
    dailySales: 7200,
    monthlySales: 38000,
    transactions: 134,
    rating: 4.6,
    shift: "Soir"
  },
  {
    id: 3,
    name: "Karim Boudiaf",
    status: "offline",
    totalSales: 110000,
    dailySales: 0,
    monthlySales: 42000,
    transactions: 145,
    rating: 4.7,
    shift: "Nuit"
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'online':
      return 'bg-green-500';
    case 'offline':
      return 'bg-gray-500';
    case 'break':
      return 'bg-yellow-500';
    default:
      return 'bg-gray-500';
  }
};

const getStatusText = (status: string, t: (key: string) => string) => {
  switch (status) {
    case 'online':
      return t('cashiers.online');
    case 'offline':
      return t('cashiers.offline');
    case 'break':
      return t('cashiers.break');
    default:
      return t('cashiers.offline');
  }
};

export function CashierStatistics() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">

      {/* Individual Cashier Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('cashiers.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockCashiers.map((cashier) => (
              <Card key={cashier.id} className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground font-semibold text-lg">
                        {cashier.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-lg">{cashier.name}</div>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(cashier.status)}`} />
                        <Badge variant={cashier.status === 'online' ? 'default' : 'secondary'}>
                          {getStatusText(cashier.status, t)}
                        </Badge>
                        <Badge variant="outline">{cashier.shift}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    <span className="font-semibold text-lg">{cashier.rating}</span>
                  </div>
                </div>
                
                {/* Individual Statistics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {cashier.dailySales.toLocaleString()} {t('common.currency')}
                    </div>
                    <div className="text-sm text-muted-foreground">{t('cashiers.dailySales')}</div>
                  </div>
                  
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {cashier.monthlySales.toLocaleString()} {t('common.currency')}
                    </div>
                    <div className="text-sm text-muted-foreground">{t('cashiers.monthlySales')}</div>
                  </div>
                  
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {cashier.transactions}
                    </div>
                    <div className="text-sm text-muted-foreground">{t('cashiers.transactions')}</div>
                  </div>
                  
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {cashier.totalSales.toLocaleString()} {t('common.currency')}
                    </div>
                    <div className="text-sm text-muted-foreground">{t('cashiers.totalSales')}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
