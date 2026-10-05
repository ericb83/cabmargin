import { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import type { User } from '../types';
import { getSubscriptionStatus } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isPremium: boolean;
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readStoredUser(): User | null {
  const storedUser = localStorage.getItem('user');
  const storedToken = localStorage.getItem('token');
  if (!storedUser || !storedToken) return null;
  try {
    return JSON.parse(storedUser) as User;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const userRef = useRef<User | null>(null);
  const refreshGen = useRef(0);
  userRef.current = user;

  const refreshSubscriptionStatus = useCallback(async (currentUser: User) => {
    const gen = ++refreshGen.current;
    try {
      const status = await getSubscriptionStatus();
      if (gen !== refreshGen.current) return;
      const updatedUser = {
        ...currentUser,
        subscriptionTier: status.tier,
        isPremium: status.isPremium,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser((prev) => {
        if (
          prev &&
          prev.userId === updatedUser.userId &&
          prev.subscriptionTier === updatedUser.subscriptionTier &&
          prev.isPremium === updatedUser.isPremium
        ) {
          return prev;
        }
        return updatedUser;
      });
    } catch {
      // Ignore errors - user might not be authenticated
    }
  }, []);

  useEffect(() => {
    const parsedUser = readStoredUser();
    if (parsedUser) {
      setUser(parsedUser);
      refreshSubscriptionStatus(parsedUser);
    }
  }, [refreshSubscriptionStatus]);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userData.token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const refreshSubscription = useCallback(async () => {
    const current = userRef.current ?? readStoredUser();
    if (current) {
      await refreshSubscriptionStatus(current);
    }
  }, [refreshSubscriptionStatus]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated: !!user,
      isPremium: user?.isPremium ?? false,
      refreshSubscription
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
