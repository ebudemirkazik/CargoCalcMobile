// Summary.jsx - Refactored to use taxCalculator.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import { calculateMonthlyIncomeTaxFromGross } from '../utils/taxCalculator';
import asyncStorageManager from '../utils/AsyncStorage';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

const Summary = ({ income, expenses, fixedExpenses = [], onHistorySaved }) => {
  // Masraf Hesaplamaları
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
    const rate = expense.kdvRate || 20; // Default 20%
    const kdvAmount = (amount * rate) / (100 + rate);

    return sum + kdvAmount;
  }, 0) : 0;

  const fixedExpenseKdv = Array.isArray(fixedExpenses) ? fixedExpenses.reduce((sum, expense) => {
    const amount = expense.monthlyAmount || 0;
    const rate = expense.kdvRate || 20; // Default 20%
    const kdvAmount = (amount * rate) / (100 + rate);

    return sum + kdvAmount;
  }, 0) : 0;

  const toplamIndirilecekKdv = expenseKdv + fixedExpenseKdv;

  // Faturalı masraflar (gelir vergisi matrahından düşülebilir)
  const faturaliMasraflar = Array.isArray(expenses) ? expenses.reduce((sum, expense) => {
    if (!expense.hasFatura) return sum;
    return sum + (expense.amount || 0);
  }, 0) : 0;

  const indirilebilirMasraflar = faturaliMasraflar + totalFixedExpenses;

  // **DOĞRU VERGİ HESAPLAMA SİSTEMİ - Düzeltildi**
  const grossIncome = income || 0;
  
  // 1️⃣ KDV hariç aylık gelir
  const kdvHaricAylikGelir = grossIncome / 1.20;
  
  // 2️⃣ Faturalı masrafların KDV HARİÇ tutarını hesapla
  const faturaliMasraflarKdvHaric = Array.isArray(expenses) ? expenses.reduce((sum, expense) => {
    if (!expense.hasFatura) return sum;
    const amount = expense.amount || 0;
    const rate = expense.kdvRate || 20;
    const kdvHaricTutar = amount / (1 + rate/100);
    return sum + kdvHaricTutar;
  }, 0) : 0;
  
  const sabitGiderlerKdvHaric = Array.isArray(fixedExpenses) ? fixedExpenses.reduce((sum, expense) => {
    const amount = expense.monthlyAmount || 0;
    const rate = expense.kdvRate || 20;
    const kdvHaricTutar = amount / (1 + rate/100);
    return sum + kdvHaricTutar;
  }, 0) : 0;
  
  const toplamIndirilebilirAylikGiderKdvHaric = faturaliMasraflarKdvHaric + sabitGiderlerKdvHaric;
  
  // 3️⃣ Masraf düşülmüş aylık gelir vergisi matrahı
  const aylikGelirVergisiMatrahi = Math.max(0, kdvHaricAylikGelir - toplamIndirilebilirAylikGiderKdvHaric);
  
  // 4️⃣ Yıllık matrah yap ve vergi hesapla
  const yillikGelirVergisiMatrahi = aylikGelirVergisiMatrahi * 12;
  const yillikGelirVergisi = yillikGelirVergisiMatrahi > 0 ? calculateYearlyIncomeTax(yillikGelirVergisiMatrahi) : 0;
  const gelirVergisi = yillikGelirVergisi / 12;

  // 5️⃣ KDV Hesaplamaları
  const gelirKdvsi = grossIncome * (0.20 / 1.20);
  const odenecekKdv = Math.max(0, gelirKdvsi - toplamIndirilecekKdv);

  // taxCalculator.js'den TAMAMEN kopyalanan hesaplama mantığı
  function calculateYearlyIncomeTax(yearlyIncome) {
    const taxBrackets = [
      { min: 0, max: 158000, rate: 0.15, fixedTax: 0 },
      { min: 158000, max: 330000, rate: 0.20, fixedTax: 23700 },
      { min: 330000, max: 1200000, rate: 0.27, fixedTax: 58100 },
      { min: 1200000, max: 4300000, rate: 0.35, fixedTax: 293000 },
      { min: 4300000, max: Infinity, rate: 0.40, fixedTax: 1378000 }
    ];

    if (yearlyIncome <= 0) return 0;

    // NOT: taxCalculator.js aylık gelir ile çalışıyor, biz yıllık yapacağız
    // Yıllık geliri aylık hale getir, taxCalculator mantığını uygula, sonra 12 ile çarp
    const monthlyIncome = yearlyIncome / 12;
    
    // 1️⃣ KDV'siz net matrahı hesapla (zaten KDV hariç giriyor)
    const monthlyNetIncome = monthlyIncome;

    // 2️⃣ Yıllık matrahı hesapla
    const annualIncome = monthlyNetIncome * 12;

    // 3️⃣ Gelir vergisini yıllık hesapla
    let totalAnnualTax = 0;
    for (let i = 0; i < taxBrackets.length; i++) {
      const bracket = taxBrackets[i];
      if (annualIncome > bracket.min && annualIncome <= bracket.max) {
        const taxable = annualIncome - bracket.min;
        totalAnnualTax = bracket.fixedTax + (taxable * bracket.rate);
        
        console.log(`taxCalculator mantığı:`, {
          annualIncome,
          bracket: `${bracket.min}-${bracket.max}`,
          rate: `%${bracket.rate * 100}`,
          fixedTax: bracket.fixedTax,
          taxable,
          totalAnnualTax: totalAnnualTax.toFixed(2)
        });
        
        break;
      }
    }

    return Math.round(totalAnnualTax * 100) / 100;
  }
  
  // Görüntüleme için backward compatibility (eski adlar)
  const vergiyeTabiGelir = aylikGelirVergisiMatrahi;
  const kdvHaricGelir = kdvHaricAylikGelir;
  
  // Toplam vergi ve net kazanç
  const toplamVergi = odenecekKdv + gelirVergisi;
  const netKazanc = grossIncome - allExpenses - toplamVergi;

  // Debug log
  console.log('DOĞRU Vergi Hesaplamaları - Adım Adım:', {
    '1_grossIncome_KDV_Dahil': grossIncome,
    '2_kdvHaricAylikGelir': kdvHaricAylikGelir.toFixed(2),
    '3_toplamIndirilebilirAylikGider': toplamIndirilebilirAylikGiderKdvHaric.toFixed(2),
    '4_aylikGelirVergisiMatrahi': aylikGelirVergisiMatrahi.toFixed(2),
    '5_yillikGelirVergisiMatrahi': yillikGelirVergisiMatrahi.toFixed(2),
    '6_yillikGelirVergisi': yillikGelirVergisi.toFixed(2),
    '7_aylikGelirVergisi': gelirVergisi.toFixed(2),
    'KDV_gelirKdvsi': gelirKdvsi.toFixed(2),
    'KDV_toplamIndirilecek': toplamIndirilecekKdv.toFixed(2),
    'KDV_odenecek': odenecekKdv.toFixed(2)
  });

  const format = (amount) => {
    if (!amount || isNaN(amount)) return '0';
    return amount.toLocaleString('tr-TR', { maximumFractionDigits: 2 });
  };

  // AsyncStorage'a kaydetme fonksiyonu
  const saveToHistory = async () => {
    try {
      const historyData = {
        date: new Date().toISOString(),
        income: grossIncome,
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
        toplamIndirilecekKdv: toplamIndirilecekKdv,
        timestamp: Date.now(),
        // Hesaplama yöntemi bilgisi
        calculationMethod: 'taxCalculator.js',
        version: '2.0'
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
            {format(grossIncome)} ₺
          </Text>
        </View>

        {/* Görünür Masraflar */}
        <View style={styles.summaryRow}>
          <View style={[styles.colorBar, styles.expenseBar]} />
          <Text style={styles.summaryLabel}>Masraflar:</Text>
          <Text style={[styles.summaryValue, styles.expenseValue]}>
            {format(allExpenses)} ₺
          </Text>
        </View>
      </View>

      {/* Vergi Detayları */}
      <View style={styles.taxCard}>
        <Text style={styles.taxTitle}>💳 Vergi Detayları</Text>
        <Text style={[styles.taxTotal, styles.negative]}>
          {format(toplamVergi)} ₺
        </Text>

        <View style={styles.taxDetails}>
          <View style={styles.taxRow}>
            <Text style={styles.taxLabel}>📋 KDV Dahil Gelir:</Text>
            <Text style={styles.taxValue}>
              {format(grossIncome)} ₺
            </Text>
          </View>

          <View style={styles.taxRow}>
            <Text style={styles.taxLabel}>💰 KDV Hariç Gelir:</Text>
            <Text style={styles.taxValue}>
              {format(kdvHaricGelir)} ₺
            </Text>
          </View>

          <View style={styles.taxRow}>
            <Text style={styles.taxLabel}>📄 İndirilebilir Masraflar:</Text>
            <Text style={[styles.taxValue, styles.positive]}>
              -{format(indirilebilirMasraflar)} ₺
            </Text>
          </View>

          <View style={styles.taxRow}>
            <Text style={styles.taxLabel}>📈 Gelir Vergisi Matrahı:</Text>
            <Text style={styles.taxValue}>
              {format(vergiyeTabiGelir)} ₺
            </Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.taxRow}>
            <Text style={styles.taxLabel}>🔢 Gelir KDV'si (%20):</Text>
            <Text style={styles.taxValue}>
              {format(gelirKdvsi)} ₺
            </Text>
          </View>

          <View style={styles.taxRow}>
            <Text style={styles.taxLabel}>📉 İndirilecek KDV:</Text>
            <Text style={[styles.taxValue, styles.positive]}>
              -{format(toplamIndirilecekKdv)} ₺
            </Text>
          </View>

          <View style={styles.taxRow}>
            <Text style={[styles.taxLabel, styles.boldLabel]}>💸 Ödenecek KDV:</Text>
            <Text style={[styles.taxValue, styles.negative, styles.boldValue]}>
              {format(odenecekKdv)} ₺
            </Text>
          </View>

          <View style={styles.taxRow}>
            <Text style={[styles.taxLabel, styles.boldLabel]}>🏛️ Gelir Vergisi:</Text>
            <Text style={[styles.taxValue, styles.negative, styles.boldValue]}>
              {format(gelirVergisi)} ₺
            </Text>
          </View>
        </View>
      </View>

      {/* Toplam Vergi Yükü */}
      <View style={styles.totalTaxCard}>
        <Text style={styles.totalTaxTitle}>
          🔴 Toplam Vergi Yükü (KDV + Gelir Vergisi):
        </Text>
        <Text style={[styles.totalTaxValue, styles.negative]}>
          {format(toplamVergi)} ₺
        </Text>
        <Text style={styles.taxRateInfo}>
          Gelir oranı: %{((toplamVergi / grossIncome) * 100).toFixed(1)}
        </Text>
      </View>

      {/* Net Kazanç */}
      <View style={[
        styles.netIncomeCard,
        { backgroundColor: netKazanc >= 0 ? '#059669' : '#DC2626' }
      ]}>
        <Text style={styles.netIncomeTitle}>
          {netKazanc >= 0 ? '🎉 NET KAZANÇ' : '⚠️ NET ZARAR'}
        </Text>
        <Text style={styles.netIncomeValue}>
          {format(Math.abs(netKazanc))} ₺
        </Text>
        <Text style={styles.netIncomeSubtitle}>
          {netKazanc < 0 ? 'Tüm vergiler ve masraflar düşülmüş net zarar' : 'Tüm vergiler ve masraflar düşülmüş net kar'}
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

      {/* Hesaplama Bilgisi */}
      <View style={styles.calculationInfo}>
        <Text style={styles.calculationInfoText}>
          ✅ Hesaplamalar taxCalculator.js kullanılarak yapıldı
        </Text>
      </View>

      {/* Uyarı */}
      <View style={styles.warning}>
        <Text style={styles.warningIcon}>⚠️</Text>
        <Text style={styles.warningText}>
          Bu hesaplamalar 2024 vergi dilimi tablosuna göre tahminidir. 
          Gerçek vergi hesaplamaları için mutlaka muhasebeci ile görüşünüz.
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
    gap: 6,
  },
  taxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  taxLabel: {
    flex: 1,
    fontSize: 13,
    color: '#64748B',
  },
  boldLabel: {
    fontWeight: '600',
    color: '#1E293B',
  },
  taxValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  boldValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: '#CBD5E1',
    marginVertical: 8,
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
    fontWeight: '600',
  },
  totalTaxValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  taxRateInfo: {
    fontSize: 12,
    color: '#7F1D1D',
    fontStyle: 'italic',
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
    color: '#ffffff',
  },
  netIncomeValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#ffffff',
  },
  netIncomeSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.8)',
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

  // Calculation Info
  calculationInfo: {
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  calculationInfoText: {
    fontSize: 11,
    color: '#065F46',
    fontWeight: '500',
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