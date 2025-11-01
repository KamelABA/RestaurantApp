import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Clock, 
  MapPin,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  XCircle
} from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

interface Table {
  id: string;
  number: number;
  capacity: number;
  status: "libre" | "reservee" | "occupee";
  currentGuests?: number;
  reservationTime?: string;
  orderStartTime?: string;
  waiter?: string;
}

const mockTables: Table[] = [
  {
    id: "1",
    number: 1,
    capacity: 4,
    status: "occupee",
    currentGuests: 3,
    orderStartTime: "14:30",
    waiter: "Marie"
  },
  {
    id: "2",
    number: 2,
    capacity: 2,
    status: "libre",
    currentGuests: 0
  },
  {
    id: "3",
    number: 3,
    capacity: 6,
    status: "reservee",
    reservationTime: "19:00",
    waiter: "Jean"
  },
  {
    id: "4",
    number: 4,
    capacity: 4,
    status: "occupee",
    currentGuests: 4,
    orderStartTime: "13:45",
    waiter: "Sophie"
  },
  {
    id: "5",
    number: 5,
    capacity: 2,
    status: "libre"
  },
  {
    id: "6",
    number: 6,
    capacity: 8,
    status: "libre"
  }
];

export function TablesOverview() {
  const { t } = useLanguage();
  const [tables, setTables] = useState<Table[]>(mockTables);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const getStatusConfig = () => ({
    libre: {
      label: t('tables.free'),
      color: "bg-success text-success-foreground",
      icon: CheckCircle,
      bgColor: "bg-success/10 border-success/20"
    },
    reservee: {
      label: t('tables.reserved'),
      color: "bg-warning text-warning-foreground",
      icon: AlertCircle,
      bgColor: "bg-warning/10 border-warning/20"
    },
    occupee: {
      label: t('tables.occupied'),
      color: "bg-destructive text-destructive-foreground",
      icon: XCircle,
      bgColor: "bg-destructive/10 border-destructive/20"
    }
  });

  const refreshTables = () => {
    setLastUpdate(new Date());
    // Simulate data refresh
  };

  const getStatusStats = () => {
    const libre = tables.filter(t => t.status === "libre").length;
    const reservee = tables.filter(t => t.status === "reservee").length;
    const occupee = tables.filter(t => t.status === "occupee").length;
    
    return { libre, reservee, occupee, total: tables.length };
  };

  const stats = getStatusStats();
  const statusConfig = getStatusConfig();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('tables.title')}</h2>
          <p className="text-muted-foreground">{t('tables.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            Dernière mise à jour: {lastUpdate.toLocaleTimeString()}
          </span>
          <Button variant="outline" size="sm" onClick={refreshTables}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 text-success rounded-lg">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-success">{stats.libre}</p>
                <p className="text-sm text-muted-foreground">{t('tables.free')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 text-warning rounded-lg">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-warning">{stats.reservee}</p>
                <p className="text-sm text-muted-foreground">{t('tables.reserved')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 text-destructive rounded-lg">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-destructive">{stats.occupee}</p>
                <p className="text-sm text-muted-foreground">{t('tables.occupied')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total tables</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tables.map((table) => {
          const config = statusConfig[table.status];
          const StatusIcon = config.icon;

          return (
            <Card 
              key={table.id}
              className={`transition-all duration-200 hover:shadow-soft hover:-translate-y-1 border-2 ${config.bgColor}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    Table {table.number}
                  </CardTitle>
                  <Badge className={config.color}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {config.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Capacité:</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {table.capacity} places
                  </span>
                </div>

                {table.status === "occupee" && (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Clients:</span>
                      <span>{table.currentGuests}/{table.capacity}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Depuis:</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {table.orderStartTime}
                      </span>
                    </div>
                    {table.waiter && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Serveur:</span>
                        <span>{table.waiter}</span>
                      </div>
                    )}
                  </>
                )}

                {table.status === "reservee" && (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Heure:</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {table.reservationTime}
                      </span>
                    </div>
                    {table.waiter && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Serveur:</span>
                        <span>{table.waiter}</span>
                      </div>
                    )}
                  </>
                )}

                {table.status === "libre" && (
                  <div className="text-center py-2">
                    <p className="text-sm text-muted-foreground">Disponible immédiatement</p>
                  </div>
                )}

                <div className="pt-2 space-y-2">
                  {table.status === "libre" && (
                    <Button variant="default" size="sm" className="w-full bg-gradient-primary">
                      Réserver
                    </Button>
                  )}
                  {table.status === "occupee" && (
                    <Button variant="outline" size="sm" className="w-full">
                      Voir Commande
                    </Button>
                  )}
                  {table.status === "reservee" && (
                    <Button variant="outline" size="sm" className="w-full">
                      Détails Réservation
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}