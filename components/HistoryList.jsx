// HistoryList.jsx - React Native Version with Shared Mock Storage
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import MockStorage from '../utils/MockStorage';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

const HistoryList = ({ refreshTrigger }) => {
  const [history, setHistory] = useState([]);
  const [expandedItems, setExpandedItems] = useState({});

  useEffect(() => {
    console.log('HistoryList component loaded');
    loadHistory();
  }, [refreshTrigger]);

  const loadHistory = async () => {
    try {
      console.log('HistoryList loadHistory çağrıldı, refreshTrigger:', refreshTrigger);
      const stored = await MockStorage.getItem('cargoCalcHistory');
      console.log('MockStorage\'dan okunan ham data:', stored);
      const parsedData = stored ? JSON.parse(stored) : [];
      console.log('Parse edilmiş data:', parsedData);
      console.log('Array length:', parsedData.length);
      setHistory([...parsedData].reverse());
    } catch (error) {
      console.error('MockStorage okuma hatası:', error);
      setHistory([]);
    }
  };

  const deleteHistoryItem = async (indexToDelete) => {
    Alert.alert(
      'Hesaplamayı Sil',
      'Bu hesaplamayı silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            const updated = history.filter((_, i) => i !== indexToDelete);
            setHistory(updated);
            try {
              await MockStorage.setItem('cargoCalcHistory', JSON.stringify([...updated].reverse()));
            } catch (error) {
              console.error('MockStorage yazma hatası:', error);
            }
          },
        },
      ]
    );
  };

  const clearAllHistory = () => {
    Alert.alert(
      'Tüm Geçmişi Temizle',
      'Tüm geçmişi silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Temizle',
          style: 'destructive',
          onPress: async () => {
            setHistory([]);
            try {
              await MockStorage.removeItem('cargoCalcHistory');
            } catch (error) {
              console.error('MockStorage temizleme hatası:', error);
            }
          },
        },
      ]
    );
  };

  const toggleExpand = (index) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const format = (n) => {
    if (!n || isNaN(n)) return '0';
    return n.toLocaleString('tr-TR', { maximumFractionDigits: 2 });
  };

  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleString('tr-TR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Tarih bilinmiyor';
    }
  };

  const formatShortDate = (iso) => {
    try {
      const date = new Date(iso);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) return 'Bugün';
      if (diffDays === 2) return 'Dün';
      if (diffDays <= 7) return `${diffDays} gün önce`;

      return date.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
      });
    } catch (error) {
      return 'Tarih bilinmiyor';
    }
  };

  console.log('History length:', history.length);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Geçmiş Hesaplamalar</Text>

      {history.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyText}>Henüz kayıtlı hesaplama yok</Text>
          <Text style={styles.emptySubtext}>Bir hesaplama yapıp kaydedin</Text>
        </View>
      ) : (
        <ScrollView style={styles.historyList} showsVerticalScrollIndicator={false}>
          {history.map((item, i) => (
            <View key={i} style={styles.historyItem}>
              {/* Başlık ve Silme Butonu */}
              <View style={styles.headerRow}>
                <View style={styles.dateContainer}>
                  <Text style={styles.shortDate}>{formatShortDate(item.date)}</Text>
                  <Text style={styles.fullDate}>{formatDate(item.date)}</Text>
                </View>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteHistoryItem(i)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.deleteButtonText}>Sil</Text>
                </TouchableOpacity>
              </View>

              {/* Net Kazanç - Ana Vurgu */}
              <View style={styles.netIncomeContainer}>
                <View style={styles.netIncomeRow}>
                  <Text style={styles.netIncomeLabel}>Net Kazanç:</Text>
                  <Text style={styles.netIncomeValue}>
                    {format(item.netKazanc)} ₺
                  </Text>
                </View>
              </View>

              {/* Ana Bilgiler - Grid */}
              <View style={styles.infoGrid}>
                <View style={[styles.infoCard, styles.incomeCard]}>
                  <Text style={styles.infoCardLabel}>Hakediş:</Text>
                  <Text style={styles.infoCardValue}>{format(item.income)} ₺</Text>
                </View>

                <View style={[styles.infoCard, styles.expenseCard]}>
                  <Text style={styles.infoCardLabel}>Masraflar:</Text>
                  <Text style={styles.infoCardValue}>{format(item.totalExpenses)} ₺</Text>
                </View>

                <View style={[styles.infoCard, styles.kdvCard]}>
                  <Text style={styles.infoCardLabel}>Ödenecek KDV:</Text>
                  <Text style={styles.infoCardValue}>{format(item.odenecekKdv)} ₺</Text>
                </View>

                <View style={[styles.infoCard, styles.taxCard]}>
                  <Text style={styles.infoCardLabel}>Gelir Vergisi:</Text>
                  <Text style={styles.infoCardValue}>{format(item.gelirVergisi)} ₺</Text>
                </View>
              </View>

              {/* Toplam Vergi */}
              <View style={styles.totalTaxContainer}>
                <View style={styles.totalTaxRow}>
                  <Text style={styles.totalTaxLabel}>Toplam Vergi:</Text>
                  <Text style={styles.totalTaxValue}>
                    {format(item.odenecekKdv + item.gelirVergisi)} ₺
                  </Text>
                </View>
              </View>

              {/* Masraf Detayları */}
              {item.expenses && item.expenses.length > 0 && (
                <View style={styles.expenseDetailsContainer}>
                  <TouchableOpacity
                    style={styles.expenseDetailsHeader}
                    onPress={() => toggleExpand(i)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.expenseDetailsTitle}>Masraf Detayları</Text>
                    <View style={styles.expenseCount}>
                      <Text style={styles.expenseCountText}>
                        {item.expenses.length} kalem
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {expandedItems[i] && (
                    <View style={styles.expenseDetailsContent}>
                      {item.expenses.map((expense, idx) => (
                        <View key={idx} style={styles.expenseDetailItem}>
                          <View style={styles.expenseDetailLeft}>
                            <Text style={styles.expenseDetailName}>
                              {expense.name}
                            </Text>
                            {expense.kdvRate > 0 && (
                              <Text style={styles.expenseDetailKdv}>
                                (KDV: %{expense.kdvRate})
                              </Text>
                            )}
                          </View>
                          <Text style={styles.expenseDetailAmount}>
                            {format(expense.amount)} ₺
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* Performans Göstergesi */}
              <View style={styles.performanceContainer}>
                <Text style={styles.performanceLabel}>Kar Marjı:</Text>
                <Text style={styles.performanceValue}>
                  {item.income > 0
                    ? `${((item.netKazanc / item.income) * 100).toFixed(1)}%`
                    : '0%'}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Temizle Butonu */}
      {history.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.clearAllButton}
            onPress={clearAllHistory}
            activeOpacity={0.8}
          >
            <Text style={styles.clearAllButtonText}>Tüm Geçmişi Temizle</Text>
          </TouchableOpacity>

          <Text style={styles.statsText}>
            Toplam {history.length} hesaplama kaydı.
          </Text>
        </View>
      )}

      {/* İpucu */}
      <View style={styles.tipContainer}>
        <Text style={styles.tipTitle}>💡 İpucu:</Text>
        <Text style={styles.tipText}>
          Masraf detaylarını görmek için "Masraf Detayları" bölümüne dokunun.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 16,
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  
  // History List
  historyList: {
    maxHeight: 600,
  },
  historyItem: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  
  // Header Row
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  dateContainer: {
    flex: 1,
  },
  shortDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  fullDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  deleteButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Net Income
  netIncomeContainer: {
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  netIncomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  netIncomeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065F46',
  },
  netIncomeValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#065F46',
  },
  
  // Info Grid
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 16,
  },
  infoCard: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  incomeCard: {
    backgroundColor: '#DBEAFE',
    borderRadius: 8,
    padding: 12,
  },
  expenseCard: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 12,
  },
  kdvCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
  },
  taxCard: {
    backgroundColor: '#E9D5FF',
    borderRadius: 8,
    padding: 12,
  },
  infoCardLabel: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 4,
  },
  infoCardValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  
  // Total Tax
  totalTaxContainer: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  totalTaxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalTaxLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  totalTaxValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  
  // Expense Details
  expenseDetailsContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  expenseDetailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
  },
  expenseDetailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  expenseCount: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  expenseCountText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  expenseDetailsContent: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    padding: 12,
  },
  expenseDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 6,
  },
  expenseDetailLeft: {
    flex: 1,
    marginRight: 12,
  },
  expenseDetailName: {
    fontSize: 14,
    color: '#374151',
  },
  expenseDetailKdv: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  expenseDetailAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  
  // Performance
  performanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
  },
  performanceLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  performanceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  
  // Footer
  footer: {
    marginTop: 16,
  },
  clearAllButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  clearAllButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  statsText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#6B7280',
  },
  
  // Tip
  tipContainer: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});

export default HistoryList;