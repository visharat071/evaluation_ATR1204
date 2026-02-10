export const theme = {
    colors: {
        // Core Palette (Slate & Indigo)
        primary: '#6366F1', // Indigo 500
        secondary: '#4F46E5', // Indigo 600
        accent: '#10B981', // Emerald 500

        // Backgrounds & Surfaces
        background: '#FAF9F6', // Off-white/Alabaster
        surface: '#FFFFFF',
        surface1: '#F8FAFC', // Slate 50
        surface2: '#F1F5F9', // Slate 100
        surface3: '#E2E8F0', // Slate 200

        // Text
        text: '#0F172A', // Slate 900
        textSecondary: '#64748B', // Slate 500
        textTertiary: '#94A3B8', // Slate 400

        // Functional
        error: '#EF4444', // Red 500
        success: '#10B981', // Emerald 500
        warning: '#F59E0B', // Amber 500
        border: '#E2E8F0', // Slate 200

        // Glassmorphism
        glass: 'rgba(255, 255, 255, 0.7)',
        glassBorder: 'rgba(255, 255, 255, 0.4)',

        // Gradients
        gradientStart: '#FAF9F6', // Alabaster
        gradientEnd: '#F1F5F9', // Slate 100
    },
    spacing: {
        none: 0,
        xxs: 2,
        xs: 4,
        s: 8,
        m: 16,
        l: 24,
        xl: 32,
        xxl: 48,
    },
    borderRadius: {
        none: 0,
        xs: 4,
        s: 8,
        m: 12,
        l: 16,
        xl: 24,
        xxl: 32,
        full: 9999,
    },
    typography: {
        h1: {
            fontSize: 34,
            fontWeight: '800' as '800',
            letterSpacing: -0.5,
            lineHeight: 40,
        },
        h2: {
            fontSize: 26,
            fontWeight: '700' as '700',
            letterSpacing: -0.3,
            lineHeight: 32,
        },
        h3: {
            fontSize: 20,
            fontWeight: '600' as '600',
            letterSpacing: -0.2,
            lineHeight: 28,
        },
        body: {
            fontSize: 16,
            fontWeight: '400' as '400',
            lineHeight: 24,
        },
        bodySemi: {
            fontSize: 16,
            fontWeight: '600' as '600',
            lineHeight: 24,
        },
        caption: {
            fontSize: 13,
            fontWeight: '500' as '500',
            lineHeight: 18,
            color: '#64748B',
        },
        label: {
            fontSize: 12,
            fontWeight: '700' as '700',
            letterSpacing: 0.5,
            textTransform: 'uppercase' as 'uppercase',
        },
    },
    shadows: {
        small: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
        },
        medium: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 5,
        },
        large: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.12,
            shadowRadius: 24,
            elevation: 10,
        },
    }
};
