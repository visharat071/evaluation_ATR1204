import React, { useState } from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps } from 'react-native';
import { theme } from '../utils/theme';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, style, onFocus, onBlur, ...props }) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = (e: any) => {
        setIsFocused(true);
        onFocus?.(e);
    };

    const handleBlur = (e: any) => {
        setIsFocused(false);
        onBlur?.(e);
    };

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput
                style={[
                    styles.input,
                    isFocused && styles.inputFocused,
                    props.editable === false && styles.inputDisabled,
                    error ? styles.inputError : null,
                    style
                ]}
                placeholderTextColor={theme.colors.textTertiary}
                onFocus={handleFocus}
                onBlur={handleBlur}
                {...props}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: theme.spacing.m,
    },
    label: {
        ...theme.typography.label,
        marginBottom: theme.spacing.xs,
        color: theme.colors.textSecondary,
    },
    input: {
        fontSize: theme.typography.body.fontSize,
        fontWeight: theme.typography.body.fontWeight,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.m,
        paddingHorizontal: theme.spacing.m,
        paddingVertical: theme.spacing.m,
        color: theme.colors.text,
        backgroundColor: theme.colors.surface1,
        minHeight: 50, // Ensure a consistent minimum height
    },
    inputFocused: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.surface,
        ...theme.shadows.small,
    },
    inputDisabled: {
        backgroundColor: theme.colors.surface2,
        color: theme.colors.textTertiary,
        borderColor: theme.colors.border,
    },
    inputError: {
        borderColor: theme.colors.error,
    },
    errorText: {
        ...theme.typography.caption,
        marginTop: theme.spacing.xs,
        color: theme.colors.error,
    },
});
