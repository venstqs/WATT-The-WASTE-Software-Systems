// src/context/AuthContext.tsx
// Authentication & Persona context for LGU Officers and Citizens
import React, { createContext, useContext, useState } from 'react';

export type Persona = 'LGU' | 'CITIZEN';

export interface AuthUser {
  persona: Persona;
  name: string;
  email?: string;
  department: string;
}

interface AuthContextProps {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginAsCitizen: (name: string) => void;
  logout: () => void;
}

// Hardcoded LGU demo accounts — CDRRMO operators only
const LGU_ACCOUNTS: Record<string, { password: string; user: AuthUser }> = {
  'disaster-ops@naga.gov.ph': {
    password: 'estero-volt-99',
    user: {
      persona: 'LGU',
      name: 'Engr. Alejandro Reyes',
      email: 'disaster-ops@naga.gov.ph',
      department: 'CDRRMO Operations Chief',
    },
  },
  'ops@naga.gov.ph': {
    password: 'estero-volt-99',
    user: {
      persona: 'LGU',
      name: 'Engr. Alejandro Reyes',
      email: 'ops@naga.gov.ph',
      department: 'CDRRMO Operations Chief',
    },
  },
};

const AuthContext = createContext<AuthContextProps>({
  user: null,
  isLoading: false,
  error: null,
  login: async () => false,
  loginAsCitizen: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    await new Promise((resolve) => setTimeout(resolve, 1200));

    const account = LGU_ACCOUNTS[email.toLowerCase().trim()];
    if (!account || account.password !== password) {
      setError('Invalid LGU credentials. Check your email and password.');
      setIsLoading(false);
      return false;
    }

    setUser(account.user);
    setIsLoading(false);
    return true;
  };

  const loginAsCitizen = (name: string) => {
    setUser({
      persona: 'CITIZEN',
      name: name.trim() || 'Resident',
      department: 'Naga City Resident',
    });
  };

  const logout = () => {
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, error, login, loginAsCitizen, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
