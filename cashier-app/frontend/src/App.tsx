import React from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Login } from './components/Login'
import { Header } from './components/Header'
import { QuickDashboard } from './components/QuickDashboard'
import { TableTracker } from './components/TableTracker'
import './index.css'

function AppContent() {
  const { isAuthenticated, login, loading } = useAuth();
  const [currentView, setCurrentView] = React.useState<'dashboard' | 'tables'>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={login} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      {currentView === 'dashboard' ? <QuickDashboard /> : <TableTracker />}
    </div>
  );
}

function Navigation({ currentView, onViewChange }: { 
  currentView: 'dashboard' | 'tables', 
  onViewChange: (view: 'dashboard' | 'tables') => void 
}) {
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-2">
      <div className="flex space-x-4">
        <button
          onClick={() => onViewChange('dashboard')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            currentView === 'dashboard'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          📊 Tableau de Bord
        </button>
        <button
          onClick={() => onViewChange('tables')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            currentView === 'tables'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          🏪 Suivi des Tables
        </button>
      </div>
    </nav>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
