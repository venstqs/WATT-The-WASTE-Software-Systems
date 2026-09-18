// src/context/AuthContext.tsx
// Authentication & Persona context for CDRRMO / DENR operators
import React, { createContext, useContext, useState } from 'react';

export type Persona = 'CDRRMO' | 'DENR';

export interface AuthUser {
  persona: Persona;
  name: string;
  email: string;
  department: string;
}

interface AuthContextProps {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Hardcoded demo accounts — matches the project proposal stakeholders
const DEMO_ACCOUNTS: Record<string, { password: string; user: AuthUser }> = {
  'disaster-ops@naga.gov.ph': {
    password: 'estero-volt-99',
    user: {
      persona: 'CDRRMO',
      name: 'Engr. Alejandro Reyes',
      email: 'disaster-ops@naga.gov.ph',
      department: 'CDRRMO Operations Chief',
    },
  },
  'ops@naga.gov.ph': {
    password: 'estero-volt-99',
    user: {
      persona: 'CDRRMO',
      name: 'Engr. Alejandro Reyes',
      email: 'ops@naga.gov.ph',
      department: 'CDRRMO Operations Chief',
    },
  },
  'water-quality@emb.gov.ph': {
    password: 'estero-volt-99',
    user: {
      persona: 'DENR',
      name: 'Dr. Maria Santos',
      email: 'water-quality@emb.gov.ph',
      department: 'DENR-EMB Water Quality Division',
    },
  },
  'emb@denr.gov.ph': {
    password: 'estero-volt-99',
    user: {
      persona: 'DENR',
      name: 'Dr. Maria Santos',
      email: 'emb@denr.gov.ph',
      department: 'DENR-EMB Water Quality Division',
    },
  },
};

const AuthContext = createContext<AuthContextProps>({
  user: null,
  isLoading: false,
  error: null,
  login: async () => false,
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

    // Simulate async auth check (like hitting a real API)
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const account = DEMO_ACCOUNTS[email.toLowerCase().trim()];
    if (!account || account.password !== password) {
      setError('Invalid credentials. Check your email and password.');
      setIsLoading(false);
      return false;
    }

    setUser(account.user);
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
