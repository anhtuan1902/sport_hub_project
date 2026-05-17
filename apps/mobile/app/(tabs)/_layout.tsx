// Tabs Layout - Main App Shell with Navigation
import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, StatusBar, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/src/constants';
import { useAuthStore } from '@/src/store';
import { AppHeader } from '@/src/components/AppHeader';
import type { TabType } from '@/src/components/TabType';
import { BottomNav } from '@/src/components/BottomNav';
import {
    HomeScreen,
    MatchScreen,
    ScanScreen,
    SocialScreen,
    ProfileScreen,
    ChatScreen,
} from '@/src/components/tabs';
import { scale, spacing } from '@/src/utils';

export default function TabsLayout() {
    const router = useRouter();
    const { logout, isAuthenticated, isInitialized } = useAuthStore();
    const [activeTab, setActiveTab] = useState<TabType>('home');
    const [isNearBottom, setIsNearBottom] = useState(false);

    useEffect(() => {
        if (isInitialized && !isAuthenticated) {
            router.replace('/(auth)/login');
        }
    }, [isAuthenticated, isInitialized, router]);

    const handleLogout = useCallback(() => {
        logout();
        router.replace('/(auth)/login');
    }, [logout, router]);

    const handleTabChange = useCallback((tab: TabType) => {
        setActiveTab(tab);
        setIsNearBottom(false);
    }, []);

    const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
        const scrollBottom = contentSize.height - layoutMeasurement.height;
        const isBottom = scrollBottom > 0 && contentOffset.y >= scrollBottom - 100;
        setIsNearBottom(isBottom);
    }, []);

    const renderScreen = () => {
        switch (activeTab) {
            case 'home':
                return <HomeScreen onScroll={handleScroll} />;
            case 'match':
                return <MatchScreen onScroll={handleScroll} />;
            case 'scan':
                return <ScanScreen onScroll={handleScroll} />;
            case 'social':
                return <SocialScreen onScroll={handleScroll} />;
            case 'profile':
                return <ProfileScreen onScroll={handleScroll} />;
            case 'chat':
                return <ChatScreen onScroll={handleScroll} />;
            default:
                return <HomeScreen onScroll={handleScroll} />;
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <AppHeader activeTab={activeTab} onLogout={handleLogout} />
            <View style={styles.content}>{renderScreen()}</View>
            <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.brand.navy,
    },

    content: {
        flex: 1,
    },
});
