import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthData {
  token: string | null;
  userData: UserData | null; // Você já tem essa interface em app/index.tsx
  isLoading: boolean;
}

interface UserData {
  id: string;
  username: string;
  email: string;
  crefito_id: string;
  // ... outros campos que sua API retorna sobre o usuário
}

interface AuthContextData extends AuthData {
  signIn: (token: string, user: UserData) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authData, setAuthData] = useState<AuthData>({ 
    token: null, 
    userData: null,
    isLoading: true 
  });

  useEffect(() => {
    // Carregar token e dados do usuário do AsyncStorage ao iniciar o app
    const loadStorageData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('@Auth:token');
        const storedUserData = await AsyncStorage.getItem('@Auth:userData');

        if (storedToken && storedUserData) {
          setAuthData({ token: storedToken, userData: JSON.parse(storedUserData), isLoading: false });
        } else {
          setAuthData(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error("Erro ao carregar dados do AsyncStorage", error);
        setAuthData(prev => ({ ...prev, isLoading: false }));
      }
    };
    loadStorageData();
  }, []);

  const signIn = async (token: string, user: UserData) => {
    try {
      await AsyncStorage.setItem('@Auth:token', token);
      await AsyncStorage.setItem('@Auth:userData', JSON.stringify(user));
      setAuthData({ token, userData: user, isLoading: false });
    } catch (error) {
      console.error("Erro ao salvar dados no AsyncStorage", error);
      // Tratar erro de gravação, se necessário
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('@Auth:token');
      await AsyncStorage.removeItem('@Auth:userData');
      setAuthData({ token: null, userData: null, isLoading: false });
    } catch (error) {
      console.error("Erro ao remover dados do AsyncStorage", error);
      // Tratar erro de remoção, se necessário
    }
  };

  return (
    <AuthContext.Provider value={{ ...authData, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};