import React, { useState, useEffect } from 'react';
import { User, changePassword } from '../services/authServices';

// URL-ul initial al avatarului - ADJUTAT 'export'
export const INITIAL_AVATAR_URL = 'https://via.placeholder.com/150/007AFF/FFFFFF?text=U'; 

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'details' | 'activity' | 'edit' | 'password'>('details');
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(INITIAL_AVATAR_URL);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  
  // State pentru schimbarea parolei
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Citeste datele utilizatorului din localStorage cand componenta se incarca
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData) as User;
        setUser(parsedUser);
        // Genereaza avatar placeholder bazat pe initiale
        const initials = parsedUser.name
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase();
        
        // CORECTIA SINTAXEI: Folosim backticks (`)
        const avatarUrl = `https://via.placeholder.com/150/007AFF/FFFFFF?text=${initials}`;
        
        setCurrentAvatarUrl(avatarUrl);
      } catch (error) {
        console.error('Eroare la citirea datelor utilizatorului:', error);
      }
    }
  }, []);

  // Functie pentru gestionarea schimbarii pozei de profil
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setUploadError(null);
    
    if (file) {
      if (file.size > 2000000) { 
          setUploadError('Fisierul este prea mare (Max 2MB).');
          return;
      }

      const newLocalUrl = URL.createObjectURL(file);
      setCurrentAvatarUrl(newLocalUrl);
      
      uploadAvatarToServer(file);
    }
  };
  
  // Functie async pentru a simula trimiterea fisierului catre server
  const uploadAvatarToServer = async (file: File) => {
      setIsUploading(true);
      try {
          // Simulare de asteptare si succes
          await new Promise(resolve => setTimeout(resolve, 1500)); 
          
          alert('Poza de profil a fost incarcata cu succes in baza de date (Simulare)!');
      } catch (error) {
          setUploadError('Eroare de retea. Nu s-a putut contacta serverul.');
      } finally {
          setIsUploading(false);
      }
  };

  // Functie pentru gestionarea schimbarii parolei
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    setIsChangingPassword(true);

    try {
      if (!user) {
        setPasswordError('Nu exista utilizator autentificat.');
        return;
      }

      const result = await changePassword(
        user.username,
        oldPassword,
        newPassword,
        confirmPassword
      );

      if (result.success) {
        setPasswordSuccess(result.message || 'Parola a fost schimbata cu succes!');
        // Curata formularul
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(result.message || 'A aparut o eroare la schimbarea parolei.');
      }
    } catch (error) {
      setPasswordError('A aparut o eroare neasteptata.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Daca nu exista date despre utilizator, afiseaza un mesaj
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="bg-white rounded-xl shadow-2xl p-8 text-center">
          <p className="text-gray-600">Nu exista date despre utilizator. Te rugam sa te loghezi.</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'details':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Detalii Personale (Vizualizare)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailCard title="Email" value={user.email} />
              <DetailCard title="Departament" value={user.department} />
              <DetailCard title="Locatie" value={user.location} />
              <DetailCard title="Pozitie" value={user.jobTitle} />
            </div>
          </div>
        );
      case 'activity':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Jurnal de Activitate Recenta</h2>
            <ActivityItem description="A schimbat parola." timestamp="Acum 2 zile" />
            <ActivityItem description="A actualizat detaliile de contact." timestamp="2025-10-30" />
          </div>
        );
      case 'edit':
        return (
          <div className="space-y-6 max-w-lg">
            <h2 className="text-xl font-semibold text-gray-800">Schimbare Poza de Profil</h2>
            <div className="flex flex-col items-center p-6 bg-white border border-gray-200 rounded-lg shadow-md">
                
                {/* Avatarul curent */}
                <img 
                    className="w-32 h-32 rounded-full border-4 border-indigo-500 object-cover mb-4" 
                    src={currentAvatarUrl} 
                    alt="Avatar curent" 
                />
                
                <p className="text-gray-600 mb-4">
                    {isUploading ? 'Se incarca...' : 'Incarca o poza noua (PNG, JPG).'}
                </p>
                
                {uploadError && <p className="text-red-500 text-sm mb-2">{uploadError}</p>}
                
                {/* Input de tip fisier ascuns, asociat cu label-ul */}
                <input 
                    type="file" 
                    id="avatar-upload"
                    accept="image/png, image/jpeg"
                    onChange={handleAvatarChange}
                    className="hidden" 
                    disabled={isUploading}
                />
                
                <label 
                    htmlFor="avatar-upload"
                    className={`cursor-pointer px-4 py-2 text-white font-medium rounded-lg transition-colors shadow-lg ${
                        isUploading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                >
                    {isUploading ? 'Procesare...' : 'Alege o imagine noua'}
                </label>

                <p className="text-sm text-gray-400 mt-4">
                    Poza va fi salvata in baza de date MySQL (prin backend) dupa incarcare.
                </p>
            </div>
          </div>
        );
      case 'password':
        return (
          <div className="space-y-6 max-w-lg">
            <h2 className="text-xl font-semibold text-gray-800">Schimbare Parola</h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {/* Parola veche */}
              <div>
                <label
                  htmlFor="old-password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Parola Curenta
                </label>
                <input
                  id="old-password"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Introduceti parola curenta"
                  disabled={isChangingPassword}
                  autoComplete="current-password"
                />
              </div>

              {/* Parola noua */}
              <div>
                <label
                  htmlFor="new-password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Parola Noua
                </label>
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Introduceti parola noua (min. 6 caractere)"
                  disabled={isChangingPassword}
                  autoComplete="new-password"
                />
              </div>

              {/* Confirmare parola noua */}
              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Confirmare Parola Noua
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Confirmati parola noua"
                  disabled={isChangingPassword}
                  autoComplete="new-password"
                />
              </div>

              {/* Mesaje de eroare si succes */}
              {passwordError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-md p-3">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-600 text-sm rounded-md p-3">
                  {passwordSuccess}
                </div>
              )}

              {/* Buton de submit */}
              <button
                type="submit"
                disabled={isChangingPassword}
                className={`w-full px-4 py-2 text-white font-medium rounded-lg transition-colors shadow-lg ${
                  isChangingPassword
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isChangingPassword ? 'Se schimba parola...' : 'Schimba Parola'}
              </button>

              <p className="text-sm text-gray-500 mt-4">
                Parola noua trebuie sa aiba minim 6 caractere si sa fie diferita de parola curenta.
              </p>
            </form>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
        
        {/* Header de Profil (Vizual Frumos) */}
        <div className="p-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <div className="flex flex-col md:flex-row items-center space-x-6">
            <img 
              className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-lg" 
              src={currentAvatarUrl} 
              alt="Avatar" 
            />
            <div>
              <h1 className="text-3xl font-extrabold">{user.name}</h1>
              <p className="text-blue-200 text-lg mt-1">{user.jobTitle}</p>
            </div>
          </div>
        </div>

        {/* Meniul de Tab-uri */}
        <div className="bg-white border-b border-gray-200">
          <div className="flex justify-start space-x-4 px-8">
            <TabButton label="Detalii Profil" tab="details" activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabButton label="Activitate" tab="activity" activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabButton label="Editeaza Avatar" tab="edit" activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabButton label="Schimbare Parola" tab="password" activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
        </div>

        {/* Continutul Sectiunilor */}
        <div className="p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

// Componenta Auxiliara pentru Cardul de Detaliu
const DetailCard: React.FC<{ title: string; value: string }> = ({ title, value }) => (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h4 className="text-xs font-medium text-gray-500 uppercase">{title}</h4>
        <p className="text-gray-800 font-medium mt-1">{value}</p>
    </div>
);

// Componenta Auxiliara pentru Elementul de Activitate
const ActivityItem: React.FC<{ description: string; timestamp: string }> = ({ description, timestamp }) => (
    <div className="flex justify-between items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
        <p className="text-gray-700">{description}</p>
        <span className="text-sm text-gray-500">{timestamp}</span>
    </div>
);

// Componenta Auxiliara pentru Butonul de Tab
const TabButton: React.FC<{ label: string; tab: string; activeTab: string; setActiveTab: (tab: any) => void }> = ({ label, tab, activeTab, setActiveTab }) => (
    <button
        onClick={() => setActiveTab(tab)}
        className={`py-3 px-1 transition-colors duration-200 ${
            activeTab === tab
                ? 'border-b-3 border-indigo-600 text-indigo-600 font-semibold border-b-2'
                : 'text-gray-500 hover:text-indigo-600'
        }`}
    >
        {label}
    </button>
);

export default Profile;