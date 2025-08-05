// App.jsx - Enhanced with Loading States & Error Handling
import React, { useState, createContext, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

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

// Ana App Component
export default function App() {
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

  // Enhanced State Functions with Loading & Error Handling
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

  // Loading Screen
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
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
      </SafeAreaView>
    );
  }

  // Error Screen
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
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
      </SafeAreaView>
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
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

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

        {/* Bottom Tab Navigation - Sadece sayfalardayken göster */}
        {activeTab !== null && (
          <View style={styles.tabBar}>
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

        {/* Progress Indicator - Sadece sayfalardayken göster */}
        {activeTab !== null && (
          <View style={styles.progressContainer}>
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
      </SafeAreaView>
    </AppContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  // Loading Screen
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#ffffff',
  },
  loadingLogo: {
    width: 100,
    height: 100,
    marginBottom: 24,
  },
  loadingTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1D4ED8',
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 40,
  },
  loadingIndicatorContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#374151',
    marginTop: 16,
  },
  loadingSteps: {
    alignItems: 'flex-start',
  },
  loadingStep: {
    fontSize: 14,
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
    fontSize: 64,
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#EF4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
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
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Header - Dinamik Tasarım
  // Landing Page Header (Büyük)
  headerLanding: {
    backgroundColor: '#ffffff',
    padding: 20,
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
    width: 125,
    height: 125,
  },
  titleContainerLanding: {
    alignItems: 'center',
  },
  titleLarge: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1D4ED8',
    marginBottom: 4,
  },
  subtitleLarge: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },

  // Navigator Pages Header (Kompakt)
  headerCompact: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 12,
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
    width: 40,
    height: 40,
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  titleSmall: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1D4ED8',
    marginBottom: 2,
  },
  subtitleSmall: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },

  // Content
  content: {
    flex: 1,
  },

  // Tab Bar - Kompakt
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: 6,
    paddingTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  tabButtonActive: {
    // Active state handled by individual elements
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 2,
    opacity: 0.6,
  },
  tabIconActive: {
    opacity: 1,
    transform: [{ scale: 1.05 }],
  },
  tabLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  tabLabelActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },

  // Progress Bar - Kompakt
  progressContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 4,
    alignItems: 'center',
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
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
    padding: 20,
    backgroundColor: '#F8FAFC',
  },
  landingContent: {
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  landingTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1D4ED8',
    marginBottom: 16,
    textAlign: 'center',
  },
  landingDescription: {
    fontSize: 16,
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
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  featureText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  startButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});