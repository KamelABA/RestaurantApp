import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { MenuManagement } from "./pages/MenuManagement";
import { useState, useEffect } from "react";
import { Toaster } from "sonner";

// This is the CASHIER APP - cashiers should stay here, not redirect to admin dashboard
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const savedAuth = localStorage.getItem('isAuthenticated');
    const savedUser = localStorage.getItem('currentUser');
    return savedAuth === 'true' && savedUser ? true : false;
  });
  
  const [currentUser, setCurrentUser] = useState(() => {
    return localStorage.getItem('currentUser') || '';
  });

  // Prevent any redirects to admin dashboard
  useEffect(() => {
    // Clear any admin-related localStorage items that might cause conflicts
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('cashier');
    
    // Ensure we're using cashier-specific keys
    if (localStorage.getItem('isAuthenticated') === 'true') {
      localStorage.setItem('cashierApp', 'true');
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('currentUser', currentUser);
      localStorage.setItem('loginTime', Date.now().toString());
      localStorage.setItem('cashierApp', 'true');
      localStorage.setItem('userRole', 'cashier');
    } else {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('loginTime');
      localStorage.removeItem('cashierApp');
      localStorage.removeItem('userRole');
    }
  }, [isAuthenticated, currentUser]);

  useEffect(() => {
    const checkSession = () => {
      const loginTime = localStorage.getItem('loginTime');
      if (loginTime) {
        const sessionAge = Date.now() - parseInt(loginTime);
        const maxSessionAge = 8 * 60 * 60 * 1000;
        
        if (sessionAge > maxSessionAge) {
          handleLogout();
        }
      }
    };

    checkSession();
    const interval = setInterval(checkSession, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = (user: string) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    // Ensure we're in cashier mode
    localStorage.setItem('cashierApp', 'true');
    localStorage.setItem('userRole', 'cashier');
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('loginTime');
    localStorage.removeItem('cashierApp');
    localStorage.removeItem('userRole');
    setIsAuthenticated(false);
    setCurrentUser("");
    alert("تم تسجيل الخروج بنجاح");
  };

  return (
    <Router>
      <div className="min-h-screen bg-background">
        {!isAuthenticated ? (
          <Login onLogin={handleLogin} />
        ) : (
          <Routes>
            {/* Cashier stays in cashier interface - NO REDIRECTS TO ADMIN DASHBOARD */}
            <Route path="/" element={<Dashboard currentUser={currentUser} onLogout={handleLogout} />} />
            <Route path="/menu-management" element={<MenuManagement currentUser={currentUser} onLogout={handleLogout} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </div>
      <Toaster />
    </Router>
  );
}

export default App;
