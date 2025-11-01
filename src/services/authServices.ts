// Serviciu de autentificare pentru validarea datelor de logare
import usersData from '../data/users.json';

export interface User {
  username: string;
  passwordHash: string;
  name: string;
  email: string;
  jobTitle: string;
  department: string;
  location: string;
  manager?: string;
  description?: string;
}

// Interfață pentru stocarea parolelor actualizate
interface UpdatedPasswords {
  [username: string]: string; // username -> passwordHash actualizat
}

/**
 * Obține dicționarul cu parolele actualizate din localStorage
 */
function getUpdatedPasswords(): UpdatedPasswords {
  try {
    const stored = localStorage.getItem('updatedPasswords');
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Eroare la citirea parolelor actualizate:', error);
    return {};
  }
}

/**
 * Salvează dicționarul cu parolele actualizate în localStorage
 */
function saveUpdatedPasswords(passwords: UpdatedPasswords): void {
  try {
    localStorage.setItem('updatedPasswords', JSON.stringify(passwords));
  } catch (error) {
    console.error('Eroare la salvarea parolelor actualizate:', error);
  }
}

/**
 * Obține hash-ul parolei pentru un utilizator (verifică întâi în localStorage, apoi în users.json)
 */
async function getUserPasswordHash(username: string): Promise<string | null> {
  // Verifică întâi în localStorage pentru parole actualizate
  const updatedPasswords = getUpdatedPasswords();
  const lowerUsername = username.toLowerCase();
  
  if (updatedPasswords[lowerUsername]) {
    return updatedPasswords[lowerUsername];
  }

  // Dacă nu există în localStorage, folosește hash-ul din users.json
  const user = (usersData.users as User[]).find(
    u => u.username.toLowerCase() === lowerUsername
  );
  
  return user ? user.passwordHash : null;
}

interface AuthResult {
  success: boolean;
  user?: User;
  message?: string;
}

/**
 * Hash-uiește o parolă folosind SHA-256
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

interface ChangePasswordResult {
  success: boolean;
  message?: string;
}

/**
 * Schimbă parola utilizatorului
 * @param username - Numele de utilizator
 * @param oldPassword - Parola veche
 * @param newPassword - Parola nouă
 * @param confirmPassword - Confirmarea parolei noi
 * @returns Rezultatul schimbării parolei
 */
export async function changePassword(
  username: string,
  oldPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<ChangePasswordResult> {
  // Validări
  if (!oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
    return {
      success: false,
      message: 'Te rugăm să completezi toate câmpurile.'
    };
  }

  if (newPassword.length < 6) {
    return {
      success: false,
      message: 'Parola nouă trebuie să aibă minim 6 caractere.'
    };
  }

  if (newPassword !== confirmPassword) {
    return {
      success: false,
      message: 'Parolele noi nu se potrivesc.'
    };
  }

  if (oldPassword === newPassword) {
    return {
      success: false,
      message: 'Parola nouă trebuie să fie diferită de parola veche.'
    };
  }

  // Verifică parola veche (verifică întâi în localStorage pentru parole actualizate)
  const oldPasswordHash = await hashPassword(oldPassword);
  const userPasswordHash = await getUserPasswordHash(username);

  if (!userPasswordHash) {
    return {
      success: false,
      message: 'Utilizatorul nu a fost găsit.'
    };
  }

  if (userPasswordHash !== oldPasswordHash) {
    return {
      success: false,
      message: 'Parola veche introdusă este incorectă.'
    };
  }

  // Hash-uiește parola nouă
  const newPasswordHash = await hashPassword(newPassword);

  // Salvează parola nouă persistent în localStorage
  const updatedPasswords = getUpdatedPasswords();
  const lowerUsername = username.toLowerCase();
  updatedPasswords[lowerUsername] = newPasswordHash;
  saveUpdatedPasswords(updatedPasswords);

  // Actualizează și în 'user' pentru a fi sincronizat cu sesiunea curentă
  const userFromStorage = localStorage.getItem('user');
  if (userFromStorage) {
    try {
      const parsedUser = JSON.parse(userFromStorage) as User;
      if (parsedUser.username.toLowerCase() === lowerUsername) {
        parsedUser.passwordHash = newPasswordHash;
        localStorage.setItem('user', JSON.stringify(parsedUser));
      }
    } catch (error) {
      console.error('Eroare la actualizarea parolei în localStorage:', error);
    }
  }

  return {
    success: true,
    message: 'Parola a fost schimbată cu succes!'
  };
}

/**
 * Validează datele de logare
 * @param username - Numele de utilizator introdus
 * @param password - Parola introdusă
 * @returns Rezultatul validării (success: true/false și datele utilizatorului dacă eșuiește)
 */
export async function validateLogin(username: string, password: string): Promise<AuthResult> {
  // Verifică dacă username-ul și parola nu sunt goale
  if (!username.trim() || !password.trim()) {
    return {
      success: false,
      message: 'Te rugăm să introduci username-ul și parola'
    };
  }

  // Găsește utilizatorul în listă (pentru a obține toate datele)
  const user = (usersData.users as User[]).find(
    u => u.username.toLowerCase() === username.trim().toLowerCase()
  );

  if (!user) {
    return {
      success: false,
      message: 'Username/parola introduse gresit.'
    };
  }

  // Verifică parola (verifică întâi în localStorage pentru parole actualizate)
  const passwordHash = await hashPassword(password);
  const storedPasswordHash = await getUserPasswordHash(username);
  
  if (!storedPasswordHash || passwordHash !== storedPasswordHash) {
    return {
      success: false,
      message: 'Username/parola introdus gresit.'
    };
  }

  // Autentificare reușită
  return {
    success: true,
    user: user
  };
}

/**
 * Returnează utilizatorul după username (pentru date de profil)
 */
export function getUserByUsername(username: string): User | undefined {
  return (usersData.users as User[]).find(
    u => u.username.toLowerCase() === username.trim().toLowerCase()
  );
}