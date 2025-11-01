import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'fr' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  fr: {
    // Navigation
    'nav.dashboard': 'Tableau de bord',
    'nav.menu': 'Gestion des menus',
    'nav.tables': 'Suivi des tables',
    'nav.cashierManagement': 'Gestion des Caissiers',
    
    // Dashboard
    'dashboard.title': 'Tableau de Bord',
    'dashboard.subtitle': 'Vue d\'ensemble de votre restaurant en temps réel',
    
    // Menu Management
    'menu.title': 'Gestion des Menus',
    'menu.subtitle': 'Gérez vos plats et leur disponibilité',
    'menu.newDish': 'Nouveau Plat',
    'menu.search': 'Rechercher un plat...',
    'menu.all': 'Tous',
    'menu.available': 'Disponible',
    'menu.unavailable': 'Indisponible',
    'menu.edit': 'Modifier',
    'menu.activate': 'Activer',
    'menu.remove': 'Retirer',
    'menu.delete': 'Supprimer',
    'menu.noResults': 'Aucun plat trouvé',
    'menu.noResultsText': 'Essayez de modifier vos critères de recherche ou ajoutez un nouveau plat.',
    'menu.removedFromMenu': 'Plat retiré du menu',
    'menu.addedToMenu': 'Plat ajouté au menu',
    'menu.dishDeleted': 'Plat supprimé',
    'menu.dishDeletedText': 'a été retiré définitivement du menu',
    'menu.isNowAvailable': 'est maintenant disponible',
    'menu.isNowUnavailable': 'est maintenant indisponible',
    
    // Categories
    'category.starters': 'Entrées',
    'category.mains': 'Plats principaux', 
    'category.desserts': 'Desserts',
    'category.drinks': 'Boissons',
    
    // Tables
    'tables.title': 'Suivi des Tables',
    'tables.subtitle': 'État en temps réel de vos tables',
    'tables.free': 'Libre',
    'tables.reserved': 'Réservée',
    'tables.ordering': 'En commande',
    'tables.occupied': 'Occupée',
    
    // Cashiers
    'cashiers.title': 'Statistiques des Caissiers',
    'cashiers.subtitle': 'Performance et activité des caissiers',
    'cashiers.online': 'En ligne',
    'cashiers.offline': 'Hors ligne',
    'cashiers.break': 'Pause',
    'cashiers.totalSales': 'Ventes Totales',
    'cashiers.dailySales': 'Ventes Aujourd\'hui',
    'cashiers.monthlySales': 'Ventes Ce Mois',
    'cashiers.transactions': 'Transactions',
    'cashiers.rating': 'Évaluation',
    'cashiers.shift': 'Quart de travail',
    'cashiers.activeCashier': 'Caissier Actif',
    'cashiers.active': 'Actif',
    'cashiers.loggedInAt': 'Connecté à',
    'cashiers.activeSession': 'Session active en cours',
    'cashiers.loggedInAs': 'Connecté en tant que',
    'cashiers.logout': 'Déconnexion',
    'cashiers.currentlyLoggedIn': 'Caissier actuellement connecté:',
    'cashiers.connected': 'Connecté',
    
    // Cashier Management
    'cashierManagement.title': 'Gestion des Caissiers',
    'cashierManagement.subtitle': 'Enregistrer et gérer les comptes caissiers',
    'cashierManagement.addCashier': 'Ajouter un Caissier',
    'cashierManagement.registerNewCashier': 'Enregistrer un Nouveau Caissier',
    'cashierManagement.fullName': 'Nom Complet',
    'cashierManagement.fullNamePlaceholder': 'Entrez le nom complet',
    'cashierManagement.password': 'Mot de passe',
    'cashierManagement.passwordPlaceholder': 'Entrez le mot de passe',
    'cashierManagement.register': 'Enregistrer',
    'cashierManagement.cancel': 'Annuler',
    'cashierManagement.registeredCashiers': 'Caissiers Enregistrés',
    'cashierManagement.noCashiers': 'Aucun caissier enregistré',
    'cashierManagement.active': 'Actif',
    'cashierManagement.inactive': 'Inactif',
    'cashierManagement.registeredOn': 'Enregistré le',
    'cashierManagement.activate': 'Activer',
    'cashierManagement.deactivate': 'Désactiver',
    'cashierManagement.remove': 'Supprimer',
    'cashierManagement.fillAllFields': 'Veuillez remplir tous les champs',
    'cashierManagement.passwordTooShort': 'Le mot de passe doit contenir au moins 6 caractères',
    'cashierManagement.cashierRegistered': 'Caissier enregistré avec succès',
    'cashierManagement.cashierRemoved': 'Caissier supprimé avec succès',
    
    // Common
    'common.developmentSection': 'Section en cours de développement',
    'common.availableSoon': 'Cette fonctionnalité sera bientôt disponible.',
    'common.currency': 'DA',
    'common.currencyName': 'Dinar Algérien',
  },
  ar: {
    // Navigation
    'nav.dashboard': 'لوحة التحكم',
    'nav.menu': 'إدارة القوائم',
    'nav.tables': 'متابعة الطاولات',
    'nav.cashierManagement': 'إدارة الصرافين',
    
    // Dashboard
    'dashboard.title': 'لوحة التحكم',
    'dashboard.subtitle': 'نظرة عامة على مطعمك في الوقت الفعلي',
    
    // Menu Management
    'menu.title': 'إدارة القوائم',
    'menu.subtitle': 'أدر أطباقك وتوفرها',
    'menu.newDish': 'طبق جديد',
    'menu.search': 'البحث عن طبق...',
    'menu.all': 'الكل',
    'menu.available': 'متوفر',
    'menu.unavailable': 'غير متوفر',
    'menu.edit': 'تعديل',
    'menu.activate': 'تفعيل',
    'menu.remove': 'إزالة',
    'menu.delete': 'حذف',
    'menu.noResults': 'لا توجد أطباق',
    'menu.noResultsText': 'حاول تعديل معايير البحث أو أضف طبقاً جديداً.',
    'menu.removedFromMenu': 'تم إزالة الطبق من القائمة',
    'menu.addedToMenu': 'تم إضافة الطبق للقائمة',
    'menu.dishDeleted': 'تم حذف الطبق',
    'menu.dishDeletedText': 'تم حذفه نهائياً من القائمة',
    'menu.isNowAvailable': 'متوفر الآن',
    'menu.isNowUnavailable': 'غير متوفر الآن',
    
    // Categories
    'category.starters': 'المقبلات',
    'category.mains': 'الأطباق الرئيسية',
    'category.desserts': 'الحلويات', 
    'category.drinks': 'المشروبات',
    
    // Tables
    'tables.title': 'متابعة الطاولات',
    'tables.subtitle': 'حالة طاولاتك في الوقت الفعلي',
    'tables.free': 'حرة',
    'tables.reserved': 'محجوزة',
    'tables.ordering': 'قيد الطلب',
    'tables.occupied': 'مشغولة',
    
    // Cashiers
    'cashiers.title': 'إحصائيات الصرافين',
    'cashiers.subtitle': 'أداء ونشاط الصرافين',
    'cashiers.online': 'متصل',
    'cashiers.offline': 'غير متصل',
    'cashiers.break': 'استراحة',
    'cashiers.totalSales': 'إجمالي المبيعات',
    'cashiers.dailySales': 'مبيعات اليوم',
    'cashiers.monthlySales': 'مبيعات الشهر',
    'cashiers.transactions': 'المعاملات',
    'cashiers.rating': 'التقييم',
    'cashiers.shift': 'وردية العمل',
    'cashiers.activeCashier': 'كاشير نشط',
    'cashiers.active': 'نشط',
    'cashiers.loggedInAt': 'تم تسجيل الدخول في',
    'cashiers.activeSession': 'جلسة نشطة قيد التشغيل',
    'cashiers.loggedInAs': 'متصل باسم',
    'cashiers.logout': 'تسجيل الخروج',
    'cashiers.currentlyLoggedIn': 'الكاشير المتصل حالياً:',
    'cashiers.connected': 'متصل',
    
    // Cashier Management
    'cashierManagement.title': 'إدارة الكاشيرين',
    'cashierManagement.subtitle': 'تسجيل وإدارة حسابات الكاشيرين',
    'cashierManagement.addCashier': 'إضافة كاشير',
    'cashierManagement.registerNewCashier': 'تسجيل كاشير جديد',
    'cashierManagement.fullName': 'الاسم الكامل',
    'cashierManagement.fullNamePlaceholder': 'أدخل الاسم الكامل',
    'cashierManagement.password': 'كلمة المرور',
    'cashierManagement.passwordPlaceholder': 'أدخل كلمة المرور',
    'cashierManagement.register': 'تسجيل',
    'cashierManagement.cancel': 'إلغاء',
    'cashierManagement.registeredCashiers': 'الكاشيرين المسجلين',
    'cashierManagement.noCashiers': 'لا يوجد كاشير مسجل',
    'cashierManagement.active': 'نشط',
    'cashierManagement.inactive': 'غير نشط',
    'cashierManagement.registeredOn': 'تم التسجيل في',
    'cashierManagement.activate': 'تفعيل',
    'cashierManagement.deactivate': 'تعطيل',
    'cashierManagement.remove': 'حذف',
    'cashierManagement.fillAllFields': 'يرجى ملء جميع الحقول',
    'cashierManagement.passwordTooShort': 'يجب أن يحتوي كلمة المرور على أقل من 6 أحرف',
    'cashierManagement.cashierRegistered': 'تم تسجيل الكاشير بنجاح',
    'cashierManagement.cashierRemoved': 'تم حذف الكاشير بنجاح',
    
    // Common
    'common.developmentSection': 'قسم قيد التطوير',
    'common.availableSoon': 'ستكون هذه الميزة متاحة قريباً.',
    'common.currency': 'دج',
    'common.currencyName': 'دينار جزائري',
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('fr');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <div dir={language === 'ar' ? 'rtl' : 'ltr'} className={language === 'ar' ? 'font-arabic' : ''}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}