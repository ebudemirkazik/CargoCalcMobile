// Summary.jsx - Clean Design React Native Version
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import asyncStorageManager from '../utils/AsyncStorage';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

const Summary = ({ income, expenses, fixedExpenses = [], onHistorySaved }) => {
  // Hesaplamalar - "Fatura" gizli özelliği ile
  const visibleExpenses = Array.isArray(expenses) ? expenses.reduce((sum, expense) => {
    // "Fatura" adlı masraflar görünür masraflara eklenmez
    if (expense.isHiddenFromVisible || expense.name.toLowerCase() === 'fatura') return sum;
    return sum + (expense.amount || 0);
  }, 0) : 0;

  const totalExpenses = visibleExpenses; // Sadece görünür masraflar
  const totalFixedExpenses = Array.isArray(fixedExpenses) ? fixedExpenses.reduce((sum, expense) => sum + (expense.monthlyAmount || 0), 0) : 0;
  const allExpenses = totalExpenses + totalFixedExpenses;

  // KDV Hesaplamaları - Tüm faturalı masraflar için (gizli olanlar dahil)
  const expenseKdv = Array.isArray(expenses) ? expenses.reduce((sum, expense) => {
    if (!expense.hasFatura) return sum;

    const amount = expense.amount || 0;
    const rate = expense.kdvRate || 0;
    const kdvAmount = (amount * rate) / (100 + rate);

    return sum + kdvAmount;
  }, 0) : 0;

  const fixedExpenseKdv = Array.isArray(fixedExpenses) ? fixedExpenses.reduce((sum, expense) => {
    const amount = expense.monthlyAmount || 0;
    const rate = expense.kdvRate || 0;
    const kdvAmount = (amount * rate) / (100 + rate);

    return sum + kdvAmount;
  }, 0) : 0;

  const toplamIndirilecekKdv = expenseKdv + fixedExpenseKdv;

  // Gelir Vergisi Hesaplama - Tüm faturalı masraflar matrahtan düşülebilir (gizli olanlar dahil)
  const faturaliMasraflar = Array.isArray(expenses) ? expenses.reduce((sum, expense) => {
    // Sadece fatura varsa gelir vergisi matrahından düşülebilir (gizli olsa bile)
    if (!expense.hasFatura) return sum;
    return sum + (expense.amount || 0);
  }, 0) : 0;

  const indirilebilirMasraflar = faturaliMasraflar + totalFixedExpenses; // Sabit giderler her zaman indirilebilir

  console.log('Vergi hesaplamaları (Fatura gizli özelliği ile):', {
    totalExpenses: allExpenses, // Görünür masraflar
    visibleExpenses,
    faturaliMasraflar, // Tüm faturalı masraflar (gizli dahil)
    totalFixedExpenses,
    indirilebilirMasraflar,
    expenseKdv,
    fixedExpenseKdv,
    toplamIndirilecekKdv
  });

  // Gelir KDV'si (%20)
  const gelirKdvsi = (income || 0) * (0.20 / 1.20); //KDV dahil tutardan %20'lik kısmı çıkarıyoruz
  const odenecekKdv = Math.max(0, gelirKdvsi - toplamIndirilecekKdv);

  // Gelir Vergisi Hesaplama (KDV hariç gelir üzerinden)
  const kdvHaricGelir = (income || 0) / 1.20;
  const kdvHaricIndirilebilirGiderler = indirilebilirMasraflar / 1.20; // Sadece faturalı masraflar
  const vergiyeTabiGelir = kdvHaricGelir - kdvHaricIndirilebilirGiderler;

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
  const netKazanc = (income || 0) - allExpenses - toplamVergi;

  const format = (amount) => {
    if (!amount || isNaN(amount)) return '0';
    return amount.toLocaleString('tr-TR', { maximumFractionDigits: 2 });
  };

  // AsyncStorage'a kaydetme fonksiyonu
  const saveToHistory = async () => {
  try {
    const historyData = {
      date: new Date().toISOString(),
      income: income || 0,
      expenses: expenses || [],
      fixedExpenses: fixedExpenses || [],
      totalExpenses: allExpenses,
      odenecekKdv: odenecekKdv,
      gelirVergisi: gelirVergisi,
      toplamVergi: toplamVergi,
      netKazanc: netKazanc,
      vergiyeTabiGelir: vergiyeTabiGelir,
      kdvHaricGelir: kdvHaricGelir,
      faturaliMasraflar: faturaliMasraflar,
      indirilebilirMasraflar: indirilebilirMasraflar,
      timestamp: Date.now(),
    };

    const existingData = await asyncStorageManager.getItem('cargoCalcHistory');
    const history = existingData ? JSON.parse(existingData) : [];

    const updated = [historyData, ...history.slice(0, 49)];
    await asyncStorageManager.setItem('cargoCalcHistory', JSON.stringify(updated));

    Alert.alert('Başarılı!', 'Hesaplama geçmişe kaydedildi.');

    if (onHistorySaved) {
      onHistorySaved();
    }
  } catch (error) {
    console.error('Kaydetme hatası:', error);
    Alert.alert('Hata!', 'Hesaplama kaydedilemedi: ' + error.message);
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Finansal Özet</Text>

      {/* Ana Özet Kartı */}
      <View style={styles.summaryCard}>
        {/* Hakediş */}
        <View style={styles.summaryRow}>
          <View style={[styles.colorBar, styles.incomeBar]} />
          <Text style={styles.summaryLabel}>Hakediş:</Text>
          <Text style={[styles.summaryValue, styles.incomeValue]}>
            {format(income || 0)} ₺
          </Text>
        </View>

        {/* Görünür Masraflar */}
        <View style={styles.summaryRow}>
          <View style={[styles.colorBar, styles.expenseBar]} />
          <Text style={styles.summaryLabel}>Görünür Masraflar:</Text>
          <Text style={[styles.summaryValue, styles.expenseValue]}>
            {format(allExpenses)} ₺
          </Text>
        </View>
      </View>

      {/* Vergi Detayları */}
      <View style={styles.taxCard}>
        <Text style={styles.taxTitle}>Vergi Detayları</Text>
        <Text style={[styles.taxTotal, styles.negative]}>
          {format(toplamVergi)} ₺
        </Text>

        <View style={styles.taxDetails}>
          <View style={styles.taxRow}>
            <Text style={styles.taxLabel}>Toplam İndirilecek KDV:</Text>
            <Text style={[styles.taxValue, styles.positive]}>
              {format(toplamIndirilecekKdv)} ₺
            </Text>
          </View>

          <View style={styles.taxRow}>
            <Text style={styles.taxLabel}>Hakediş KDV (%20):</Text>
            <Text style={styles.taxValue}>
              {format(gelirKdvsi)} ₺
            </Text>
          </View>

          <View style={styles.taxRow}>
            <Text style={styles.taxLabel}>Ödenecek KDV:</Text>
            <Text style={[styles.taxValue, styles.negative]}>
              {format(odenecekKdv)} ₺
            </Text>
          </View>

          <View style={styles.taxRow}>
            <Text style={styles.taxLabel}>Gelir Vergisi Matrahı:</Text>
            <Text style={styles.taxValue}>
              {format(Math.max(0, vergiyeTabiGelir))} ₺
            </Text>
          </View>

          <View style={styles.taxRow}>
            <Text style={styles.taxLabel}>İndirilebilir Masraflar:</Text>
            <Text style={[styles.taxValue, styles.positive]}>
              {format(indirilebilirMasraflar)} ₺
            </Text>
          </View>

          <View style={styles.taxRow}>
            <Text style={styles.taxLabel}>Gelir Vergisi:</Text>
            <Text style={[styles.taxValue, styles.negative]}>
              {format(gelirVergisi)} ₺
            </Text>
          </View>
        </View>
      </View>

      {/* Toplam Vergi Yükü */}
      <View style={styles.totalTaxCard}>
        <Text style={styles.totalTaxTitle}>
          Toplam Vergi Yükü (KDV + Gelir Vergisi):
        </Text>
        <Text style={[styles.totalTaxValue, styles.negative]}>
          {format(toplamVergi)} ₺
        </Text>
      </View>

      {/* Net Kazanç */}
      <View style={[
        styles.netIncomeCard,
        { backgroundColor: netKazanc >= 0 ? '#059669' : '#DC2626' }
      ]}>
        <Text style={[
          styles.netIncomeTitle,
          { color: '#ffffff' }
        ]}>
          NET KAZANÇ
        </Text>
        <Text style={styles.netIncomeValue}>
          {format(netKazanc)} ₺
        </Text>
        <Text style={styles.netIncomeSubtitle}>
          {netKazanc < 0 ? 'Tüm vergiler düşülmüş net zarar' : 'Tüm vergiler düşülmüş net kar'}
        </Text>
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
    textAlign: 'center',
  },

  // Summary Card
  summaryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  colorBar: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginRight: 12,
  },
  incomeBar: {
    backgroundColor: '#3B82F6',
  },
  expenseBar: {
    backgroundColor: '#EF4444',
  },
  summaryLabel: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  incomeValue: {
    color: '#3B82F6',
  },
  expenseValue: {
    color: '#EF4444',
  },

  // Tax Card
  taxCard: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  taxTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
    marginBottom: 8,
  },
  taxTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  taxDetails: {
    gap: 8,
  },
  taxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  taxLabel: {
    flex: 1,
    fontSize: 14,
    color: '#64748B',
  },
  taxValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },

  // Total Tax Card
  totalTaxCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  totalTaxTitle: {
    fontSize: 14,
    color: '#7F1D1D',
    marginBottom: 8,
    textAlign: 'center',
  },
  totalTaxValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Net Income Card
  netIncomeCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  netIncomeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  netIncomeValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#ffffff', // Her zaman beyaz
  },
  netIncomeSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.8)', // Her zaman beyaz opak
  },

  // Colors
  positive: {
    color: '#059669',
  },
  negative: {
    color: '#DC2626',
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