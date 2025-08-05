// App.jsx - React Native Navigation Infrastructure
import React, { useState, createContext, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Image,
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

// Tab Sayfaları (şimdilik placeholder)
const DataInputPage = () => (
  <View style={styles.page}>
    <Text style={styles.pageTitle}>Hakediş Girişi</Text>
    <Text style={styles.pageDesc}>Hakediş, masraflar ve sabit giderler</Text>
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>IncomeInput + AddExpenseForm + ExpenseList + FixedExpenses</Text>
    </View>
  </View>
);

const ResultsPage = () => (
  <View style={styles.page}>
    <Text style={styles.pageTitle}>📊 Hesaplama & Sonuçlar</Text>
    <Text style={styles.pageDesc}>Vergi hesaplamaları ve görsel analiz</Text>
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>Summary + ExpenseDonutChart + Kaydet Butonu</Text>
    </View>
  </View>
);

const HistoryPage = () => (
  <View style={styles.page}>
    <Text style={styles.pageTitle}>📋 Geçmiş & Analiz</Text>
    <Text style={styles.pageDesc}>Kayıtlı hesaplamalar ve trendler</Text>
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>HistoryList + Trend Charts</Text>
    </View>
  </View>
);

// Ana App Component
export default function App() {
  // Global State
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [fixedExpenses, setFixedExpenses] = useState([]);
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);

  // Tab Navigation State - başlangıçta null (landing page)
  const [activeTab, setActiveTab] = useState(null);

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

  // Global State Functions
  const handleAddExpense = (newExpense) => {
    const expenseWithId = {
      ...newExpense,
      id: Date.now(),
    };
    setExpenses(prev => [...prev, expenseWithId]);
  };

  const handleDeleteExpense = (id) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  };

  const handleFixedExpensesChange = (monthlyFixedExpenses) => {
    setFixedExpenses(monthlyFixedExpenses);
  };

  const handleAddToManualExpenses = (fixedExpense) => {
    setExpenses(prev => [...prev, fixedExpense]);
  };

  const refreshHistory = () => {
    setHistoryRefreshTrigger(prev => prev + 1);
  };

  // Context Value
  const contextValue = {
    // State
    income,
    expenses,
    fixedExpenses,
    historyRefreshTrigger,

    // Actions
    setIncome,
    handleAddExpense,
    handleDeleteExpense,
    handleFixedExpensesChange,
    handleAddToManualExpenses,
    refreshHistory,

    // Navigation
    setActiveTab,
  };

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
          onPress={() => setActiveTab(0)}
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

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require('./public/apple-touch-icon.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.titleContainer}>
            <Text style={styles.title}>CargoCalc</Text>
            <Text style={styles.subtitle}>
              {activeTab !== null ? tabs[activeTab].title : 'Nakliye Hesaplama Aracı'}
            </Text>
          </View>
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
                onPress={() => setActiveTab(tab.id)}
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
                    activeTab >= index && styles.progressDotActive
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

  // Header
  header: {
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
  logoImage: {
    width: 125,
    height: 125,
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1D4ED8',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },

  // Content
  content: {
    flex: 1,
  },

  // Pages (Placeholder)
  page: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  pageDesc: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  placeholder: {
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
    borderColor: '#BFDBFE',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 300,
  },
  placeholderText: {
    fontSize: 14,
    color: '#3B82F6',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Tab Bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: 8,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tabButtonActive: {
    // Active state handled by individual elements
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 4,
    opacity: 0.6,
  },
  tabIconActive: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  tabLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  tabLabelActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },

  // Progress Bar
  progressContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    alignItems: 'center',
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: '#3B82F6',
    transform: [{ scale: 1.2 }],
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