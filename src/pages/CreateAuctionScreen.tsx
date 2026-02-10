import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, Alert, TouchableOpacity, KeyboardAvoidingView, Platform, } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

import { Screen } from '../components/Screen';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { auctionApi } from '../api/auction';
import t from '../i18n';
import { theme } from '../utils/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

type CreateAuctionScreenProps = NativeStackScreenProps<RootStackParamList, 'CreateAuction'>;

export const CreateAuctionScreen: React.FC<CreateAuctionScreenProps> = ({ navigation }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startingPrice, setStartingPrice] = useState('');
    const [endDate, setEndDate] = useState(new Date(Date.now() + 86400000)); // Default to tomorrow
    const [showPicker, setShowPicker] = useState(false);
    const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!title || !description || !startingPrice) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        const price = parseFloat(startingPrice);
        if (isNaN(price) || price <= 0) {
            Alert.alert('Error', 'Starting price must be a positive number');
            return;
        }

        if (endDate < new Date()) {
            Alert.alert('Error', 'Auction must end in the future');
            return;
        }

        setLoading(true);
        try {
            await auctionApi.createAuction({
                title,
                description,
                startingPrice: price,
                endsAt: endDate.toISOString()
            });
            Alert.alert('Success', 'Auction created successfully!', [
                { text: 'OK', onPress: () => navigation.navigate('AuctionList') }
            ]);
        } catch (error: any) {
            const msg = error.data?.message || t.common.error;
            Alert.alert('Error', msg);
        } finally {
            setLoading(false);
        }
    };

    const onPickerChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowPicker(false);
        }

        if (selectedDate) {
            setEndDate(selectedDate);
        }
    };

    const togglePicker = (mode: 'date' | 'time') => {
        if (showPicker && pickerMode === mode) {
            setShowPicker(false);
        } else {
            setPickerMode(mode);
            setShowPicker(true);
        }
    };

    const formatEndDate = () => {
        return endDate.toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <View style={styles.screen}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Text style={styles.backText}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Launch Auction</Text>
                    <View style={styles.headerPlaceholder} />
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        <View style={styles.introSection}>
                            <Text style={styles.introTitle}>List your item</Text>
                            <Text style={styles.introSubtitle}>Reach thousands of active bidders instantly.</Text>
                        </View>

                        <View style={styles.form}>
                            <Input
                                label="Item Title"
                                placeholder="e.g. Vintage Rolex Submariner"
                                value={title}
                                onChangeText={setTitle}
                            />

                            <Input
                                label="Detailed Description"
                                placeholder="What makes this item special?"
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                                style={styles.textArea}
                            />

                            <View style={styles.row}>
                                <View style={{ flex: 1 }}>
                                    <Input
                                        label="Starting Price ($)"
                                        placeholder="5000"
                                        value={startingPrice}
                                        onChangeText={setStartingPrice}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>

                            <View style={[styles.datePickerSection, { marginTop: theme.spacing.m }]}>
                                <Text style={styles.fieldLabel}>Auction End Date</Text>
                                <TouchableOpacity
                                    style={styles.pickerSelector}
                                    onPress={() => togglePicker('date')}
                                >
                                    <View style={styles.selectorContent}>
                                        <Text style={styles.pickerValue}>
                                            {endDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                        </Text>
                                        <Text style={styles.icon}>
                                            {showPicker && pickerMode === 'date' ? '✅' : '📅'}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                                {showPicker && pickerMode === 'date' && (
                                    <View style={Platform.OS === 'ios' ? styles.iosPickerContainer : styles.androidPickerSpacer}>
                                        <DateTimePicker
                                            value={endDate}
                                            mode="date"
                                            is24Hour={true}
                                            onChange={onPickerChange}
                                            minimumDate={new Date()}
                                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        />
                                    </View>
                                )}
                            </View>

                            <View style={[styles.datePickerSection, { marginTop: theme.spacing.m }]}>
                                <Text style={styles.fieldLabel}>Auction End Time</Text>
                                <TouchableOpacity
                                    style={styles.pickerSelector}
                                    onPress={() => togglePicker('time')}
                                >
                                    <View style={styles.selectorContent}>
                                        <Text style={styles.pickerValue}>
                                            {endDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                        <Text style={styles.icon}>
                                            {showPicker && pickerMode === 'time' ? '✅' : '🕒'}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                                {showPicker && pickerMode === 'time' && (
                                    <View style={Platform.OS === 'ios' ? styles.iosPickerContainer : styles.androidPickerSpacer}>
                                        <DateTimePicker
                                            value={endDate}
                                            mode="time"
                                            is24Hour={true}
                                            onChange={onPickerChange}
                                            minimumDate={new Date()}
                                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        />
                                    </View>
                                )}
                            </View>

                            <Text style={styles.hint}>Auction Ends: {formatEndDate()}</Text>

                            <Button
                                title="Create Listing"
                                onPress={handleCreate}
                                loading={loading}
                                style={styles.submitButton}
                            />
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
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
    headerPlaceholder: {
        width: 44,
    },
    scrollContent: {
        paddingHorizontal: theme.spacing.xl,
        paddingBottom: theme.spacing.xxl,
    },
    introSection: {
        marginTop: theme.spacing.xl,
        marginBottom: theme.spacing.xxl,
    },
    introTitle: {
        ...theme.typography.h1,
        color: theme.colors.text,
        fontSize: 32,
        marginBottom: 4,
    },
    introSubtitle: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
    },
    form: {
        width: '100%',
    },
    textArea: {
        height: 120,
        paddingTop: theme.spacing.m,
    },
    row: {
        flexDirection: 'row',
    },
    hint: {
        ...theme.typography.caption,
        color: theme.colors.textTertiary,
        marginTop: 4,
        marginBottom: theme.spacing.xl,
        fontSize: 10,
    },
    submitButton: {
        marginTop: theme.spacing.m,
    },
    datePickerSection: {
        marginBottom: theme.spacing.s,
    },
    fieldLabel: {
        ...theme.typography.label,
        color: theme.colors.textTertiary,
        marginBottom: theme.spacing.s,
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    pickerSelector: {
        backgroundColor: theme.colors.surface2,
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
        minHeight: 50,
        justifyContent: 'center',
    },
    selectorContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pickerValue: {
        ...theme.typography.body,
        color: theme.colors.text,
    },
    icon: {
        fontSize: 18,
    },
    iosPickerContainer: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.l,
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: 'hidden',
        marginTop: theme.spacing.m,
    },
    androidPickerSpacer: {
        marginTop: theme.spacing.s,
    },
});
