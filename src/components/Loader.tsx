import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { theme } from '../utils/theme';

interface LoaderProps {
    size?: 'small' | 'medium' | 'large';
    color?: string;
}

export const Loader: React.FC<LoaderProps> = ({
    size = 'medium',
    color = theme.colors.primary
}) => {
    const spinValue = useRef(new Animated.Value(0)).current;
    const scaleValue = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Rotation animation
        Animated.loop(
            Animated.timing(spinValue, {
                toValue: 1,
                duration: 1000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();

        // Pulse animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(scaleValue, {
                    toValue: 1.2,
                    duration: 600,
                    easing: Easing.ease,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleValue, {
                    toValue: 1,
                    duration: 600,
                    easing: Easing.ease,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const sizeMap = {
        small: 24,
        medium: 40,
        large: 56,
    };

    const loaderSize = sizeMap[size];
    const dotSize = loaderSize / 8;

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.loader,
                    {
                        width: loaderSize,
                        height: loaderSize,
                        borderRadius: loaderSize / 2,
                        transform: [{ rotate: spin }],
                    },
                ]}
            >
                <View
                    style={[
                        styles.dot,
                        {
                            width: dotSize,
                            height: dotSize,
                            borderRadius: dotSize / 2,
                            backgroundColor: color,
                            top: 0,
                            left: loaderSize / 2 - dotSize / 2,
                        },
                    ]}
                />
                <View
                    style={[
                        styles.dot,
                        {
                            width: dotSize,
                            height: dotSize,
                            borderRadius: dotSize / 2,
                            backgroundColor: color,
                            opacity: 0.7,
                            top: loaderSize / 2 - dotSize / 2,
                            right: 0,
                        },
                    ]}
                />
                <View
                    style={[
                        styles.dot,
                        {
                            width: dotSize,
                            height: dotSize,
                            borderRadius: dotSize / 2,
                            backgroundColor: color,
                            opacity: 0.4,
                            bottom: 0,
                            left: loaderSize / 2 - dotSize / 2,
                        },
                    ]}
                />
                <View
                    style={[
                        styles.dot,
                        {
                            width: dotSize,
                            height: dotSize,
                            borderRadius: dotSize / 2,
                            backgroundColor: color,
                            opacity: 0.2,
                            top: loaderSize / 2 - dotSize / 2,
                            left: 0,
                        },
                    ]}
                />
            </Animated.View>
            <Animated.View
                style={[
                    styles.ring,
                    {
                        width: loaderSize * 1.4,
                        height: loaderSize * 1.4,
                        borderRadius: (loaderSize * 1.4) / 2,
                        borderColor: color,
                        transform: [{ scale: scaleValue }],
                    },
                ]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loader: {
        position: 'relative',
    },
    dot: {
        position: 'absolute',
    },
    ring: {
        position: 'absolute',
        borderWidth: 2,
        opacity: 0.2,
    },
});
