import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Text, FlatList, Dimensions, NativeScrollEvent, NativeSyntheticEvent, Animated, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { GradientBackground } from '../components/GradientBackground';
import { Button } from '../components/Button';
import { theme } from '../utils/theme';
import t from '../i18n';

const { width, height } = Dimensions.get('window');

type OnboardingScreenProps = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

interface Slide {
    id: string;
    title: string;
    description: string;
    icon: string;
}

const slides: Slide[] = [
    {
        id: '1',
        title: 'Welcome to LiveBid',
        description: t.onboarding.slide1Data,
        icon: '💎'
    },
    {
        id: '2',
        title: 'Real-time Auctions',
        description: t.onboarding.slide2Data,
        icon: '⚡️'
    },
    {
        id: '3',
        title: 'Secure Payments',
        description: t.onboarding.slide3Data,
        icon: '🛡️'
    },
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const scrollX = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (currentIndex < slides.length - 1) {
                flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
                setCurrentIndex(prev => prev + 1);
            } else {
                flatListRef.current?.scrollToIndex({ index: 0, animated: true });
                setCurrentIndex(0);
            }
        }, 4000);

        return () => clearInterval(intervalId);
    }, [currentIndex]);

    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
        {
            useNativeDriver: false,
            listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
                const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
                setCurrentIndex(slideIndex);
            }
        }
    );

    const renderItem = ({ item, index }: { item: Slide, index: number }) => {
        const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
        ];

        const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.92, 1, 0.92],
            extrapolate: 'clamp',
        });

        const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: 'clamp',
        });

        return (
            <View style={styles.slide}>
                <Animated.View style={[styles.cardContainer, { transform: [{ scale }], opacity }]}>
                    <View style={styles.glassCard}>
                        <View style={styles.iconContainer}>
                            <Text style={styles.icon}>{item.icon}</Text>
                        </View>

                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={styles.description}>{item.description}</Text>
                    </View>
                </Animated.View>
            </View>
        );
    };

    const renderDot = (index: number) => {
        const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
        ];

        const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 24, 8],
            extrapolate: 'clamp',
        });

        const dotOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
        });

        return (
            <Animated.View
                key={index}
                style={[
                    styles.dot,
                    {
                        width: dotWidth,
                        opacity: dotOpacity,
                        backgroundColor: theme.colors.primary
                    }
                ]}
            />
        );
    };

    return (
        <GradientBackground style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={slides}
                renderItem={renderItem}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
            />

            <View style={styles.footer}>
                <View style={styles.pagination}>
                    {slides.map((_, index) => renderDot(index))}
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        title={t.onboarding.getStarted}
                        onPress={() => navigation.navigate('Login')}
                        variant="primary"
                    />
                </View>
            </View>
        </GradientBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        alignItems: 'center',
    },
    slide: {
        width,
        height: height * 0.7,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.l,
    },
    cardContainer: {
        width: '100%',
        alignItems: 'center',
    },
    glassCard: {
        width: '100%',
        backgroundColor: theme.colors.glass,
        borderRadius: theme.borderRadius.xxl,
        padding: theme.spacing.xl,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
        ...theme.shadows.large,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    icon: {
        fontSize: 48,
    },
    title: {
        ...theme.typography.h1,
        color: theme.colors.text,
        textAlign: 'center',
        marginBottom: theme.spacing.m,
    },
    description: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
    footer: {
        paddingHorizontal: theme.spacing.xl,
        paddingBottom: theme.spacing.xxl,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 20,
        marginBottom: theme.spacing.xl,
    },
    dot: {
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    buttonContainer: {
        width: '100%',
    },
});
