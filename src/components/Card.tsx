import React, { ReactNode } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../utils/theme';

interface CardProps {
    children: ReactNode;
    onPress?: () => void;
    style?: any;
}

export const Card: React.FC<CardProps> = ({ children, onPress, style }) => {
    const Container = onPress ? TouchableOpacity : View;

    return (
        <Container
            style={[styles.card, style]}
            onPress={onPress}
            activeOpacity={0.9}
        >
            {children}
        </Container>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.l,
        padding: theme.spacing.m,
        marginBottom: theme.spacing.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.small,
    },
});
