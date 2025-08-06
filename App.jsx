// App.jsx - Safe Area Fixed for All Devices (Samsung A34 tested)
import React, { useState, createContext, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Global State Context
const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

// Tab Sayfaları - Real Components
import DataInputPage from './pages/DataInputPage';
import ResultsPage from './pages/ResultsPage';
import HistoryPage from './pages/HistoryPage';

// Safe Area aware Main Component
const AppContent = () => {
  const insets = useSafeAreaInsets();
  
  // Global State
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [fixedExpenses, setFixedExpenses] = useState([]);
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);

  // UI State
  const [activeTab, setActiveTab] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tab Configuration
  const tabs = [
    {
      id: 0,
      name: 'Gelir & Gider',
      icon: '📝',
      component: DataInputPage,
      title: 'Gelir & Gider'
    },
    {
      id: 1,
      name: 'Hesaplama',
      icon: '📊',
      component: ResultsPage,
      title: 'Sonuçlar'
    },
    {
      id: 2,
      name: 'Geçmiş',
      icon: '📋',
      component: HistoryPage,
      title: 'Geçmiş'
    }
  ];

  // App initialization
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Simulated app initialization
      await new Promise(resolve => setTimeout(resolve, 1500));

      // App ready
      setIsLoading(false);
    } catch (error) {
      console.error('App initialization error:', error);
      setError('Uygulama başlatılırken bir hata oluştu.');
      setIsLoading(false);
    }
  };

  // Enhanced State Functions
  const handleAddExpense = async (newExpense) => {
    try {
      const expenseWithId = {
        ...newExpense,
        id: Date.now(),
      };
      setExpenses(prev => [...prev, expenseWithId]);
      return { success: true };
    } catch (error) {
      console.error('Add expense error:', error);
      Alert.alert('Hata!', 'Masraf eklenirken bir hata oluştu.');
      return { success: false, error };
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      setExpenses(prev => prev.filter(expense => expense.id !== id));
      return { success: true };
    } catch (error) {
      console.error('Delete expense error:', error);
      Alert.alert('Hata!', 'Masraf silinirken bir hata oluştu.');
      return { success: false, error };
    }
  };

  const handleFixedExpensesChange = (monthlyFixedExpenses) => {
    try {
      setFixedExpenses(monthlyFixedExpenses);
    } catch (error) {
      console.error('Fixed expenses update error:', error);
      Alert.alert('Hata!', 'Sabit giderler güncellenirken bir hata oluştu.');
    }
  };

  const handleAddToManualExpenses = async (fixedExpense) => {
    try {
      setExpenses(prev => [...prev, fixedExpense]);
      return { success: true };
    } catch (error) {
      console.error('Add to manual expenses error:', error);
      Alert.alert('Hata!', 'Manuel masraflara eklenirken bir hata oluştu.');
      return { success: false, error };
    }
  };

  const refreshHistory = () => {
    try {
      setHistoryRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Refresh history error:', error);
    }
  };

  // Enhanced Navigation with Validation
  const handleTabChange = (tabId) => {
    try {
      // Validation logic
      if (tabId === 1 && income <= 0) {
        Alert.alert(
          'Eksik Bilgi',
          'Hesaplama yapmak için önce hakediş tutarını girmeniz gerekiyor.',
          [
            { text: 'Tamam', style: 'default' },
            { text: 'Veri Girişine Git', onPress: () => setActiveTab(0) }
          ]
        );
        return;
      }

      setActiveTab(tabId);
    } catch (error) {
      console.error('Tab change error:', error);
      Alert.alert('Hata!', 'Sayfa değiştirilirken bir hata oluştu.');
    }
  };

  // Error Recovery
  const handleRetry = () => {
    setError(null);
    initializeApp();
  };

  // Context Value
  const contextValue = {
    // State
    income,
    expenses,
    fixedExpenses,
    historyRefreshTrigger,
    isLoading,
    error,

    // Actions
    setIncome,
    handleAddExpense,
    handleDeleteExpense,
    handleFixedExpensesChange,
    handleAddToManualExpenses,
    refreshHistory,

    // Navigation
    setActiveTab: handleTabChange,

    // UI Actions
    setError,
  };

  // Safe area aware styles
  // NOT: tabBarWithSafeArea ve progressContainerWithSafeArea stilleri,
  // paddingBottom: Math.max(insets.bottom, 6) ve Math.max(insets.bottom + 8, 12)
  // ile evrensel safe area koruması sağlar. Tüm cihazlarda navigation bar çakışmalarını önler.
  const safeStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F8FAFC',
      paddingTop: insets.top,
    },
    tabBarWithSafeArea: {
      flexDirection: 'row',
      backgroundColor: '#ffffff',
      borderTopWidth: 1,
      borderTopColor: '#E5E7EB',
      paddingBottom: Math.max(insets.bottom, 6), // Safe area uyumlu
      paddingTop: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 5,
    },
    progressContainerWithSafeArea: {
      backgroundColor: '#ffffff',
      paddingVertical: 8,
      alignItems: 'center',
      paddingBottom: Math.max(insets.bottom + 8, 12), // Safe area uyumlu
    },
  });

  // Loading Screen
  if (isLoading) {
    return (
      <View style={safeStyles.container}>
        <StatusBar 
          barStyle="dark-content" 
          backgroundColor="#F8FAFC" 
          translucent={false}
        />
        <View style={styles.loadingContainer}>
          {/* Logo */}
          <Image
            source={require('./public/apple-touch-icon.png')}
            style={styles.loadingLogo}
            resizeMode="contain"
          />

          {/* App Name */}
          <Text style={styles.loadingTitle}>CargoCalc</Text>
          <Text style={styles.loadingSubtitle}>Nakliye Hesaplama Aracı</Text>

          {/* Loading Indicator */}
          <View style={styles.loadingIndicatorContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Uygulama başlatılıyor...</Text>
          </View>

          {/* Loading Steps */}
          <View style={styles.loadingSteps}>
            <Text style={styles.loadingStep}>✓ Componentler yükleniyor</Text>
            <Text style={styles.loadingStep}>✓ Veriler kontrol ediliyor</Text>
            <Text style={styles.loadingStep}>⏳ Hazırlanıyor...</Text>
          </View>
        </View>
      </View>
    );
  }

  // Error Screen
  if (error) {
    return (
      <View style={safeStyles.container}>
        <StatusBar 
          barStyle="dark-content" 
          backgroundColor="#F8FAFC" 
          translucent={false}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Bir Hata Oluştu</Text>
          <Text style={styles.errorMessage}>{error}</Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRetry}
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>🔄 Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Landing Page Component
  const LandingPage = () => (
    <View style={styles.landingPage}>
      <View style={styles.landingContent}>
        <Text style={styles.landingTitle}>Hoş Geldiniz!</Text>
        <Text style={styles.landingDescription}>
          CargoCalc ile nakliye işlerinizin hakediş ve vergi hesaplamalarını
          kolayca yapabilirsiniz.
        </Text>

        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>💰</Text>
            <Text style={styles.featureText}>KDV İndirimi Hesaplama</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📊</Text>
            <Text style={styles.featureText}>Gelir Vergisi Analizi</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>💾</Text>
            <Text style={styles.featureText}>Hesaplama Geçmişi</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.startButton}
          onPress={() => handleTabChange(0)}
          activeOpacity={0.8}
        >
          <Text style={styles.startButtonText}>Hesaplamaya Başla</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Aktif sayfa component'i
  const ActivePageComponent = activeTab !== null ? tabs[activeTab].component : LandingPage;

  return (
    <AppContext.Provider value={contextValue}>
      <View style={safeStyles.container}>
        <StatusBar 
          barStyle="dark-content" 
          backgroundColor="#F8FAFC" 
          translucent={false}
        />

        {/* Header - Dinamik Tasarım */}
        <View style={activeTab !== null ? styles.headerCompact : styles.headerLanding}>
          {activeTab !== null ? (
            // Kompakt Header - Navigator Sayfaları
            <View style={styles.headerContent}>
              <Image
                source={require('./public/apple-touch-icon.png')}
                style={styles.logoImageSmall}
                resizeMode="contain"
              />
              <View style={styles.titleContainer}>
                <Text style={styles.titleSmall}>CargoCalc</Text>
                <Text style={styles.subtitleSmall}>
                  {tabs[activeTab].title}
                </Text>
              </View>
            </View>
          ) : (
            // Büyük Header - Landing Page
            <>
              <View style={styles.logoContainer}>
                <Image
                  source={require('./public/apple-touch-icon.png')}
                  style={styles.logoImageLarge}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.titleContainerLanding}>
                <Text style={styles.titleLarge}>CargoCalc</Text>
                <Text style={styles.subtitleLarge}>
                  Nakliye Hesaplama Aracı
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Page Content */}
        <View style={styles.content}>
          <ActivePageComponent />
        </View>

        {/* Bottom Tab Navigation - Safe Area Aware */}
        {/* safeStyles.tabBarWithSafeArea ve progressContainerWithSafeArea
            navigation bar çakışmalarını önleyecek şekilde yapılandırılmıştır. */}
        {activeTab !== null && (
          <View style={safeStyles.tabBarWithSafeArea}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tabButton,
                  activeTab === tab.id && styles.tabButtonActive
                ]}
                onPress={() => handleTabChange(tab.id)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.tabIcon,
                  activeTab === tab.id && styles.tabIconActive
                ]}>
                  {tab.icon}
                </Text>
                <Text style={[
                  styles.tabLabel,
                  activeTab === tab.id && styles.tabLabelActive
                ]}>
                  {tab.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Progress Indicator - Safe Area Aware */}
        {activeTab !== null && (
          <View style={safeStyles.progressContainerWithSafeArea}>
            <View style={styles.progressBar}>
              {tabs.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.progressDot,
                    activeTab == index && styles.progressDotActive
                  ]}
                />
              ))}
            </View>
          </View>
        )}

        {/* Debug Info - Development only */}
        {__DEV__ && (
          <View style={[styles.debugInfo, { top: insets.top + 5 }]}>
            <Text style={styles.debugText}>
              📱 {Platform.OS} | 📏 {screenWidth}x{screenHeight} | 
              🔒 SafeArea: T:{insets.top} B:{insets.bottom} L:{insets.left} R:{insets.right}
            </Text>
          </View>
        )}
      </View>
    </AppContext.Provider>
  );
};

