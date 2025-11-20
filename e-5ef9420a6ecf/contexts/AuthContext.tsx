
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthState } from '@/types/quiz';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<{ error?: string }>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_STORAGE_KEY = 'mock_auth_user';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // console.log('useAuth called outside of AuthProvider, returning default values');
    return {
      user: null,
      loading: false,
      isAuthenticated: false,
      isAdmin: false,
      signUp: async () => ({ error: 'Auth not initialized' }),
      signIn: async () => ({ error: 'Auth not initialized' }),
      signOut: async () => {},
      updateProfile: async () => ({ error: 'Auth not initialized' }),
      resetPassword: async () => ({ error: 'Auth not initialized' }),
    };
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false,
    isAdmin: false,
  });

  useEffect(() => {
    // console.log('AuthProvider - Initializing mock auth...');
    initializeMockAuth();
  }, []);

  const initializeMockAuth = async () => {
    try {
      await initializeDemoUsers();
      
      const storedUser = await AsyncStorage.getItem(MOCK_STORAGE_KEY);
      if (storedUser) {
        const user = JSON.parse(storedUser);
        // console.log('AuthProvider - Found stored user:', user.name);
        setAuthState({
          user,
          loading: false,
          isAuthenticated: true,
          isAdmin: user.role === 'admin',
        });
      } else {
        // console.log('AuthProvider - No stored user found');
        setAuthState({
          user: null,
          loading: false,
          isAuthenticated: false,
          isAdmin: false,
        });
      }
    } catch (error) {
      // console.log('AuthProvider - Mock auth error:', error);
      setAuthState({
        user: null,
        loading: false,
        isAuthenticated: false,
        isAdmin: false,
      });
    }
  };

  const initializeDemoUsers = async () => {
    try {
      const existingUsersStr = await AsyncStorage.getItem('demo_users');
      if (existingUsersStr) {
        const users: User[] = JSON.parse(existingUsersStr);
        const adminIndex = users.findIndex((u: User) => u.role === 'admin');
        if (adminIndex !== -1) {
          users[adminIndex] = {
            ...users[adminIndex],
            email: 'Admin@mail.com',
            name: 'Admin',
            status: 'active',
            password: 'Admin.1234',
          };
        } else {
          users.push({
            id: '1',
            email: 'Admin@mail.com',
            name: 'Admin',
            role: 'admin',
            createdAt: new Date().toISOString(),
            status: 'active',
            password: 'Admin.1234',
          });
        }
        await AsyncStorage.setItem('demo_users', JSON.stringify(users));
      } else {
        const demoUsers: User[] = [
          {
            id: '1',
            email: 'Admin@mail.com',
            name: 'Admin',
            role: 'admin',
            createdAt: new Date().toISOString(),
            status: 'active',
            password: 'Admin.1234',
          },
          {
            id: '2',
            email: 'user@test.com',
            name: 'Test User',
            role: 'user',
            createdAt: new Date().toISOString(),
            status: 'active',
            password: '123456',
          },
        ];
        await AsyncStorage.setItem('demo_users', JSON.stringify(demoUsers));
        // console.log('AuthProvider - Demo users initialized');
      }
    } catch (error) {
      // console.log('AuthProvider - Error initializing demo users:', error);
    }
  };

  const signUp = async (email: string, password: string, name: string): Promise<{ error?: string }> => {
    try {
      // console.log('AuthProvider - Attempting sign up for:', email);
      
      const existingUsers = await AsyncStorage.getItem('demo_users');
      const users = existingUsers ? JSON.parse(existingUsers) : [];
      
      if (users.find((u: User) => u.email === email)) {
        // console.log('AuthProvider - Email already exists:', email);
        return { error: 'Bu e-posta adresi zaten kullanılıyor' };
      }

      const newUser: User = {
        id: Date.now().toString(),
        email,
        name,
        role: 'user',
        createdAt: new Date().toISOString(),
        status: 'pending',
        password,
      };

      users.push(newUser);
      await AsyncStorage.setItem('demo_users', JSON.stringify(users));
      // Otomatik oturum açma kaldırıldı: yönetici onayı bekleniyor
      // await AsyncStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(newUser));
      
      // Oturum durumunu değiştirmiyoruz; kullanıcı onaylanınca giriş yapacak
      // console.log('AuthProvider - Mock user created successfully:', newUser.name);
      return {};
    } catch (error: any) {
      // console.log('AuthProvider - Sign up error:', error);
      return { error: 'Kayıt sırasında bir hata oluştu' };
    }
  };

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      // console.log('AuthProvider - Attempting sign in for:', email);
      
      const existingUsers = await AsyncStorage.getItem('demo_users');
      const users = existingUsers ? JSON.parse(existingUsers) : [];
      
      const user = users.find((u: User) => u.email === email);
      if (!user) {
        // console.log('AuthProvider - User not found:', email);
        return { error: 'Kullanıcı bulunamadı' };
      }

      if (user.status !== 'active') {
        // console.log('AuthProvider - User not active:', email);
        return { error: 'Hesabınız henüz onaylanmadı' };
      }

      // Basic password check for mock auth
      if (typeof user.password === 'string') {
        if (user.password !== password) {
          return { error: 'Şifre hatalı' };
        }
      }

      await AsyncStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(user));
      
      setAuthState({
        user,
        loading: false,
        isAuthenticated: true,
        isAdmin: user.role === 'admin',
      });

      // console.log('AuthProvider - Mock user signed in successfully:', user.name);
      return {};
    } catch (error: any) {
      // console.log('AuthProvider - Sign in error:', error);
      return { error: 'Giriş sırasında bir hata oluştu' };
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      // console.log('AuthProvider - Starting sign out process...');
      
      // Clear stored user data
      await AsyncStorage.removeItem(MOCK_STORAGE_KEY);
      
      // Update auth state
      setAuthState({
        user: null,
        loading: false,
        isAuthenticated: false,
        isAdmin: false,
      });
      
      // console.log('AuthProvider - User signed out successfully');
    } catch (error) {
      // console.log('AuthProvider - Sign out error:', error);
      // Even if there's an error clearing storage, we should still sign out the user
      setAuthState({
        user: null,
        loading: false,
        isAuthenticated: false,
        isAdmin: false,
      });
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<{ error?: string }> => {
    try {
      // console.log('AuthProvider - Updating profile:', updates);
      
      if (!authState.user) {
        return { error: 'Kullanıcı bulunamadı' };
      }

      const updatedUser = { ...authState.user, ...updates };
      
      await AsyncStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(updatedUser));
      
      const existingUsers = await AsyncStorage.getItem('demo_users');
      const users = existingUsers ? JSON.parse(existingUsers) : [];
      const userIndex = users.findIndex((u: User) => u.id === authState.user?.id);
      
      if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        await AsyncStorage.setItem('demo_users', JSON.stringify(users));
      }

      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
      }));

      // console.log('AuthProvider - Profile updated successfully:', updatedUser.name);
      return {};
    } catch (error: any) {
      // console.log('AuthProvider - Update profile error:', error);
      return { error: 'Profil güncellenirken bir hata oluştu' };
    }
  };

  const resetPassword = async (email: string): Promise<{ error?: string }> => {
    // console.log('AuthProvider - Mock password reset for:', email);
    // In a real app, this would send a password reset email
    return {};
  };

  const value: AuthContextType = {
    user: authState.user,
    loading: authState.loading,
    isAuthenticated: authState.isAuthenticated,
    isAdmin: authState.isAdmin,
    signUp,
    signIn,
    signOut,
    updateProfile,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
