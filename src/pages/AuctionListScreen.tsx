import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, StyleSheet, Text, FlatList, Image, ImageStyle, TouchableOpacity, Animated, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { auctionApi } from '../api/auction';
import t from '../i18n';
import { theme } from '../utils/theme';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Auction {
    id: string;
    title: string;
    description: string;
    currentBid: number;
    endTime: string;
    imageUrl?: string;
    status: string;
}

type AuctionListScreenProps = NativeStackScreenProps<RootStackParamList, 'AuctionList'>;

import { userApi } from '../api/user';

interface UserProfile {
    username: string;
    balance: number;
    wonAuctions: number;
}

export const AuctionListScreen: React.FC<AuctionListScreenProps> = ({ navigation }) => {
    const [auctions, setAuctions] = useState<Auction[]>([]);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);
    const { logout } = useAuth();
    const pulseAnim = useRef(new Animated.Value(0.6)).current;

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1200,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0.6,
                    duration: 1200,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const loadData = async (targetPage = 1, isRefresh = true) => {
        if (isRefresh) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const [auctionRes, profileRes]: any = await Promise.all([
                auctionApi.getAuctions(targetPage, 10),
                isRefresh ? userApi.getProfile() : Promise.resolve(null)
            ]);

            // Map Auctions
            const rawAuctions = auctionRes.auctions || [];
            const mappedAuctions = rawAuctions.map((item: any) => ({
                id: item.id.toString(),
                title: item.title,
                description: item.description,
                currentBid: parseFloat(item.currentPrice || item.startingPrice || '0'),
                endTime: item.endsAt,
                imageUrl: item.imageUrl,
                status: item.status || 'ACTIVE'
            }));

            if (isRefresh) {
                setAuctions(mappedAuctions);
                setPage(1);
            } else {
                setAuctions(prev => [...prev, ...mappedAuctions]);
                setPage(targetPage);
            }

            if (auctionRes.pagination) {
                setTotalPages(auctionRes.pagination.totalPages || 1);
            }

            // Map Profile
            if (isRefresh && profileRes) {
                setUserProfile({
                    username: profileRes.email ? profileRes.email.split('@')[0] : (profileRes.username || 'User'),
                    balance: parseFloat(profileRes.balance || '0'),
                    wonAuctions: Array.isArray(profileRes.wonAuctions) ? profileRes.wonAuctions.length : 0
                });
            }
        } catch (error) {
            console.error('[API] Failed to fetch data:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleLoadMore = () => {
        if (!loadingMore && page < totalPages) {
            loadData(page + 1, false);
        }
    };

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator color={theme.colors.primary} />
            </View>
        );
    };

    const handleLogout = () => {
        Alert.alert(
            'Confirm Logout',
            'Are you sure you want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Yes', onPress: logout }
            ]
        );
    };

    const renderItem = ({ item }: { item: Auction }) => (
        <Card
            onPress={() => navigation.navigate('AuctionDetail', { auctionId: item.id })}
            style={styles.card}
        >
            <View style={styles.imageContainer}>
                <Image
                    source={{
                        uri: (item.imageUrl && typeof item.imageUrl === 'string' && item.imageUrl.startsWith('http'))
                            ? item.imageUrl
                            : `https://loremflickr.com/600/400/abstract?lock=${item.id}`
                    }}
                    style={styles.image as ImageStyle}
                    resizeMode="cover"
                />
                {item.status === 'ACTIVE' && (
                    <View style={styles.glassBadge}>
                        <Animated.View style={[styles.pulseDot, { opacity: pulseAnim }]} />
                        <Text style={styles.liveText}>LIVE</Text>
                    </View>
                )}
                <View style={[
                    styles.activeBadge,
                    item.status === 'SOLD' && styles.soldBadge,
                    item.status === 'EXPIRED' && styles.expiredBadge
                ]}>
                    <Text style={[
                        styles.activeText,
                        item.status === 'SOLD' && styles.soldText,
                        item.status === 'EXPIRED' && styles.expiredText
                    ]}>
                        {item.status === 'ACTIVE' ? 'Active' : item.status}
                    </Text>
                </View>
            </View>

            <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                    <View style={styles.titleWrapper}>
                        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                        <Text style={styles.cardDescription} numberOfLines={1}>{item.description}</Text>
                    </View>
                </View>

                <View style={styles.footerRow}>
                    <View>
                        <Text style={styles.bidLabel}>{t.auction.currentBid}</Text>
                        <Text style={styles.bidValue}>${item.currentBid.toLocaleString()}</Text>
                    </View>
                    <View style={styles.actionIcon}>
                        <Text style={styles.actionIconText}>→</Text>
                    </View>
                </View>
            </View>
        </Card>
    );

    return (
        <View style={styles.screen}>
            <StatusBar barStyle="dark-content" />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerSubtitle}>Exclusive Auctions</Text>
                        <Text style={styles.headerTitle}>LiveBid</Text>
                    </View>
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('CreateAuction')}
                            style={styles.headerIconButton}
                        >
                            <Text style={styles.headerIconText}>+</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleLogout} style={styles.headerIconButton}>
                            <Text style={styles.headerIconText}>🚪</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {userProfile && (
                    <View style={styles.profileCardWrapper}>
                        <Card style={styles.profileCard}>
                            <View style={styles.profileInfo}>
                                <View style={styles.profileAvatar}>
                                    <Text style={styles.avatarText}>{userProfile.username[0].toUpperCase()}</Text>
                                </View>
                                <View>
                                    <Text style={styles.profileName}>{userProfile.username}</Text>
                                    <Text style={styles.profileLabel}>Investor Profile</Text>
                                </View>
                            </View>
                            <View style={styles.profileStats}>
                                <View style={styles.statItem}>
                                    <Text style={styles.statTitle}>Balance</Text>
                                    <Text style={styles.balanceValue}>${userProfile.balance.toLocaleString()}</Text>
                                </View>
                                <View style={styles.statDivider} />
                                <View style={styles.statItem}>
                                    <Text style={styles.statTitle}>Won</Text>
                                    <Text style={styles.wonValue}>{userProfile.wonAuctions}</Text>
                                </View>
                            </View>
                        </Card>
                    </View>
                )}

                {loading ? (
                    <View style={styles.center}>
                        <Text style={styles.loadingText}>Searching for gems...</Text>
                    </View>
                ) : auctions.length === 0 ? (
                    <View style={styles.center}>
                        <Text style={styles.emptyIcon}>📦</Text>
                        <Text style={styles.emptyText}>{t.auction.noAuctions}</Text>
                        <Button title={t.common.retry} onPress={loadData} variant="outline" style={styles.retryButton} />
                    </View>
                ) : (
                    <FlatList
                        data={auctions}
                        renderItem={renderItem}
                        numColumns={2}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.list}
                        columnWrapperStyle={styles.row}
                        refreshing={loading}
                        onRefresh={() => loadData(1, true)}
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={renderFooter}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.xl,
        paddingTop: theme.spacing.m,
        paddingBottom: theme.spacing.l,
    },
    headerSubtitle: {
        ...theme.typography.label,
        color: theme.colors.textTertiary,
        marginBottom: 2,
    },
    headerTitle: {
        ...theme.typography.h1,
        color: theme.colors.text,
        fontSize: 28,
    },
    headerActions: {
        flexDirection: 'row',
        gap: theme.spacing.s,
    },
    headerIconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.small,
    },
    headerIconText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    list: {
        paddingHorizontal: theme.spacing.m,
        paddingBottom: theme.spacing.xxl,
    },
    row: {
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.s,
    },
    card: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.l,
        padding: 0,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.colors.border,
        margin: theme.spacing.xs,
        marginBottom: theme.spacing.m,
        ...theme.shadows.small,
    },
    imageContainer: {
        height: 120,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    noImageText: {
        fontSize: 32,
    },
    glassBadge: {
        position: 'absolute',
        top: theme.spacing.s,
        right: theme.spacing.s,
        backgroundColor: 'rgba(16, 185, 129, 0.9)', // Emerald with opacity
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: theme.borderRadius.full,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    pulseDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#fff',
        marginRight: 6,
    },
    liveText: {
        color: '#fff',
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    cardContent: {
        padding: theme.spacing.m,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: theme.spacing.m,
    },
    titleWrapper: {
        flex: 1,
        marginRight: theme.spacing.m,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: 1,
    },
    cardDescription: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
    },
    activeBadge: {
        position: 'absolute',
        bottom: theme.spacing.s,
        left: theme.spacing.s,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
    },
    soldBadge: {
        backgroundColor: 'rgba(239, 68, 68, 0.9)',
    },
    expiredBadge: {
        backgroundColor: 'rgba(100, 116, 139, 0.9)',
    },
    activeText: {
        ...theme.typography.label,
        color: theme.colors.primary,
        fontSize: 8,
    },
    soldText: {
        color: '#fff',
    },
    expiredText: {
        color: '#fff',
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    bidLabel: {
        ...theme.typography.label,
        color: theme.colors.textTertiary,
        fontSize: 10,
        marginBottom: 2,
    },
    bidValue: {
        ...theme.typography.h3,
        color: theme.colors.text,
        fontSize: 16,
    },
    actionIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionIconText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.xl,
    },
    loadingText: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: theme.spacing.m,
    },
    emptyText: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginBottom: theme.spacing.l,
    },
    retryButton: {
        width: 120,
    },
    profileCardWrapper: {
        paddingHorizontal: theme.spacing.xl,
        marginBottom: theme.spacing.l,
    },
    profileCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.xxl,
        padding: theme.spacing.xl,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.medium,
    },
    profileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    profileAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.m,
    },
    avatarText: {
        ...theme.typography.h2,
        color: '#fff',
        fontSize: 20,
    },
    profileName: {
        ...theme.typography.h3,
        color: theme.colors.text,
    },
    profileLabel: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
    },
    profileStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: theme.colors.surface2,
        borderRadius: theme.borderRadius.xl,
        paddingVertical: theme.spacing.m,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statTitle: {
        ...theme.typography.label,
        color: theme.colors.textTertiary,
        marginBottom: 2,
    },
    balanceValue: {
        ...theme.typography.h3,
        color: theme.colors.text,
        fontSize: 18,
    },
    wonValue: {
        ...theme.typography.h3,
        color: theme.colors.success,
        fontSize: 18,
    },
    statDivider: {
        width: 1,
        height: '60%',
        backgroundColor: theme.colors.border,
    },
    footerLoader: {
        paddingVertical: theme.spacing.xl,
        alignItems: 'center',
    },
});
