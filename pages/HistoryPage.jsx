// pages/HistoryPage.jsx - Geçmiş & Analiz Sayfası (AsyncStorage versiyon)
import React, { useState, useEffect } from 'react';
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
import HistoryList from '../components/HistoryList';
import asyncStorageManager from '../utils/AsyncStorage'; // ✅ Güncel storage

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

const HistoryPage = () => {
  const {
    historyRefreshTrigger,
    setActiveTab,
  } = useAppContext();

  const [historyCount, setHistoryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // History sayısını kontrol et
  useEffect(() => {
    loadHistoryCount();
  }, [historyRefreshTrigger]);

  const loadHistoryCount = async () => {
    try {
      setIsLoading(true);
      const stored = await asyncStorageManager.getItem('cargoCalcHistory'); // ✅
      const history = stored ? JSON.parse(stored) : [];
      setHistoryCount(history.length);
    } catch (error) {
      console.error('History count loading error:', error);
      setHistoryCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Navigation functions
  const handlePrevious = () => {
    setActiveTab(1);
  };

  const handleNewCalculation = () => {
    setActiveTab(0);
  };

  // History temizleme
  const handleClearAll = () => {
    Alert.alert(
      'Tüm Geçmişi Temizle',
      'Tüm hesaplama geçmişini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Temizle',
          style: 'destructive',
          onPress: async () => {
            try {
              await asyncStorageManager.removeItem('cargoCalcHistory'); // ✅
              setHistoryCount(0);
              Alert.alert('Başarılı!', 'Tüm geçmiş temizlendi.');
            } catch (error) {
              Alert.alert('Hata!', 'Geçmiş temizlenirken bir hata oluştu.');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingState}>
          <Text style={styles.loadingIcon}>⏳</Text>
          <Text style={styles.loadingText}>Geçmiş yükleniyor...</Text>
        </View>
      </View>
    );
  }

  if (historyCount === 0) {
    // Geçmiş yoksa bilgilendirme ekranı
    return (
      <View style={styles.container}>
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContentEmpty}
          showsVerticalScrollIndicator={false}
        >
          {/* Empty State */}
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>Henüz Kayıt Yok</Text>
            <Text style={styles.emptyDescription}>
              Henüz hiç hesaplama kaydı bulunmuyor. İlk hesaplamanızı yapın ve kaydedin.
            </Text>
            
            <TouchableOpacity 
              style={styles.newCalculationButton}
              onPress={handleNewCalculation}
              activeOpacity={0.8}
            >
              <Text style={styles.newCalculationButtonText}>📝 Yeni Hesaplama Yap</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Guide */}
          <View style={styles.guideContainer}>
            <Text style={styles.guideTitle}>💡 Nasıl Çalışır?</Text>
            <View style={styles.guideSteps}>
              <View style={styles.guideStep}>
                <Text style={styles.stepNumber}>1</Text>
                <Text style={styles.stepText}>Hakediş tutarınızı girin</Text>
              </View>
              <View style={styles.guideStep}>
                <Text style={styles.stepNumber}>2</Text>
                <Text style={styles.stepText}>Masraflarınızı ekleyin</Text>
              </View>
              <View style={styles.guideStep}>
                <Text style={styles.stepNumber}>3</Text>
                <Text style={styles.stepText}>Hesaplama sonuçlarını görün</Text>
              </View>
              <View style={styles.guideStep}>
                <Text style={styles.stepNumber}>4</Text>
                <Text style={styles.stepText}>"Kaydet" ile geçmişe ekleyin</Text>
              </View>
            </View>
          </View>
        </ScrollView>
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
          <Text style={styles.pageTitle}>📋 Hesaplama Geçmişi</Text>
          <Text style={styles.pageDescription}>
            Kayıtlı hesaplamalarınız ve analiz sonuçları
          </Text>
        </View>

        {/* Stats Summary */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{historyCount}</Text>
            <Text style={styles.statLabel}>Toplam Kayıt</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>📊</Text>
            <Text style={styles.statLabel}>Analiz Hazır</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleNewCalculation}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>+ Yeni Hesaplama</Text>
          </TouchableOpacity>

          {historyCount > 0 && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.actionButtonDanger]}
              onPress={handleClearAll}
              activeOpacity={0.8}
            >
              <Text style={[styles.actionButtonText, styles.actionButtonTextDanger]}>
                🗑️ Tümünü Temizle
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Ana HistoryList Component */}
        <HistoryList refreshTrigger={historyRefreshTrigger} />

        {/* Navigation Buttons */}
        <View style={styles.navigationButtons}>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={handlePrevious}
            activeOpacity={0.8}
          >
            <Text style={styles.navButtonText}>← Hesaplama</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.navButton}
            onPress={handleNewCalculation}
            activeOpacity={0.8}
          >
            <Text style={styles.navButtonText}>Yeni Hesap →</Text>
          </TouchableOpacity>
        </View>

        {/* Future Features Teaser */}
        <View style={styles.futureFeatures}>
          <Text style={styles.futureTitle}>🚀 Yakında Gelecek Özellikler</Text>
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>📈 Aylık trend analizi</Text>
            <Text style={styles.featureItem}>💰 Kar marjı karşılaştırması</Text>
            <Text style={styles.featureItem}>📑 PDF rapor oluşturma</Text>
            <Text style={styles.featureItem}>☁️ Bulut yedekleme</Text>
          </View>
        </View>

        {/* Spacer */}
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
  scrollContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },

  // Loading State
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },

  // Empty State
  emptyState: {
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
  newCalculationButton: {
    backgroundColor: '#059669',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  newCalculationButtonText: {
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

  // Stats
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },

  // Actions
  actionsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonDanger: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtonTextDanger: {
    color: '#ffffff',
  },

  // Navigation
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
  },
  navButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },

  // Guide
  guideContainer: {
    backgroundColor: '#ffffff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  guideTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 16,
    textAlign: 'center',
  },
  guideSteps: {
    gap: 16,
  },
  guideStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumber: {
    width: 32,
    height: 32,
    backgroundColor: '#3B82F6',
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 32,
    borderRadius: 16,
    marginRight: 16,
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },

  // Future Features
  futureFeatures: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  futureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 12,
    textAlign: 'center',
  },
  featureList: {
    gap: 8,
  },
  featureItem: {
    fontSize: 14,
    color: '#1E40AF',
    paddingLeft: 8,
  },

  // Spacer
  spacer: {
    height: 20,
  },
});

export default HistoryPage;