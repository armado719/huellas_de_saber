import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock login - En producción conectar con API real
    const mockUsers: { email: string; password: string; user: User }[] = [
      {
        email: 'admin@huellasdelsaber.edu.co',
        password: 'admin123',
        user: {
          id: '1',
          nombre: 'Administrador Principal',
          email: 'admin@huellasdelsaber.edu.co',
          rol: 'admin',
        },
      },
      {
        email: 'profesor@huellasdelsaber.edu.co',
        password: 'profesor123',
        user: {
          id: '2',
          nombre: 'María García',
          email: 'profesor@huellasdelsaber.edu.co',
          rol: 'profesor',
        },
      },
    ];

    const found = mockUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (found) {
      setUser(found.user);
      localStorage.setItem('user', JSON.stringify(found.user));
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
