// src/App.tsx

import React, { useState } from 'react';
import Login from './components/Login';
import Header from './components/Header';
import MainFeed from './components/MainFeed';
import SettingsDrawer from './components/SettingsDrawer';
// NOU: Importăm componenta Profile pentru vizualizarea îmbunătățită
import Profile from './components/Profile'; 

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'feed' | 'profile' | 'settings' | 'about'>('feed');

  const handleLogin = () => {
    // Aici ar trebui să se întâmple logică mai complexă de salvare a token-ului, nu doar setarea la true
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    // Logica de deconectare, inclusiv ștergerea token-ului din localStorage
    setIsAuthenticated(false);
    setDrawerOpen(false);
    setCurrentView('feed');
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleMenuItemClick = (view: 'feed' | 'profile' | 'settings' | 'about') => {
    setCurrentView(view);
    setDrawerOpen(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onProfileClick={handleDrawerToggle} />
      <main className="pt-16">
        {currentView === 'feed' && <MainFeed />}
        
        {/* SECȚIUNEA MODIFICATĂ: Folosim acum componenta externă Profile */}
        {currentView === 'profile' && <Profile />}
        
        {currentView === 'settings' && (
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Settings</h1>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600">Application settings will be displayed here.</p>
              <button
                onClick={handleLogout}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        )}
        {currentView === 'about' && (
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">About</h1>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Estelar</h2>
              <p className="text-gray-600 mb-4">
                A secure, internal business communication platform combining work, achievement, and connection.
              </p>
              <p className="text-sm text-gray-500">Version 1.0.0</p>
            </div>
          </div>
        )}
      </main>
      <SettingsDrawer
        isOpen={drawerOpen}
        onClose={handleDrawerToggle}
        onMenuItemClick={handleMenuItemClick}
      />
    </div>
  );
}

export default App;