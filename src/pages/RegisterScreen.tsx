import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
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

type RegisterScreenProps = NativeStackScreenProps<RootStackParamList, 'Register'>;

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleRegister = async () => {
        if (!email || !password || !confirmPassword) {
            setError(t.errors.required);
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await authApi.register({ email, password });
            Alert.alert(t.common.success, 'Account created successfully! Please login.');
            navigation.navigate('Login');
        } catch (err: any) {
            const errorMessage = err.data?.message || err.data?.error || err.message || t.common.error;
            Alert.alert('Registration Error', errorMessage);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Screen style={styles.screen}>
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>{t.auth.registerTitle}</Text>
                    <Text style={styles.subtitle}>Join the most exclusive bidding community.</Text>
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

                    <Input
                        label={t.auth.confirmPasswordLabel}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                    />

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <Button
                        title={t.auth.registerButton}
                        onPress={handleRegister}
                        loading={loading}
                        style={styles.registerButton}
                    />

                    <TouchableOpacity
                        onPress={() => navigation.navigate('Login')}
                        style={styles.linkContainer}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.linkText}>
                            Already have an account? <Text style={styles.linkAction}>{t.auth.loginTitle}</Text>
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
        marginBottom: theme.spacing.xl,
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
    registerButton: {
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
