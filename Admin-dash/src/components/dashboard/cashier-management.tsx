import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/language-context";
import { Users, Plus, Trash2, Eye, EyeOff, UserPlus, Info, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

interface Cashier {
  id: number;
  name: string;
  password: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export function CashierManagement() {
  const { t } = useLanguage();
  const [cashiers, setCashiers] = useState<Cashier[]>([]);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showInfo, setShowInfo] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    phone: "",
    email: ""
  });
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [loggedInCashiers, setLoggedInCashiers] = useState<{id: number, name: string}[]>([]);

  // Fetch cashiers from database
  const fetchCashiers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/cashiers');
      setCashiers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching cashiers:', error);
      toast.error('Failed to load cashiers from database');
    } finally {
      setLoading(false);
    }
  };

  // Check for logged in cashiers
  const checkLoggedInCashiers = async () => {
    try {
      console.log('Checking server for active cashier sessions...');
      const response = await axios.get('http://localhost:8000/api/cashiers/active-session');
      
      if (response.data && Array.isArray(response.data)) {
        console.log('Active sessions found:', response.data);
        const activeCashiers = response.data.map(session => ({
          id: session.id,
          name: session.name
        }));
        setLoggedInCashiers(activeCashiers);
        console.log('Set logged in cashiers:', activeCashiers);
      } else {
        console.log('No active sessions found');
        setLoggedInCashiers([]);
      }
    } catch (error) {
      console.error('Error checking logged in cashiers:', error);
      setLoggedInCashiers([]);
    }
  };

  // Load cashiers on component mount
  useEffect(() => {
    fetchCashiers();
    checkLoggedInCashiers();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegister = async () => {
    if (!formData.name.trim() || !formData.password) {
      toast.error(t('cashierManagement.fillAllFields'));
      return;
    }

    if (formData.password.length < 6) {
      toast.error(t('cashierManagement.passwordTooShort'));
      return;
    }

    // Basic email validation (only if email is provided)
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error('Please enter a valid email address');
        return;
      }
    }

    // Basic phone validation (only if phone is provided)
    if (formData.phone.trim()) {
      const phoneRegex = /^[\d\s\-\+\(\)]{8,}$/;
      if (!phoneRegex.test(formData.phone)) {
        toast.error('Please enter a valid phone number');
        return;
      }
    }

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:8000/api/cashiers', {
        name: formData.name.trim(),
        password: formData.password,
        phone: formData.phone.trim() || null,
        email: formData.email.trim() || null
      });

      // Add the new cashier to the list
      setCashiers(prev => [...prev, response.data]);
      
      // Reset form
      setFormData({
        name: "",
        password: "",
        phone: "",
        email: ""
      });
      setShowRegisterForm(false);
      setShowPassword(false);
      
      toast.success(t('cashierManagement.cashierRegistered'));
    } catch (error: any) {
      console.error('Error registering cashier:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to register cashier');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCashier = async (id: number) => {
    try {
      setLoading(true);
      await axios.delete(`http://localhost:8000/api/cashiers/${id}`);
      
      // Remove from local state
      setCashiers(prev => prev.filter(c => c.id !== id));
      toast.success(t('cashierManagement.cashierRemoved'));
    } catch (error) {
      console.error('Error removing cashier:', error);
      toast.error('Failed to remove cashier');
    } finally {
      setLoading(false);
    }
  };

  const toggleCashierStatus = async (id: number) => {
    try {
      setLoading(true);
      const cashier = cashiers.find(c => c.id === id);
      const newStatus = cashier?.status === 'active' ? 'inactive' : 'active';
      
      await axios.patch(`http://localhost:8000/api/cashiers/${id}`, { status: newStatus });
      
      // Update local state
      setCashiers(prev => prev.map(cashier => 
        cashier.id === id 
          ? { ...cashier, status: newStatus }
          : cashier
      ));
    } catch (error) {
      console.error('Error updating cashier status:', error);
      toast.error('Failed to update cashier status');
    } finally {
      setLoading(false);
    }
  };

  const toggleShowInfo = (id: number) => {
    setShowInfo(showInfo === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            {t('cashierManagement.title')}
          </h2>
          <p className="text-muted-foreground">{t('cashierManagement.subtitle')}</p>
        </div>
        <Button 
          onClick={() => setShowRegisterForm(!showRegisterForm)}
          className="flex items-center gap-2"
          disabled={loading}
        >
          <UserPlus className="h-4 w-4" />
          {t('cashierManagement.addCashier')}
        </Button>
      </div>

      {showRegisterForm && (
        <Card>
          <CardHeader>
            <CardTitle>{t('cashierManagement.registerNewCashier')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">{t('cashierManagement.fullName')}</label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder={t('cashierManagement.fullNamePlaceholder')}
                  disabled={loading}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">{t('cashierManagement.password')}</label>
                <div className="relative">
                  <Input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder={t('cashierManagement.passwordPlaceholder')}
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Numéro de téléphone <span className="text-muted-foreground">(optionnel)</span></label>
                <Input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Ex: +213 555 123 456"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Email <span className="text-muted-foreground">(optionnel)</span></label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="exemple@email.com"
                  disabled={loading}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleRegister} className="flex items-center gap-2" disabled={loading}>
                <Plus className="h-4 w-4" />
                {loading ? 'Registering...' : t('cashierManagement.register')}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowRegisterForm(false);
                  setFormData({
                    name: "",
                    password: "",
                    phone: "",
                    email: ""
                  });
                }}
                disabled={loading}
              >
                {t('cashierManagement.cancel')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

             <Card>
         <CardHeader>
                       <CardTitle>{t('cashierManagement.registeredCashiers')}</CardTitle>
                        {loggedInCashiers.length > 0 && (
               <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2 text-green-800">
                     <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                     <span className="font-medium">Caissiers actuellement connectés:</span>
                     <span className="font-semibold">{loggedInCashiers.map(c => c.name).join(', ')}</span>
                   </div>
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={() => {
                       checkLoggedInCashiers();
                       fetchCashiers();
                     }}
                     className="text-green-700 border-green-300 hover:bg-green-100"
                   >
                     🔄 Actualiser
                   </Button>
                 </div>
               </div>
                         )}
             {loggedInCashiers.length === 0 && (
               <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2 text-gray-600">
                     <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                     <span className="font-medium">Aucun caissier connecté</span>
                   </div>
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={() => {
                       checkLoggedInCashiers();
                       fetchCashiers();
                     }}
                     className="text-gray-700 border-gray-300 hover:bg-gray-100"
                   >
                     🔄 Actualiser
                   </Button>
                 </div>
               </div>
             )}
                        <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Connectés: {loggedInCashiers.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span>Non Connectés: {cashiers.length - loggedInCashiers.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Total: {cashiers.length}</span>
              </div>
            </div>
          <div className="flex gap-2 mt-4">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('all')}
            >
              Tous
            </Button>
                         <Button
               variant={statusFilter === 'active' ? 'default' : 'outline'}
               size="sm"
               onClick={() => setStatusFilter('active')}
               className="bg-green-500 hover:bg-green-600"
             >
               Connectés
             </Button>
             <Button
               variant={statusFilter === 'inactive' ? 'default' : 'outline'}
               size="sm"
               onClick={() => setStatusFilter('inactive')}
               className="bg-gray-500 hover:bg-gray-600"
             >
               Non Connectés
             </Button>
          </div>
        </CardHeader>
        <CardContent>
          {(() => {
            if (loading && cashiers.length === 0) {
              return (
                <div className="text-center py-8 text-muted-foreground">
                  Loading cashiers from database...
                </div>
              );
            }
            
                                                   const filteredCashiers = cashiers.filter(cashier => {
                if (statusFilter === 'all') return true;
                const isLoggedIn = loggedInCashiers.some(activeCashier => activeCashier.id === cashier.id);
                if (statusFilter === 'active') return isLoggedIn;
                if (statusFilter === 'inactive') return !isLoggedIn;
                return true;
              });
            
            if (filteredCashiers.length === 0) {
                             return (
                 <div className="text-center py-8 text-muted-foreground">
                   {statusFilter === 'all' 
                     ? t('cashierManagement.noCashiers')
                     : `Aucun caissier ${statusFilter === 'active' ? 'connecté' : 'non connecté'} trouvé`
                   }
                 </div>
               );
            }
            
            return (
              <div className="space-y-4">
                {filteredCashiers.map((cashier) => (
                  <div key={cashier.id} className="border rounded-lg">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                          <span className="text-primary-foreground font-semibold">
                            {cashier.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{cashier.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {t('cashierManagement.registeredOn')}: {cashier.createdAt}
                          </div>
                        </div>
                      </div>
                                                                                           <div className="flex items-center gap-2">
                          <Badge 
                            variant={loggedInCashiers.some(activeCashier => activeCashier.id === cashier.id) ? 'default' : 'secondary'}
                            className={loggedInCashiers.some(activeCashier => activeCashier.id === cashier.id) ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}
                          >
                            {loggedInCashiers.some(activeCashier => activeCashier.id === cashier.id) ? '🟢 Actif' : '🔴 Inactif'}
                          </Badge>
                        </div>
                    </div>
                    
                    {/* Desktop buttons - hidden on mobile */}
                    <div className="hidden md:flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleShowInfo(cashier.id)}
                        disabled={loading}
                      >
                        <Info className="h-4 w-4 mr-1" />
                        {showInfo === cashier.id ? 'Hide Info' : 'Show Info'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleCashierStatus(cashier.id)}
                        disabled={loading}
                      >
                        {cashier.status === 'active' ? t('cashierManagement.deactivate') : t('cashierManagement.activate')}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveCashier(cashier.id)}
                        className="flex items-center gap-1"
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                        {t('cashierManagement.remove')}
                      </Button>
                    </div>

                    {/* Mobile dropdown - shown only on mobile */}
                    <div className="md:hidden">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            disabled={loading}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() => toggleShowInfo(cashier.id)}
                            className="cursor-pointer"
                          >
                            <Info className="h-4 w-4 mr-2" />
                            {showInfo === cashier.id ? 'Hide Info' : 'Show Info'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => toggleCashierStatus(cashier.id)}
                            className="cursor-pointer"
                          >
                            {cashier.status === 'active' ? (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                {t('cashierManagement.deactivate')}
                              </>
                            ) : (
                              <>
                                <EyeOff className="h-4 w-4 mr-2" />
                                {t('cashierManagement.activate')}
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleRemoveCashier(cashier.id)}
                            className="cursor-pointer text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t('cashierManagement.remove')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  
                  {showInfo === cashier.id && (
                    <div className="border-t bg-muted/50 p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Name:</label>
                          <div className="text-sm font-medium">{cashier.name}</div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Password:</label>
                          <div className="text-sm font-mono bg-background p-2 rounded border">
                            {cashier.password}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Téléphone:</label>
                          <div className="text-sm font-medium">{cashier.phone || 'Non renseigné'}</div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Email:</label>
                          <div className="text-sm font-medium">{cashier.email || 'Non renseigné'}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )})()}
        </CardContent>
      </Card>
    </div>
  );
}
