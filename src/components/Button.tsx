import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { theme } from '../utils/theme';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    loading?: boolean;
    disabled?: boolean;
    style?: any;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    loading = false,
    disabled = false,
    style
}) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.98,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 4,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    const isOutline = variant === 'outline';
    const isGhost = variant === 'ghost';

    let backgroundColor = theme.colors.primary;
    let textColor = '#FFFFFF';
    let borderColor = 'transparent';

    if (variant === 'secondary') {
        backgroundColor = theme.colors.surface2;
        textColor = theme.colors.text;
    } else if (isOutline) {
        backgroundColor = 'transparent';
        textColor = theme.colors.primary;
        borderColor = theme.colors.primary;
    } else if (isGhost) {
        backgroundColor = 'transparent';
        textColor = theme.colors.textSecondary;
    }

    return (
        <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
            <TouchableOpacity
                style={[
                    styles.container,
                    { backgroundColor, borderColor, borderWidth: isOutline ? 1 : 0 },
                    disabled && styles.disabled
                ]}
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={disabled || loading}
                activeOpacity={0.8}
            >
                {loading ? (
                    <ActivityIndicator color={textColor} size="small" />
                ) : (
                    <Text style={[styles.text, { color: textColor }]}>{title}</Text>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: theme.spacing.m,
        paddingHorizontal: theme.spacing.l,
        borderRadius: theme.borderRadius.m,
        alignItems: 'center',
        justifyContent: 'center',
        height: 54, // Set a standard height for consistency
    },
    text: {
        ...theme.typography.bodySemi,
        fontSize: 16,
    },
    disabled: {
        opacity: 0.5,
    },
});
