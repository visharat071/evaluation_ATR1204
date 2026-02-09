import React, { ReactNode } from 'react';
import { View, StyleSheet, StatusBar, SafeAreaView } from 'react-native';
import { theme } from '../utils/theme';
import { GradientBackground } from './GradientBackground';

interface ScreenProps {
    children: ReactNode;
    style?: any;
}

export const Screen: React.FC<ScreenProps> = ({ children, style }) => {
    return (
        <GradientBackground style={styles.gradient}>
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
                <View style={[styles.container, style]}>
                    {children}
                </View>
            </SafeAreaView>
        </GradientBackground>
    );
};

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    container: {
        flex: 1,
        padding: theme.spacing.m,
    },
});
