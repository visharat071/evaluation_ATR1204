import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert, } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

import { Screen } from '../components/Screen';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth';
import t from '../i18n';
import { theme } from '../utils/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            setError(t.errors.required);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError(t.errors.emailInvalid);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response: any = await authApi.login({ email, password });
            const token = response.data?.token;
            const userData = response.user || { email };

            if (token) {
                await login(token, userData);
            } else {
                throw new Error('Authentication failed: Token missing');
            }
        } catch (_err: any) {
            const errorMessage = _err.data?.message || _err.data?.error || _err.message || t.errors.invalidCredentials;
            Alert.alert('Login Error', errorMessage);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Screen style={styles.screen}>
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>{t.auth.loginTitle}</Text>
                    <Text style={styles.subtitle}>Welcome back, you've been missed!</Text>
                </View>

                <View style={styles.form}>
                    <Input
                        label={t.auth.emailLabel}
                        placeholder="email@example.com"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />

                    <Input
                        label={t.auth.passwordLabel}
                        placeholder="••••••••"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <Button
                        title={t.auth.loginButton}
                        onPress={handleLogin}
                        loading={loading}
                        style={styles.loginButton}
                    />

                    <TouchableOpacity
                        onPress={() => navigation.navigate('Register')}
                        style={styles.linkContainer}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.linkText}>
                            Don't have an account? <Text style={styles.linkAction}>{t.auth.registerLink}</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </Screen>
    );
};

const styles = StyleSheet.create({
    screen: {
        backgroundColor: theme.colors.background,
    },
    container: {
        flex: 1,
        paddingHorizontal: theme.spacing.xl,
        justifyContent: 'center',
    },
    header: {
        marginBottom: theme.spacing.xxl,
        alignItems: 'center',
    },
    title: {
        ...theme.typography.h1,
        color: theme.colors.text,
        marginBottom: theme.spacing.s,
    },
    subtitle: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
    form: {
        width: '100%',
    },
    errorText: {
        ...theme.typography.caption,
        color: theme.colors.error,
        marginBottom: theme.spacing.m,
        textAlign: 'center',
    },
    loginButton: {
        marginTop: theme.spacing.m,
    },
    linkContainer: {
        marginTop: theme.spacing.xl,
        alignItems: 'center',
    },
    linkText: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        fontSize: 14,
    },
    linkAction: {
        color: theme.colors.primary,
        fontWeight: '700',
    },
});
