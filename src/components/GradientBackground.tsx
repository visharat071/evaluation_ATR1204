import React, { ReactNode } from 'react';
import { StyleSheet, ViewStyle, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../utils/theme';

interface GradientBackgroundProps {
    children: ReactNode;
    style?: ViewStyle;
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({ children, style }) => {
    return (
        <LinearGradient
            colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
            style={[styles.container, style]}
            start={{ x: 0, y: 0.2 }}
            end={{ x: 1, y: 0.8 }}
        >
            {/* Subtle overlay for better readability and depth */}
            <View style={styles.overlay} />
            {children}
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    }
});
