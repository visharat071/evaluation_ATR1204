import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Image, ScrollView, Alert, SafeAreaView, TouchableOpacity, ViewStyle } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

import { Screen } from '../components/Screen';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { auctionApi } from '../api/auction';
import t from '../i18n';
import { theme } from '../utils/theme';
import { useSocket } from '../hooks/useSocket';

type AuctionDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'AuctionDetail'>;

export const AuctionDetailScreen: React.FC<AuctionDetailScreenProps> = ({ navigation, route }) => {
    const { auctionId } = route.params;
    const [auction, setAuction] = useState<any>(null);
    const [bidAmount, setBidAmount] = useState('');
    const [loading, setLoading] = useState(true);
    const [bidding, setBidding] = useState(false);
    const [error, setError] = useState('');

    const { viewerCount, socket } = useSocket(auctionId);

    useEffect(() => {
        loadAuction();
    }, [auctionId]);

    // Handle WebSocket events
    useEffect(() => {
        if (!socket) return;

        const handleNewBid = (data: any) => {
            const amount = Number(data.amount);
            console.log('[SOCKET EVENT] NEW_BID in Component:', data);
            setAuction((prev: any) => {
                if (!prev) return prev;

                // Prepend the new bid to history
                const newBidItem = {
                    id: Date.now().toString(), // Temporary ID
                    amount: amount,
                    user: { email: data.bidderName },
                    createdAt: data.timestamp
                };

                return {
                    ...prev,
                    currentBid: amount,
                    bids: [newBidItem, ...(prev.bids || [])]
                };
            });
            // Update bid input to next logical amount
            setBidAmount((amount + 1).toString());
        };

        const handleAuctionSold = (data: any) => {
            console.log('[SOCKET EVENT] AUCTION_SOLD in Component:', data);
            Alert.alert('Auction Sold!', `Winner: ${data.winnerName}\nFinal Price: $${data.finalPrice}`);
            setAuction((prev: any) => prev ? { ...prev, status: 'SOLD' } : prev);
        };

        const handleAuctionEndingSoon = (data: any) => {
            console.log('[SOCKET EVENT] AUCTION_ENDING_SOON in Component:', data);
            Alert.alert('Ending Soon!', `Only ${data.secondsRemaining} seconds remaining!`);
        };

        socket.on('NEW_BID', handleNewBid);
        socket.on('AUCTION_SOLD', handleAuctionSold);
        socket.on('AUCTION_ENDING_SOON', handleAuctionEndingSoon);

        return () => {
            socket.off('NEW_BID', handleNewBid);
            socket.off('AUCTION_SOLD', handleAuctionSold);
            socket.off('AUCTION_ENDING_SOON', handleAuctionEndingSoon);
        };
    }, [socket]);

    const loadAuction = async () => {
        setLoading(true);
        try {
            const data: any = await auctionApi.getAuction(auctionId);
            const mappedData = {
                ...data,
                currentBid: parseFloat(data.currentPrice || data.startingPrice || '0'),
                endTime: data.endsAt
            };

            setAuction(mappedData);
            setBidAmount((mappedData.currentBid + 1).toString());
        } catch (err) {
            console.error('[API] Failed to load auction:', err);
            setError(t.common.error);
        } finally {
            setLoading(false);
        }
    };

    const handlePlaceBid = async () => {
        const amount = parseFloat(bidAmount);
        if (isNaN(amount) || (auction && amount <= auction.currentBid)) {
            Alert.alert('Invalid Bid', t.errors.bidTooLow);
            return;
        }

        setBidding(true);
        try {
            await auctionApi.placeBid(auctionId, amount);
            // We don't necessarily need loadAuction() here anymore because NEW_BID will be received via socket
            // but keeping it as a fallback or to ensure local state is synced perfectly is fine.
            Alert.alert(t.common.success, 'Bid placed successfully!');
        } catch (err: any) {
            const msg = err.data?.message || t.common.error;
            Alert.alert('Bid Error', msg);
        } finally {
            setBidding(false);
        }
    };

    if (loading) {
        return (
            <Screen style={styles.center}>
                <Text style={styles.loadingText}>Loading treasures...</Text>
            </Screen>
        );
    }

    if (!auction) {
        return (
            <Screen style={styles.center}>
                <Text style={styles.errorText}>Something went wrong</Text>
                <Button title={t.common.retry} onPress={loadAuction} style={styles.retryButton} />
            </Screen>
        );
    }

    return (
        <View style={styles.screen}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Text style={styles.backText}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle} numberOfLines={1}>{auction.title}</Text>
                    <View style={styles.viewerBadge}>
                        <View style={styles.viewerDot} />
                        <Text style={styles.viewerCountText}>{viewerCount}</Text>
                    </View>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    <View style={styles.imageWrapper}>
                        {auction.imageUrl ? (
                            <Image
                                source={{ uri: auction.imageUrl.startsWith('http') ? auction.imageUrl : `https://placehold.co/600x400?text=${encodeURIComponent(auction.title)}` }}
                                style={styles.image}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={[styles.image, styles.noImage]}>
                                <Text style={styles.noImageText}>🎨</Text>
                            </View>
                        )}
                        <View style={[styles.statusBadge, auction.status === 'SOLD' && styles.statusBadgeSold]}>
                            <Text style={styles.statusText}>{auction.status || 'ACTIVE'}</Text>
                        </View>
                    </View>

                    <View style={styles.content}>
                        <View style={styles.titleSection}>
                            <Text style={styles.title}>{auction.title}</Text>
                            <Text style={styles.description}>{auction.description}</Text>
                        </View>

                        <View style={styles.statsGrid}>
                            <View style={styles.statCard}>
                                <Text style={styles.statLabel}>{t.auction.currentBid}</Text>
                                <Text style={styles.statValue}>${auction.currentBid.toLocaleString()}</Text>
                            </View>
                            <View style={[styles.statCard, styles.statCardSecondary]}>
                                <Text style={styles.statLabel}>Ends On</Text>
                                <Text style={styles.statValueCompact}>{new Date(auction.endTime).toLocaleDateString()}</Text>
                            </View>
                        </View>

                        <View style={styles.bidActionCard}>
                            <Text style={styles.bidSectionTitle}>Your Offer</Text>
                            <Input
                                placeholder="Enter amount"
                                value={bidAmount}
                                onChangeText={setBidAmount}
                                keyboardType="numeric"
                                style={styles.bidInput}
                            />
                            <Button
                                title={auction.status === 'SOLD' ? 'Auction Ended' : `Place Bid $${bidAmount}`}
                                onPress={handlePlaceBid}
                                loading={bidding}
                                disabled={auction.status === 'SOLD'}
                            />
                        </View>

                        <View style={styles.historyContainer}>
                            <View style={styles.historyHeader}>
                                <Text style={styles.historyTitle}>Bid History</Text>
                                <Text style={styles.historyCount}>{auction.bids?.length || 0} bids</Text>
                            </View>

                            {auction.bids && auction.bids.length > 0 ? (
                                <View style={styles.historyList}>
                                    {auction.bids.slice(0, 10).map((bid: any, index: number) => (
                                        <View key={bid.id || index} style={styles.historyItem}>
                                            <View style={styles.bidderInfo}>
                                                <View style={styles.avatarPlaceholder}>
                                                    <Text style={styles.avatarText}>{bid.user?.email?.[0].toUpperCase() || 'A'}</Text>
                                                </View>
                                                <View>
                                                    <Text style={styles.bidUser} numberOfLines={1}>{bid.user?.email || 'Anonymous'}</Text>
                                                    <Text style={styles.bidDate}>{new Date(bid.createdAt).toLocaleDateString()}</Text>
                                                </View>
                                            </View>
                                            <Text style={styles.bidAmount}>${bid.amount.toLocaleString()}</Text>
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <View style={styles.emptyHistory}>
                                    <Text style={styles.emptyText}>Be the first to bid!</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </ScrollView>
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
        paddingVertical: theme.spacing.m,
    },
    headerTitle: {
        ...theme.typography.h3,
        color: theme.colors.text,
        flex: 1,
        textAlign: 'center',
    },
    backButton: {
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
    backText: {
        fontSize: 20,
        color: theme.colors.text,
        fontWeight: 'bold',
    },
    viewerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface2,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 6,
    },
    viewerDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: theme.colors.success,
    },
    viewerCountText: {
        ...theme.typography.caption,
        color: theme.colors.text,
        fontWeight: 'bold',
        fontSize: 12,
    },
    headerPlaceholder: {
        width: 44,
    },
    scrollContent: {
        paddingBottom: theme.spacing.xxl,
    },
    imageWrapper: {
        width: '100%',
        paddingHorizontal: theme.spacing.xl,
        marginTop: theme.spacing.m,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: 300,
        borderRadius: theme.borderRadius.xxl,
        ...theme.shadows.large,
    },
    noImage: {
        backgroundColor: theme.colors.surface2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noImageText: {
        fontSize: 64,
    },
    statusBadge: {
        position: 'absolute',
        top: theme.spacing.l,
        right: theme.spacing.xxl,
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: theme.borderRadius.full,
        ...theme.shadows.small,
    },
    statusBadgeSold: {
        backgroundColor: theme.colors.error,
    },
    statusText: {
        ...theme.typography.label,
        color: '#fff',
        fontSize: 10,
    },
    content: {
        paddingHorizontal: theme.spacing.xl,
        marginTop: theme.spacing.xl,
    },
    titleSection: {
        marginBottom: theme.spacing.xl,
    },
    title: {
        ...theme.typography.h1,
        color: theme.colors.text,
        fontSize: 30,
        marginBottom: theme.spacing.s,
    },
    description: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        lineHeight: 24,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: theme.spacing.m,
        marginBottom: theme.spacing.xl,
    },
    statCard: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.l,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.small,
    },
    statCardSecondary: {
        backgroundColor: theme.colors.surface1,
    },
    statLabel: {
        ...theme.typography.label,
        color: theme.colors.textTertiary,
        marginBottom: 4,
    },
    statValue: {
        ...theme.typography.h2,
        color: theme.colors.primary,
        fontSize: 24,
    },
    statValueCompact: {
        ...theme.typography.bodySemi,
        color: theme.colors.text,
    },
    bidActionCard: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.xl,
        borderRadius: theme.borderRadius.xxl,
        borderWidth: 1,
        borderColor: theme.colors.primary,
        marginBottom: theme.spacing.xxl,
        ...theme.shadows.medium,
    },
    bidSectionTitle: {
        ...theme.typography.h3,
        color: theme.colors.text,
        marginBottom: theme.spacing.m,
    },
    bidInput: {
        marginBottom: theme.spacing.l,
    },
    historyContainer: {
        marginTop: theme.spacing.m,
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: theme.spacing.l,
    },
    historyTitle: {
        ...theme.typography.h2,
        fontSize: 22,
    },
    historyCount: {
        ...theme.typography.caption,
        color: theme.colors.textTertiary,
    },
    historyList: {
        gap: theme.spacing.m,
    },
    historyItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.m,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.l,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    bidderInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.m,
        flex: 1,
    },
    avatarPlaceholder: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: theme.colors.surface2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        ...theme.typography.bodySemi,
        fontSize: 14,
        color: theme.colors.primary,
    },
    bidUser: {
        ...theme.typography.bodySemi,
        fontSize: 14,
        color: theme.colors.text,
    },
    bidDate: {
        ...theme.typography.caption,
        fontSize: 11,
    },
    bidAmount: {
        ...theme.typography.h3,
        color: theme.colors.success,
        fontSize: 16,
    },
    emptyHistory: {
        padding: theme.spacing.xxl,
        alignItems: 'center',
        backgroundColor: theme.colors.surface2,
        borderRadius: theme.borderRadius.xl,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    emptyText: {
        ...theme.typography.body,
        color: theme.colors.textTertiary,
        fontStyle: 'italic',
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
    errorText: {
        ...theme.typography.body,
        color: theme.colors.error,
        marginBottom: theme.spacing.m,
    },
    retryButton: {
        width: 120,
    },
});
