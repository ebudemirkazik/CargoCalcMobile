// Summary.jsx - React Native Version with Shared Mock Storage
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import MockStorage from '../utils/MockStorage';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

const Summary = ({ income, expenses, fixedExpenses, onHistorySaved }) => {
  const [expandedSections, setExpandedSections] = useState({
    breakdown: false,
    taxes: false,
    netIncome: false,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Hesaplamalar - Null Check'lerle güvenli
  const totalExpenses = Array.isArray(expenses) ? expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0) : 0;
  const totalFixedExpenses = Array.isArray(fixedExpenses) ? fixedExpenses.reduce((sum, expense) => sum + (expense.monthlyAmount || 0), 0) : 0;
  const allExpenses = totalExpenses + totalFixedExpenses;

  console.log('Summary hesaplamaları:', {
    income,
    totalExpenses,
    totalFixedExpenses,
    allExpenses,
    expensesLength: expenses?.length || 0,
    fixedExpensesLength: fixedExpenses?.length || 0
  });

  // KDV Hesaplamaları - Null Check'lerle güvenli
  const expenseKdv = Array.isArray(expenses) ? expenses.reduce((sum, expense) => {
    const kdvAmount = ((expense.amount || 0) * (expense.kdvRate || 0)) / 100;
    return sum + kdvAmount;
  }, 0) : 0;

  const fixedExpenseKdv = Array.isArray(fixedExpenses) ? fixedExpenses.reduce((sum, expense) => {
    const kdvAmount = ((expense.monthlyAmount || 0) * (expense.kdvRate || 0)) / 100;
    return sum + kdvAmount;
  }, 0) : 0;

  const toplamIndirilecekKdv = expenseKdv + fixedExpenseKdv;

  // Gelir KDV'si (%20)
  const gelirKdvsi = income * 0.20;
  const odenecekKdv = Math.max(0, gelirKdvsi - toplamIndirilecekKdv);

  // Gelir Vergisi Hesaplama (KDV hariç gelir üzerinden)
  const kdvHaricGelir = income / 1.20;
  const kdvHaricGiderler = allExpenses / 1.20;
  const vergiyeTabiGelir = kdvHaricGelir - kdvHaricGiderler;

  let gelirVergisi = 0;
  if (vergiyeTabiGelir > 0) {
    if (vergiyeTabiGelir <= 110000) {
      gelirVergisi = vergiyeTabiGelir * 0.15;
    } else if (vergiyeTabiGelir <= 230000) {
      gelirVergisi = 110000 * 0.15 + (vergiyeTabiGelir - 110000) * 0.20;
    } else if (vergiyeTabiGelir <= 870000) {
      gelirVergisi = 110000 * 0.15 + 120000 * 0.20 + (vergiyeTabiGelir - 230000) * 0.27;
    } else if (vergiyeTabiGelir <= 3000000) {
      gelirVergisi = 110000 * 0.15 + 120000 * 0.20 + 640000 * 0.27 + (vergiyeTabiGelir - 870000) * 0.35;
    } else {
      gelirVergisi = 110000 * 0.15 + 120000 * 0.20 + 640000 * 0.27 + 2130000 * 0.35 + (vergiyeTabiGelir - 3000000) * 0.40;
    }
  }

  const toplamVergi = odenecekKdv + gelirVergisi;
  const netKazanc = income - allExpenses - toplamVergi;

  const format = (amount) => {
    return amount.toLocaleString('tr-TR', { maximumFractionDigits: 2 });
  };

  // AsyncStorage'a kaydetme fonksiyonu
  const saveToHistory = async () => {
    console.log('saveToHistory çağrıldı');
    console.log('onHistorySaved prop:', onHistorySaved);
    
    try {
      const historyData = {
        date: new Date().toISOString(),
        income: income,
        expenses: expenses,
        fixedExpenses: fixedExpenses,
        totalExpenses: allExpenses,
        odenecekKdv: odenecekKdv,
        gelirVergisi: gelirVergisi,
        toplamVergi: toplamVergi,
        netKazanc: netKazanc,
        vergiyeTabiGelir: vergiyeTabiGelir,
        kdvHaricGelir: kdvHaricGelir,
        timestamp: Date.now(),
      };

      console.log('Kaydedilecek data:', historyData);

      const existingData = await MockStorage.getItem('cargoCalcHistory');
      console.log('Mevcut data:', existingData);
      
      const history = existingData ? JSON.parse(existingData) : [];
      console.log('Parse edilmiş history:', history);
      
      history.push(historyData);
      console.log('Yeni history:', history);
      
      await MockStorage.setItem('cargoCalcHistory', JSON.stringify(history));
      console.log('MockStorage\'a yazıldı');
      
      Alert.alert(
        'Başarılı!',
        'Hesaplama geçmişe kaydedildi.',
        [{ text: 'Tamam' }]
      );
      
      // Parent component'e bildir
      if (onHistorySaved) {
        console.log('onHistorySaved çağrılıyor');
        onHistorySaved();
      } else {
        console.log('onHistorySaved prop bulunamadı!');
      }
      
      // Ekstra debug - MockStorage'daki veriyi kontrol et
      const checkData = await MockStorage.getItem('cargoCalcHistory');
      console.log('Kaydedilen son data:', checkData);
      
      // MockStorage tüm datayı göster
      MockStorage.getAllData();
    } catch (error) {
      console.error('Kaydetme hatası:', error);
      Alert.alert(
        'Hata!',
        'Hesaplama kaydedilemedi: ' + error.message,
        [{ text: 'Tamam' }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Finansal Özet & Vergi Hesaplama</Text>
      
      {/* Ana Özet Kartı */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Hakediş (KDV Dahil):</Text>
          <Text style={styles.summaryValue}>{format(income)} ₺</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Toplam Masraflar:</Text>
          <Text style={[styles.summaryValue, styles.negative]}>
            -{format(allExpenses)} ₺
          </Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Toplam Vergiler:</Text>
          <Text style={[styles.summaryValue, styles.negative]}>
            -{format(toplamVergi)} ₺
          </Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.summaryRow}>
          <Text style={styles.netLabel}>Net Kazanç:</Text>
          <Text style={[styles.netValue, netKazanc >= 0 ? styles.positive : styles.negative]}>
            {format(netKazanc)} ₺
          </Text>
        </View>
      </View>

      {/* Masraf Dağılımı */}
      <View style={styles.expandableCard}>
        <TouchableOpacity 
          style={styles.expandableHeader}
          onPress={() => toggleSection('breakdown')}
          activeOpacity={0.7}
        >
          <Text style={styles.expandableTitle}>💰 Masraf Dağılımı</Text>
          <Text style={styles.expandIcon}>
            {expandedSections.breakdown ? '▼' : '▶'}
          </Text>
        </TouchableOpacity>
        
        {expandedSections.breakdown && (
          <View style={styles.expandableContent}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Manuel Masraflar:</Text>
              <Text style={styles.detailValue}>{format(totalExpenses)} ₺</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Sabit Masraflar (Aylık):</Text>
              <Text style={styles.detailValue}>{format(totalFixedExpenses)} ₺</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>İndirilecek KDV:</Text>
              <Text style={styles.detailValue}>{format(toplamIndirilecekKdv)} ₺</Text>
            </View>
          </View>
        )}
      </View>

      {/* Vergi Detayları */}
      <View style={styles.expandableCard}>
        <TouchableOpacity 
          style={styles.expandableHeader}
          onPress={() => toggleSection('taxes')}
          activeOpacity={0.7}
        >
          <Text style={styles.expandableTitle}>🏦 Vergi Hesaplamaları</Text>
          <Text style={styles.expandIcon}>
            {expandedSections.taxes ? '▼' : '▶'}
          </Text>
        </TouchableOpacity>
        
        {expandedSections.taxes && (
          <View style={styles.expandableContent}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Gelir KDV'si (%20):</Text>
              <Text style={styles.detailValue}>{format(gelirKdvsi)} ₺</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>İndirilecek KDV:</Text>
              <Text style={[styles.detailValue, styles.positive]}>
                -{format(toplamIndirilecekKdv)} ₺
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Ödenecek KDV:</Text>
              <Text style={[styles.detailValue, styles.kdvColor]}>
                {format(odenecekKdv)} ₺
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Vergiye Tabi Gelir:</Text>
              <Text style={styles.detailValue}>{format(vergiyeTabiGelir)} ₺</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Gelir Vergisi:</Text>
              <Text style={[styles.detailValue, styles.taxColor]}>
                {format(gelirVergisi)} ₺
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Net Gelir Analizi */}
      <View style={styles.expandableCard}>
        <TouchableOpacity 
          style={styles.expandableHeader}
          onPress={() => toggleSection('netIncome')}
          activeOpacity={0.7}
        >
          <Text style={styles.expandableTitle}>📈 Net Gelir Analizi</Text>
          <Text style={styles.expandIcon}>
            {expandedSections.netIncome ? '▼' : '▶'}
          </Text>
        </TouchableOpacity>
        
        {expandedSections.netIncome && (
          <View style={styles.expandableContent}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Brüt Kazanç:</Text>
              <Text style={styles.detailValue}>
                {format(income - allExpenses)} ₺
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Vergi Yükü:</Text>
              <Text style={[styles.detailValue, styles.negative]}>
                -{format(toplamVergi)} ₺
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Net Kazanç:</Text>
              <Text style={[styles.detailValue, netKazanc >= 0 ? styles.positive : styles.negative]}>
                {format(netKazanc)} ₺
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Kar Marjı:</Text>
              <Text style={styles.detailValue}>
                {income > 0 ? `${((netKazanc / income) * 100).toFixed(1)}%` : '0%'}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Kaydet Butonu */}
      <TouchableOpacity 
        style={styles.saveButton}
        onPress={saveToHistory}
        activeOpacity={0.8}
      >
        <Text style={styles.saveButtonText}>💾 Hesaplamayı Kaydet</Text>
      </TouchableOpacity>

      {/* Uyarı */}
      <View style={styles.warning}>
        <Text style={styles.warningIcon}>⚠️</Text>
        <Text style={styles.warningText}>
          Bu hesaplamalar tahminidir. Gerçek vergi hesaplamaları için mutlaka 
          muhasebeci ile görüşünüz.
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

  // Summary Card
  summaryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748B',
    flex: 1,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  netLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  netValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Expandable Cards
  expandableCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  expandableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F1F5F9',
  },
  expandableTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
  },
  expandIcon: {
    fontSize: 14,
    color: '#64748B',
  },
  expandableContent: {
    padding: 16,
    backgroundColor: '#ffffff',
  },

  // Detail Rows
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748B',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },

  // Colors
  positive: {
    color: '#059669',
  },
  negative: {
    color: '#DC2626',
  },
  kdvColor: {
    color: '#D97706',
  },
  taxColor: {
    color: '#7C3AED',
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 8,
  },

  // Save Button
  saveButton: {
    backgroundColor: '#059669',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 16,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Warning
  warning: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  warningIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: '#92400E',
    lineHeight: 16,
  },
});

export default Summary;