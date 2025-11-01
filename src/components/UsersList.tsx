import React, { useState, useEffect } from 'react';
import { User } from '../services/authServices';
import usersData from '../data/users.json';

interface UsersListProps {
  onUserSelect: (user: User) => void;
}

const UsersList: React.FC<UsersListProps> = ({ onUserSelect }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Incarca utilizatorul curent din localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData) as User;
        setCurrentUser(parsedUser);
      } catch (error) {
        console.error('Eroare la citirea utilizatorului curent:', error);
      }
    }

    // Incarca toti utilizatorii din users.json
    const allUsers = (usersData.users as User[]).map(user => ({
      ...user,
      manager: user.manager || '',
      description: user.description || ''
    }));
    setUsers(allUsers);
  }, []);

  // Filtreaza utilizatorii dupa termenul de cautare
  const filteredUsers = users.filter(user => {
    if (!currentUser) return true;
    // Exclude utilizatorul curent din lista
    if (user.username === currentUser.username) return false;
    
    // Filtrare dupa nume, email, departament sau jobTitle
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      (user.department && user.department.toLowerCase().includes(searchLower)) ||
      (user.jobTitle && user.jobTitle.toLowerCase().includes(searchLower))
    );
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <h1 className="text-3xl font-extrabold">Prieteni</h1>
          <p className="text-blue-200 mt-2">Vizualizează și accesează profilurile colegilor tăi</p>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Caută după nume, email, departament sau poziție..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Users List */}
        <div className="p-6">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {searchTerm ? 'Nu s-au găsit utilizatori care să corespundă căutării.' : 'Nu există alți utilizatori pe platformă.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.username}
                  onClick={() => onUserSelect(user)}
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-indigo-400 hover:shadow-lg transition-all cursor-pointer"
                >
                  <div className="flex items-center space-x-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 bg-indigo-200 rounded-full flex items-center justify-center text-indigo-700 font-bold text-lg">
                        {getInitials(user.name)}
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {user.name}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">
                        {user.jobTitle || 'N/A'}
                      </p>
                      {user.department && (
                        <p className="text-xs text-gray-500 mt-1">
                          {user.department}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 truncate mt-1">
                        {user.email}
                      </p>
                    </div>

                    {/* Arrow Icon */}
                    <div className="flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsersList;

