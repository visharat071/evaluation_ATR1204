import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../utils/theme';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../api/user';

interface AccountDetails {
    email: string;
    username: string;
    balance: number;
    createdAt: string;
}

const formatToIST = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
};

export const SettingsScreen = () => {
    const { logout } = useAuth();
    const [showAccountModal, setShowAccountModal] = useState(false);

    const { data: accountDetails, isLoading: loading } = useQuery({
        queryKey: ['userProfile'],
        queryFn: () => userApi.getProfile(),
        enabled: showAccountModal,
        select: (res: any) => ({
            email: res.email || 'N/A',
            username: res.username || res.email?.split('@')[0] || 'N/A',
            balance: parseFloat(res.balance || '0'),
            createdAt: res.createdAt || res.created_at || '',
        }),
    });

    const handleAccountPress = () => {
        setShowAccountModal(true);
    };

    const handleLogout = () => {
        Alert.alert(
            'Confirm Logout',
            'Are you sure you want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Yes', onPress: logout },
            ],
        );
    };

    return (
        <View style={styles.screen}>
            <SafeAreaView style={styles.safeArea} />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Settings</Text>
            </View>

            <ScrollView style={styles.content}>
                {/* Account Details */}
                <TouchableOpacity style={styles.row} onPress={handleAccountPress}>
                    <View style={styles.rowIconContainer}>
                        <Text style={styles.rowIcon}>👤</Text>
                    </View>
                    <View style={styles.rowContent}>
                        <Text style={styles.rowText}>Account Details</Text>
                        <Text style={styles.rowSubtext}>View your profile information</Text>
                    </View>
                    <Text style={styles.rowArrow}>→</Text>
                </TouchableOpacity>

                {/* Logout */}
                <TouchableOpacity style={[styles.row, styles.logoutRow]} onPress={handleLogout}>
                    <View style={[styles.rowIconContainer, styles.logoutIconContainer]}>
                        <Text style={styles.rowIcon}>🚪</Text>
                    </View>
                    <View style={styles.rowContent}>
                        <Text style={[styles.rowText, styles.logoutText]}>Log Out</Text>
                        <Text style={styles.rowSubtext}>Sign out of your account</Text>
                    </View>
                    <Text style={styles.rowArrow}>→</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Account Details Modal */}
            <Modal
                visible={showAccountModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowAccountModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Account Details</Text>
                        <TouchableOpacity
                            onPress={() => setShowAccountModal(false)}
                            style={styles.closeButton}
                        >
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={theme.colors.primary} />
                        </View>
                    ) : accountDetails ? (
                        <ScrollView style={styles.modalContent}>
                            {/* Avatar Section */}
                            <View style={styles.avatarSection}>
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>
                                        {accountDetails.username[0]?.toUpperCase() || '?'}
                                    </Text>
                                </View>
                                <Text style={styles.avatarName}>{accountDetails.username}</Text>
                            </View>

                            {/* Details Card */}
                            <View style={styles.detailsCard}>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>📧  Email</Text>
                                    <Text style={styles.detailValue}>{accountDetails.email}</Text>
                                </View>

                                <View style={styles.detailDivider} />

                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>👤  Username</Text>
                                    <Text style={styles.detailValue}>{accountDetails.username}</Text>
                                </View>

                                <View style={styles.detailDivider} />

                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>💰  Balance</Text>
                                    <Text style={[styles.detailValue, styles.balanceText]}>
                                        ${accountDetails.balance.toLocaleString()}
                                    </Text>
                                </View>

                                <View style={styles.detailDivider} />

                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>📅  Joined</Text>
                                    <Text style={styles.detailValue}>
                                        {accountDetails.createdAt
                                            ? formatToIST(accountDetails.createdAt)
                                            : 'N/A'}
                                    </Text>
                                </View>
                            </View>
                        </ScrollView>
                    ) : null}
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    safeArea: {},
    header: {
        paddingHorizontal: theme.spacing.xl,
        paddingTop: theme.spacing.m,
        paddingBottom: theme.spacing.l,
    },
    headerTitle: {
        ...theme.typography.h1,
        color: theme.colors.text,
        fontSize: 28,
    },
    content: {
        flex: 1,
        paddingHorizontal: theme.spacing.m,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.l,
        padding: theme.spacing.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: theme.spacing.m,
    },
    rowIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: `${theme.colors.primary}15`,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.m,
    },
    rowIcon: {
        fontSize: 20,
    },
    rowContent: {
        flex: 1,
    },
    rowText: {
        ...theme.typography.body,
        color: theme.colors.text,
        fontWeight: '600',
        fontSize: 16,
    },
    rowSubtext: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    rowArrow: {
        fontSize: 16,
        color: theme.colors.textSecondary,
    },
    logoutRow: {
    },
    logoutIconContainer: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    logoutText: {
        color: '#EF4444',
    },
    // Modal styles
    modalContainer: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.xl,
        paddingTop: theme.spacing.xl,
        paddingBottom: theme.spacing.l,
    },
    modalTitle: {
        ...theme.typography.h2,
        color: theme.colors.text,
        fontSize: 22,
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    closeButtonText: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        flex: 1,
        paddingHorizontal: theme.spacing.xl,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
        paddingTop: theme.spacing.m,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.m,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: '700',
        color: '#fff',
    },
    avatarName: {
        ...theme.typography.h2,
        color: theme.colors.text,
        fontSize: 22,
    },
    detailsCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.xl,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    detailRow: {
        paddingVertical: theme.spacing.m,
    },
    detailLabel: {
        ...theme.typography.label,
        color: theme.colors.textSecondary,
        fontSize: 13,
        marginBottom: 6,
    },
    detailValue: {
        ...theme.typography.body,
        color: theme.colors.text,
        fontSize: 16,
        fontWeight: '600',
    },
    balanceText: {
        color: theme.colors.primary,
    },
    detailDivider: {
        height: 1,
        backgroundColor: theme.colors.border,
    },
});
