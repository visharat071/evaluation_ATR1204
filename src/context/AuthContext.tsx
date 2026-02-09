import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api/client';

interface AuthContextType {
    user: any | null;
    login: (token: string, userData: any) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        loadStorageData();
    }, []);

    const loadStorageData = async () => {
        try {
            setIsLoading(true);
            const savedToken = await AsyncStorage.getItem('auth_token');
            const savedUser = await AsyncStorage.getItem('auth_user');

            if (savedToken && savedUser) {
                api.setToken(savedToken);
                setUser(JSON.parse(savedUser));
            }
        } catch (error) {
            console.error('[AUTH CONTEXT] Failed to load user data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (token: string, userData: any) => {
        setIsLoading(true);
        try {
            await AsyncStorage.setItem('auth_token', token);
            await AsyncStorage.setItem('auth_user', JSON.stringify(userData));
            api.setToken(token);
            setUser(userData);
        } catch (error) {
            console.error('[AUTH CONTEXT] Login save failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        await AsyncStorage.removeItem('auth_token');
        await AsyncStorage.removeItem('auth_user');
        api.setToken(null);
        setUser(null);
    };

    // Register 401 handler
    api.onUnauthorized = logout;


    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
