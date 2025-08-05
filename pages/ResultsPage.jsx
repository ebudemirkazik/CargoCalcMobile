// pages/ResultsPage.jsx - Hesaplama & Sonuçlar Sayfası
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { useAppContext } from '../App';
import Summary from '../components/Summary';
import ExpenseDonutChart from '../components/ExpenseDonutChart';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

const ResultsPage = () => {
  const {
    income,
    expenses,
    fixedExpenses,
    refreshHistory,
    setActiveTab,
  } = useAppContext();

  // Sayfa tamamlanma durumu
  const hasIncome = income > 0;
  const hasData = hasIncome; // En azından hakediş olmalı

  // Navigation functions
  const handlePrevious = () => {
    setActiveTab(0); // Veri Girişi sayfasına dön
  };

  const handleNext = () => {
    setActiveTab(2); // Geçmiş sayfasına git
  };

  // Kaydet success callback
  const handleSaveSuccess = () => {
    // Summary component'den gelen başarı callback'i
    refreshHistory();
    
    // Kullanıcıya feedback
    setTimeout(() => {
      Alert.alert(
        'İşlem Tamamlandı! 🎉',
        'Hesaplama kaydedildi. Geçmiş sayfasından görüntüleyebilirsiniz.',
        [
          { text: 'Kapat', style: 'cancel' },
          { text: 'Geçmişi Gör', onPress: () => setActiveTab(2) }
        ]
      );
    }, 500);
  };

  if (!hasData) {
    // Veri yoksa bilgilendirme ekranı
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyTitle}>Hesaplama Yapılamıyor</Text>
          <Text style={styles.emptyDescription}>
            Hesaplama yapabilmek için önce hakediş tutarınızı girmeniz gerekiyor.
          </Text>
          
          <TouchableOpacity 
            style={styles.goBackButton}
            onPress={handlePrevious}
            activeOpacity={0.8}
          >
            <Text style={styles.goBackButtonText}>📝 Veri Girişine Dön</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Sayfa Başlığı */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>📊 Hesaplama Sonuçları</Text>
          <Text style={styles.pageDescription}>
            Vergi hesaplamalarınız ve finansal analiziniz
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Hakediş</Text>
            <Text style={styles.statValue}>{income.toLocaleString('tr-TR')} ₺</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Masraflar</Text>
            <Text style={styles.statValue}>{expenses.length + fixedExpenses.length}</Text>
          </View>
        </View>

        {/* Ana Summary Component */}
        <Summary 
          income={income}
          expenses={expenses}
          fixedExpenses={fixedExpenses}
          onHistorySaved={handleSaveSuccess}
        />

        {/* Masraf Dağılım Grafiği */}
        {(expenses.length > 0 || fixedExpenses.length > 0) && (
          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>📈 Masraf Dağılımı</Text>
            <ExpenseDonutChart expenses={expenses} />
          </View>
        )}

        {/* Navigation Buttons */}
        <View style={styles.navigationButtons}>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={handlePrevious}
            activeOpacity={0.8}
          >
            <Text style={styles.navButtonText}>← Önceki</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.navButton}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.navButtonText}>Geçmiş →</Text>
          </TouchableOpacity>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>💡</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Hesaplama Tamamlandı!</Text>
            <Text style={styles.infoText}>
              • Vergi hesaplamalarınız güncel mevzuata göre yapılmıştır{'\n'}
              • "Hesaplamayı Kaydet" ile geçmişe kaydedebilirsiniz{'\n'}
              • Geçmiş sayfasından tüm kayıtlarınızı görüntüleyebilirsiniz
            </Text>
          </View>
        </View>

        {/* Spacer for bottom navigation */}
        <View style={styles.spacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  goBackButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  goBackButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Page Header
  pageHeader: {
    padding: 20,
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  pageDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Quick Stats
  quickStats: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },

  // Chart Section
  chartSection: {
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    paddingHorizontal: 20,
    marginBottom: 16,
  },

  // Navigation Buttons
  navigationButtons: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginVertical: 16,
    gap: 12,
  },
  navButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  navButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },

  // Info Box
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#15803D',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#15803D',
    lineHeight: 20,
  },

  // Spacer
  spacer: {
    height: 20,
  },
});

export default ResultsPage;