// Ana App Component - SafeAreaProvider ile sarmalı
// SafeAreaProvider ve SafeAreaView zaten doğru şekilde kullanılmakta.
export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }} edges={[]}>
        <AppContent />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  // Loading Screen
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#F8FAFC',
  },
  loadingLogo: {
    width: Math.min(screenWidth * 0.25, 100),
    height: Math.min(screenWidth * 0.25, 100),
    marginBottom: 24,
  },
  loadingTitle: {
    fontSize: Math.min(screenWidth * 0.08, 28),
    fontWeight: 'bold',
    color: '#1D4ED8',
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: Math.min(screenWidth * 0.045, 16),
    color: '#6B7280',
    marginBottom: 40,
    textAlign: 'center',
  },
  loadingIndicatorContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  loadingText: {
    fontSize: Math.min(screenWidth * 0.045, 16),
    color: '#374151',
    marginTop: 16,
    textAlign: 'center',
  },
  loadingSteps: {
    alignItems: 'flex-start',
  },
  loadingStep: {
    fontSize: Math.min(screenWidth * 0.04, 14),
    color: '#6B7280',
    marginBottom: 8,
  },

  // Error Screen
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorIcon: {
    fontSize: Math.min(screenWidth * 0.18, 64),
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: Math.min(screenWidth * 0.07, 24),
    fontWeight: 'bold',
    color: '#EF4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: Math.min(screenWidth * 0.045, 16),
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: screenWidth * 0.5,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: Math.min(screenWidth * 0.045, 16),
    fontWeight: 'bold',
  },

  // Header - Dinamik Tasarım
  headerLanding: {
    backgroundColor: '#ffffff',
    padding: Math.min(screenWidth * 0.05, 20),
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  logoImageLarge: {
    width: Math.min(screenWidth * 0.3, 125),
    height: Math.min(screenWidth * 0.3, 125),
  },
  titleContainerLanding: {
    alignItems: 'center',
  },
  titleLarge: {
    fontSize: Math.min(screenWidth * 0.07, 24),
    fontWeight: 'bold',
    color: '#1D4ED8',
    marginBottom: 4,
  },
  subtitleLarge: {
    fontSize: Math.min(screenWidth * 0.045, 16),
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },

  headerCompact: {
    backgroundColor: '#ffffff',
    paddingHorizontal: Math.min(screenWidth * 0.05, 20),
    paddingVertical: Math.min(screenWidth * 0.03, 12),
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImageSmall: {
    width: Math.min(screenWidth * 0.1, 40),
    height: Math.min(screenWidth * 0.1, 40),
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  titleSmall: {
    fontSize: Math.min(screenWidth * 0.055, 20),
    fontWeight: 'bold',
    color: '#1D4ED8',
    marginBottom: 2,
  },
  subtitleSmall: {
    fontSize: Math.min(screenWidth * 0.04, 14),
    color: '#6B7280',
    fontWeight: '500',
  },

  // Content
  content: {
    flex: 1,
  },

  // Tab Button
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    minHeight: 50,
    justifyContent: 'center',
  },
  tabButtonActive: {
    // Active state handled by individual elements
  },
  tabIcon: {
    fontSize: Math.min(screenWidth * 0.055, 20),
    marginBottom: 4,
    opacity: 0.6,
  },
  tabIconActive: {
    opacity: 1,
    transform: [{ scale: 1.05 }],
  },
  tabLabel: {
    fontSize: Math.min(screenWidth * 0.028, 10),
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  tabLabelActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },

  // Progress Bar
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: Math.min(screenWidth * 0.015, 6),
    height: Math.min(screenWidth * 0.015, 6),
    borderRadius: Math.min(screenWidth * 0.0075, 3),
    backgroundColor: '#D1D5DB',
    marginHorizontal: 3,
  },
  progressDotActive: {
    backgroundColor: '#3B82F6',
    transform: [{ scale: 1.15 }],
  },

  // Landing Page
  landingPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Math.min(screenWidth * 0.05, 20),
    backgroundColor: '#F8FAFC',
  },
  landingContent: {
    alignItems: 'center',
    maxWidth: Math.min(screenWidth * 0.9, 400),
    width: '100%',
  },
  landingTitle: {
    fontSize: Math.min(screenWidth * 0.09, 32),
    fontWeight: 'bold',
    color: '#1D4ED8',
    marginBottom: 16,
    textAlign: 'center',
  },
  landingDescription: {
    fontSize: Math.min(screenWidth * 0.045, 16),
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: Math.min(screenWidth * 0.04, 16),
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  featureIcon: {
    fontSize: Math.min(screenWidth * 0.065, 24),
    marginRight: 16,
  },
  featureText: {
    fontSize: Math.min(screenWidth * 0.045, 16),
    color: '#374151',
    fontWeight: '500',
  },
  startButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: Math.min(screenWidth * 0.04, 16),
    paddingHorizontal: Math.min(screenWidth * 0.08, 32),
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 50,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: Math.min(screenWidth * 0.05, 18),
    fontWeight: 'bold',
  },

  // Debug Info
  debugInfo: {
    position: 'absolute',
    left: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 8,
    borderRadius: 8,
    zIndex: 9999,
  },
  debugText: {
    color: '#ffffff',
    fontSize: 10,
    textAlign: 'center',
  },
});