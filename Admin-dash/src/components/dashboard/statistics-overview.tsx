import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, ShoppingBag, Users } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

const mockStats = {
  dailyRevenue: 2450,
  monthlyRevenue: 67890,
  totalDishes: 156,
  activeTables: 8
};

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color = "primary" 
}: {
  title: string;
  value: string | number;
  icon: any;
  trend?: string;
  color?: "primary" | "success" | "warning" | "accent";
}) => {
  const colorClasses = {
    primary: "text-primary bg-primary/10",
    success: "text-success bg-success/10",
    warning: "text-warning bg-warning/10",
    accent: "text-accent bg-accent/10"
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-soft hover:-translate-y-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className="text-xs text-muted-foreground">
            <TrendingUp className="inline w-3 h-3 mr-1" />
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export function StatisticsOverview() {
  const { t } = useLanguage();
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Revenus Aujourd'hui"
        value={`${mockStats.dailyRevenue} ${t('common.currency')}`}
        icon={DollarSign}
        trend="+12% vs hier"
        color="success"
      />
      <StatCard
        title="Revenus ce Mois"
        value={`${mockStats.monthlyRevenue.toLocaleString()} ${t('common.currency')}`}
        icon={TrendingUp}
        trend="+8% vs mois dernier"
        color="primary"
      />
      <StatCard
        title="Plats Commandés"
        value={mockStats.totalDishes}
        icon={ShoppingBag}
        trend="+15 aujourd'hui"
        color="accent"
      />
      <StatCard
        title="Tables Actives"
        value={`${mockStats.activeTables}/12`}
        icon={Users}
        color="warning"
      />
    </div>
  );
}