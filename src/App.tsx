// src/App.tsx

import React, { useState } from 'react';
import Login from './components/Login';
import Header from './components/Header';
import MainFeed from './components/MainFeed';
import SettingsDrawer from './components/SettingsDrawer';
// NOU: Importăm componenta Profile pentru vizualizarea îmbunătățită
import Profile from './components/Profile';
import UsersList from './components/UsersList';
import { User } from './services/authServices';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'feed' | 'profile' | 'settings' | 'about' | 'users' | 'userProfile'>('feed');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

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

  const handleMenuItemClick = (view: 'feed' | 'profile' | 'settings' | 'about' | 'users') => {
    setCurrentView(view);
    setDrawerOpen(false);
    setSelectedUser(null); // Resetează utilizatorul selectat când schimbi view-ul
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setCurrentView('userProfile');
    setDrawerOpen(false);
  };

  const handleBackToUsers = () => {
    setSelectedUser(null);
    setCurrentView('users');
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
        
        {/* Lista de utilizatori */}
        {currentView === 'users' && (
          <UsersList onUserSelect={handleUserSelect} />
        )}
        
        {/* Profilul unui utilizator selectat */}
        {currentView === 'userProfile' && selectedUser && (
          <div>
            <div className="container mx-auto px-4 py-4 max-w-5xl">
              <button
                onClick={handleBackToUsers}
                className="mb-4 flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Înapoi la lista de prieteni
              </button>
            </div>
            <Profile viewedUser={selectedUser} />
          </div>
        )}
        
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