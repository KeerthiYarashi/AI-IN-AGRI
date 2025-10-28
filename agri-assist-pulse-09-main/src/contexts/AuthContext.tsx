import React, { createContext, useContext, useState, useEffect } from 'react';
import { Farmer, AuthState } from '@/types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (farmer: Omit<Farmer, 'id' | 'createdAt' | 'lastLogin'>, password: string) => Promise<boolean>;
  logout: () => void;
  updateFarmer: (updates: Partial<Farmer>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'agri_auth';
const FARMERS_KEY = 'agri_farmers';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    farmer: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Check for existing session on mount
    const restoreSession = () => {
      try {
        const storedAuth = localStorage.getItem(STORAGE_KEY);
        
        if (storedAuth) {
          const { farmerId } = JSON.parse(storedAuth);
          const farmers = JSON.parse(localStorage.getItem(FARMERS_KEY) || '{}');
          const farmer = farmers[farmerId];
          
          if (farmer) {
            // Update last login time
            const updatedFarmer = {
              ...farmer,
              lastLogin: new Date().toISOString()
            };
            
            farmers[farmerId] = updatedFarmer;
            localStorage.setItem(FARMERS_KEY, JSON.stringify(farmers));
            
            // Set authenticated state
            setState({
              isAuthenticated: true,
              farmer: updatedFarmer,
              loading: false,
              error: null,
            });
            
            console.log('✅ Session restored for:', updatedFarmer.email);
            return;
          } else {
            // Farmer not found, clear invalid session
            localStorage.removeItem(STORAGE_KEY);
            console.log('⚠️ Invalid session cleared');
          }
        }
        
        // No session found or invalid session
        setState(prev => ({ ...prev, loading: false }));
      } catch (error) {
        console.error('❌ Failed to restore session:', error);
        localStorage.removeItem(STORAGE_KEY);
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    restoreSession();
  }, []); // Only run once on mount

  const register = async (
    farmerData: Omit<Farmer, 'id' | 'createdAt' | 'lastLogin'>,
    password: string
  ): Promise<boolean> => {
    try {
      const farmers = JSON.parse(localStorage.getItem(FARMERS_KEY) || '{}');
      const passwords = JSON.parse(localStorage.getItem('agri_passwords') || '{}');
      
      // Check if email already exists
      const existingFarmer = Object.values(farmers).find(
        (f: any) => f.email === farmerData.email
      );
      
      if (existingFarmer) {
        setState(prev => ({ ...prev, error: 'Email already registered' }));
        return false;
      }
      
      const farmerId = `farmer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();
      
      const newFarmer: Farmer = {
        ...farmerData,
        id: farmerId,
        createdAt: now,
        lastLogin: now,
      };
      
      farmers[farmerId] = newFarmer;
      passwords[farmerId] = password;
      
      localStorage.setItem(FARMERS_KEY, JSON.stringify(farmers));
      localStorage.setItem('agri_passwords', JSON.stringify(passwords));
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ farmerId }));
      
      // Initialize empty activity history
      const activities = JSON.parse(localStorage.getItem('agri_activities') || '{}');
      activities[farmerId] = {
        farmerId,
        marketForecasts: [],
        pestDetections: [],
        irrigationHistory: [],
        carbonHistory: [],
        yieldEstimates: [],
      };
      localStorage.setItem('agri_activities', JSON.stringify(activities));
      
      setState({
        isAuthenticated: true,
        farmer: newFarmer,
        loading: false,
        error: null,
      });
      
      console.log('✅ Registration successful:', newFarmer.email);
      return true;
    } catch (error) {
      console.error('❌ Registration failed:', error);
      setState(prev => ({ ...prev, error: 'Registration failed' }));
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const farmers = JSON.parse(localStorage.getItem(FARMERS_KEY) || '{}');
      const passwords = JSON.parse(localStorage.getItem('agri_passwords') || '{}');
      
      const farmer = Object.values(farmers).find((f: any) => f.email === email) as Farmer | undefined;
      
      if (!farmer) {
        setState(prev => ({ ...prev, error: 'Farmer not found' }));
        return false;
      }
      
      if (passwords[farmer.id] !== password) {
        setState(prev => ({ ...prev, error: 'Invalid password' }));
        return false;
      }
      
      // Update last login
      const updatedFarmer = {
        ...farmer,
        lastLogin: new Date().toISOString()
      };
      
      farmers[farmer.id] = updatedFarmer;
      localStorage.setItem(FARMERS_KEY, JSON.stringify(farmers));
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ farmerId: farmer.id }));
      
      setState({
        isAuthenticated: true,
        farmer: updatedFarmer,
        loading: false,
        error: null,
      });
      
      console.log('✅ Login successful:', updatedFarmer.email);
      return true;
    } catch (error) {
      console.error('❌ Login failed:', error);
      setState(prev => ({ ...prev, error: 'Login failed' }));
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      isAuthenticated: false,
      farmer: null,
      loading: false,
      error: null,
    });
    console.log('✅ Logout successful');
  };

  const updateFarmer = (updates: Partial<Farmer>) => {
    if (!state.farmer) return;
    
    const farmers = JSON.parse(localStorage.getItem(FARMERS_KEY) || '{}');
    farmers[state.farmer.id] = { ...state.farmer, ...updates };
    localStorage.setItem(FARMERS_KEY, JSON.stringify(farmers));
    
    setState(prev => ({
      ...prev,
      farmer: prev.farmer ? { ...prev.farmer, ...updates } : null,
    }));
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateFarmer }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
