// components/HistoryList.jsx - AsyncStorage versiyon
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
import asyncStorageManager from '../utils/AsyncStorage'; // ✅ Güncel storage

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

const HistoryList = ({ refreshTrigger }) => {
  const [history, setHistory] = useState([]);
  const [expandedItems, setExpandedItems] = useState({});

  useEffect(() => {
    loadHistory();
  }, [refreshTrigger]);

  const loadHistory = async () => {
    try {
      const stored = await asyncStorageManager.getItem('cargoCalcHistory');
      const parsedData = stored ? JSON.parse(stored) : [];
      setHistory([...parsedData].reverse());
    } catch (error) {
      console.error('AsyncStorage read error:', error);
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
              await asyncStorageManager.setItem(
                'cargoCalcHistory',
                JSON.stringify([...updated].reverse())
              );
            } catch (error) {
              console.error('AsyncStorage write error:', error);
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
              await asyncStorageManager.removeItem('cargoCalcHistory');
            } catch (error) {
              console.error('AsyncStorage clear error:', error);
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
              {/* Tarih ve Sil butonu */}
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

              {/* Net Kazanç */}
              <View style={styles.netIncomeContainer}>
                <View style={styles.netIncomeRow}>
                  <Text style={styles.netIncomeLabel}>Net Kazanç:</Text>
                  <Text style={styles.netIncomeValue}>
                    {format(item.netKazanc)} ₺
                  </Text>
                </View>
              </View>

              {/* Hakediş, Masraf, KDV, Vergi Kartları */}
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

              {/* Kar Marjı */}
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

      {/* Tümünü Temizle Butonu */}
      {history.length > 0 && (
        <View style={styles.footer}>
          <Text style={styles.statsText}>
            Toplam {history.length} hesaplama kaydı.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Sadece storage tarafı değişti, stiller orijinal haliyle bırakıldı.
  container: { padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  emptyState: { alignItems: 'center', padding: 32 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: '600' },
  emptySubtext: { fontSize: 14, color: '#6B7280' },
  historyList: { maxHeight: 600 },
  historyItem: { marginBottom: 16, borderWidth: 1, borderRadius: 8, padding: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  deleteButton: { padding: 8, backgroundColor: '#f87171', borderRadius: 8 },
  deleteButtonText: { color: '#fff' },
  shortDate: { fontWeight: 'bold' },
  fullDate: { color: '#6B7280', fontSize: 12 },
  netIncomeContainer: { backgroundColor: '#d1fae5', padding: 8, marginBottom: 12, borderRadius: 8 },
  netIncomeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  netIncomeLabel: { fontWeight: '600', },
  netIncomeValue: { fontWeight: 'bold' },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  infoCard: { width: '48%', padding: 8, borderRadius: 8 },
  incomeCard: { backgroundColor: '#e0f2fe' },
  expenseCard: { backgroundColor: '#fee2e2' },
  kdvCard: { backgroundColor: '#fef9c3' },
  taxCard: { backgroundColor: '#ede9fe' },
  infoCardLabel: { fontSize: 12 },
  infoCardValue: { fontWeight: 'bold' },
  totalTaxContainer: { padding: 8, backgroundColor: '#dc2626', borderRadius: 8 },
  totalTaxRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalTaxLabel: { fontWeight: '600', color: '#fff' },
  totalTaxValue: { color: '#fff', fontWeight: '600' },
  performanceContainer: { padding: 8, backgroundColor: '#f3f4f6', borderRadius: 8 },
  performanceLabel: { fontSize: 14, borderRadius: 8, fontWeight: '600' },
  performanceValue: { fontSize: 14, fontWeight: '600' },
  footer: { marginTop: 16, alignItems: 'center' },
  clearAllButton: { backgroundColor: '#dc2626', padding: 12, borderRadius: 8 },
  clearAllButtonText: { color: '#fff', fontWeight: 'bold' },
  statsText: { marginTop: 8, color: '#6B7280' }
});

export default HistoryList;