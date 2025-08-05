// components/Summary.jsx - React Native Version
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { calculateIncomeTax } from '../utils/taxCalculator';
import { exportToExcel } from '../utils/exportToExcel';
import { getCategory } from '../utils/categorizeExpense';
import { exportToPDF } from '../utils/exportToPDF';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

function Summary({ income, expenses, onHistoryUpdate }) {
  const [showTaxDetails, setShowTaxDetails] = useState(false);
  const [showCalculationLogic, setShowCalculationLogic] = useState(false);

  // Memory-based history storage (AsyncStorage yerine)
  const saveSummaryToMemory = (data) => {
    try {
      // Şimdilik sadece console'a log - gerçek uygulamada AsyncStorage kullanılacak
      console.log('Hesaplama kaydedildi:', data);
      
      if (onHistoryUpdate) {
        onHistoryUpdate();
      }
      return true;
    } catch (error) {
      console.error('Hesaplama geçmişi kaydedilemedi:', error);
      return false;
    }
  };

  // Fatura kontrol fonksiyonu
  const isFatura = (item) => item.name.trim().toLowerCase() === 'fatura';

  // Gerçek nakit çıkan masraflar (ekranda gösterilecek) - Fatura hariç
  const totalExpenses = expenses.reduce((acc, item) => {
    return isFatura(item) ? acc : acc + item.amount;
  }, 0);

  // İndirilecek tüm KDV'ler (fatura dahil)
  const totalKdv = expenses.reduce((acc, item) => {
    const kdv = item.amount * (item.kdvRate / (100 + item.kdvRate));
    return acc + (isNaN(kdv) ? 0 : kdv);
  }, 0);

  // Vergi matrahından düşülecek tüm masraflar (fatura dahil!)
  const vergiMatrahMasraflar = expenses.reduce((acc, item) => {
    return acc + item.amount;
  }, 0);

  // Hakediş KDV'si (%20 dahil hesaplaması)
  const hakedisKdv = income * (20 / 120);

  // Devlete ödenecek KDV
  const odenecekKdv = hakedisKdv - totalKdv;

  // Gelir vergisi matrahı (hakediş - tüm masraflar - ödenecek KDV)
  const gelirVergisiMatrahi = income - vergiMatrahMasraflar - odenecekKdv;

  // Gelir vergisi
  const gelirVergisi = calculateIncomeTax(gelirVergisiMatrahi);

  // Net kazanç
  const netKazanc = income - totalExpenses - odenecekKdv - gelirVergisi;

  // Fatura masraflarını ayrı gösterelim
  const faturaExpenses = expenses.filter(isFatura);
  const totalFaturaMasraflar = faturaExpenses.reduce(
    (acc, item) => acc + item.amount,
    0
  );
  const faturaKdv = faturaExpenses.reduce((acc, item) => {
    const kdv = item.amount * (item.kdvRate / (100 + item.kdvRate));
    return acc + (isNaN(kdv) ? 0 : kdv);
  }, 0);

  const format = (n) => n.toLocaleString('tr-TR', { maximumFractionDigits: 2 });

  // Manuel kaydetme fonksiyonu
  const handleSave = () => {
    if (income > 0) {
      const summaryData = {
        income,
        totalExpenses,
        totalKdv,
        hakedisKdv,
        odenecekKdv,
        gelirVergisiMatrahi,
        gelirVergisi,
        netKazanc,
        expenses: expenses,
        date: new Date().toISOString(),
      };
      
      const success = saveSummaryToMemory(summaryData);
      
      if (success) {
        Alert.alert(
          'Başarılı! ✅',
          'Hesaplama başarıyla kaydedildi!',
          [{ text: 'Tamam', style: 'default' }]
        );
      } else {
        Alert.alert('Hata', 'Hesaplama kaydedilemedi.');
      }
    } else {
      Alert.alert('Uyarı', 'Lütfen önce hakediş tutarını giriniz.');
    }
  };

  const handleExportPDF = async () => {
    try {
      await exportToPDF({
        expenses,
        income,
        totalExpenses,
        totalFaturaMasraflar,
        faturaKdv,
        totalKdv,
        hakedisKdv,
        odenecekKdv,
        gelirVergisiMatrahi,
        gelirVergisi,
        netKazanc,
      });
    } catch (error) {
      Alert.alert('Hata', 'PDF oluşturulamadı: ' + error.message);
    }
  };

  const handleExportExcel = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const expenseRows = expenses.map((item) => ({
        Tarih: item.date || today,
        Masraf: item.name,
        Tutar: item.amount + ' ₺',
        KDV: item.kdvRate + '%',
        Kategori: getCategory(item.name),
      }));

      const summaryRows = [
        { Başlık: 'Hakediş', Değer: format(income) + ' ₺' },
        { Başlık: 'Görünür Masraflar', Değer: format(totalExpenses) + ' ₺' },
        ...(totalFaturaMasraflar > 0
          ? [
              {
                Başlık: 'Fatura Masrafları',
                Değer: format(totalFaturaMasraflar) + ' ₺',
              },
              {
                Başlık: 'Fatura KDV İndirimi',
                Değer: format(faturaKdv) + ' ₺',
              },
            ]
          : []),
        { Başlık: 'Toplam İndirilecek KDV', Değer: format(totalKdv) + ' ₺' },
        { Başlık: 'Hakediş KDV (%20)', Değer: format(hakedisKdv) + ' ₺' },
        { Başlık: 'Ödenecek KDV', Değer: format(odenecekKdv) + ' ₺' },
        {
          Başlık: 'Gelir Vergisi Matrahı',
          Değer: format(gelirVergisiMatrahi) + ' ₺',
        },
        { Başlık: 'Gelir Vergisi', Değer: format(gelirVergisi) + ' ₺' },
        { Başlık: 'Net Kazanç', Değer: format(netKazanc) + ' ₺' },
      ];

      const exportData = [...expenseRows, {}, ...summaryRows];
      await exportToExcel(exportData, `CargoCalc-${today}.xlsx`);
    } catch (error) {
      Alert.alert('Hata', 'Excel dosyası oluşturulamadı: ' + error.message);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        {/* Header */}
        <Text style={styles.headerTitle}>📊 Finansal Özet</Text>

        {/* Ana rakamlar */}
        <View style={styles.mainStatsContainer}>
          {/* Hakediş */}
          <View style={[styles.statCard, styles.incomeCard]}>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Hakediş:</Text>
              <Text style={[styles.statValue, styles.incomeValue]}>
                {format(income)} ₺
              </Text>
            </View>
          </View>

          {/* Görünür masraflar */}
          <View style={[styles.statCard, styles.expenseCard]}>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Görünür Masraflar:</Text>
              <Text style={[styles.statValue, styles.expenseValue]}>
                {format(totalExpenses)} ₺
              </Text>
            </View>
          </View>

          {/* Fatura masrafları varsa göster */}
          {totalFaturaMasraflar > 0 && (
            <View style={[styles.statCard, styles.hiddenExpenseCard]}>
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>Gizli Masraflar (Fatura):</Text>
                <Text style={[styles.statValue, styles.hiddenExpenseValue]}>
                  {format(totalFaturaMasraflar)} ₺
                </Text>
              </View>
              <Text style={styles.hiddenExpenseNote}>
                Vergi matrahından düşülüyor ama görünür masraflarda sayılmıyor
              </Text>
              <Text style={styles.hiddenExpenseKdv}>
                KDV indirimi: {format(faturaKdv)} ₺
              </Text>
            </View>
          )}
        </View>

        {/* Vergi detayları - Genişletilebilir */}
        <TouchableOpacity
          onPress={() => setShowTaxDetails(!showTaxDetails)}
          style={styles.expandableCard}
          activeOpacity={0.8}
        >
          <View style={styles.expandableHeader}>
            <Text style={styles.expandableTitle}>Vergi Detayları</Text>
            <View style={styles.expandableRight}>
              <Text style={styles.expandableAmount}>
                {format(odenecekKdv + gelirVergisi)} ₺
              </Text>
              <Text style={[styles.expandIcon, showTaxDetails && styles.expandIconRotated]}>
                ⬇️
              </Text>
            </View>
          </View>

          {showTaxDetails && (
            <View style={styles.expandableContent}>
              <View style={styles.taxDetailRow}>
                <Text style={styles.taxDetailLabel}>Toplam İndirilecek KDV:</Text>
                <Text style={[styles.taxDetailValue, styles.positiveValue]}>
                  {format(totalKdv)} ₺
                </Text>
              </View>

              <View style={styles.taxDetailRow}>
                <Text style={styles.taxDetailLabel}>Hakediş KDV (%20):</Text>
                <Text style={styles.taxDetailValue}>
                  {format(hakedisKdv)} ₺
                </Text>
              </View>

              <View style={[styles.taxDetailRow, styles.importantRow]}>
                <Text style={styles.taxDetailLabel}>Ödenecek KDV:</Text>
                <Text style={[styles.taxDetailValue, styles.negativeValue]}>
                  {format(odenecekKdv)} ₺
                </Text>
              </View>

              <View style={styles.taxDetailRow}>
                <Text style={styles.taxDetailLabel}>Gelir Vergisi Matrahı:</Text>
                <Text style={styles.taxDetailValue}>
                  {format(gelirVergisiMatrahi)} ₺
                </Text>
              </View>

              <View style={styles.taxDetailRow}>
                <Text style={styles.taxDetailLabel}>Gelir Vergisi:</Text>
                <Text style={[styles.taxDetailValue, styles.negativeValue]}>
                  {format(gelirVergisi)} ₺
                </Text>
              </View>
            </View>
          )}
        </TouchableOpacity>

        {/* Toplam vergi yükü */}
        <View style={styles.totalTaxCard}>
          <View style={styles.totalTaxContent}>
            <Text style={styles.totalTaxLabel}>
              Toplam Vergi Yükü{'\n'}(KDV + Gelir Vergisi):
            </Text>
            <Text style={styles.totalTaxValue}>
              {format(odenecekKdv + gelirVergisi)} ₺
            </Text>
          </View>
        </View>

        {/* Net Kazanç - Ana Sonuç */}
        <View style={styles.netProfitCard}>
          <Text style={styles.netProfitTitle}>NET KAZANÇ</Text>
          <Text style={styles.netProfitValue}>
            {format(netKazanc)} ₺
          </Text>
          <Text style={styles.netProfitSubtitle}>
            Tüm vergiler düşülmüş net kâr
          </Text>
        </View>

        {/* Hesaplama mantığı - Genişletilebilir */}
        <TouchableOpacity
          onPress={() => setShowCalculationLogic(!showCalculationLogic)}
          style={styles.expandableCard}
          activeOpacity={0.8}
        >
          <View style={styles.expandableHeader}>
            <Text style={styles.expandableTitle}>Hesaplama Mantığı</Text>
            <Text style={[styles.expandIcon, showCalculationLogic && styles.expandIconRotated]}>
              ⬇️
            </Text>
          </View>

          {showCalculationLogic && (
            <View style={styles.expandableContent}>
              <Text style={styles.calculationStep}>• Hakediş: {format(income)} ₺</Text>
              <Text style={styles.calculationStep}>• Görünür Masraflar: -{format(totalExpenses)} ₺</Text>
              {totalFaturaMasraflar > 0 && (
                <Text style={styles.calculationStep}>• Gizli Masraflar (Fatura): -{format(totalFaturaMasraflar)} ₺</Text>
              )}
              <Text style={styles.calculationStep}>• Ödenecek KDV: -{format(odenecekKdv)} ₺</Text>
              <Text style={styles.calculationStep}>• Gelir Vergisi: -{format(gelirVergisi)} ₺</Text>
              <View style={styles.calculationDivider} />
              <Text style={styles.calculationResult}>= Net Kazanç: {format(netKazanc)} ₺</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Kaydet butonu */}
        <TouchableOpacity
          onPress={handleSave}
          style={styles.saveButton}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>Hesaplamayı Kaydet</Text>
        </TouchableOpacity>

        {/* Hızlı istatistikler */}
        <View style={styles.quickStatsContainer}>
          <View style={styles.quickStatCard}>
            <Text style={styles.quickStatValue}>
              {income > 0 ? ((netKazanc / income) * 100).toFixed(1) : '0'}%
            </Text>
            <Text style={styles.quickStatLabel}>Kar Marjı</Text>
          </View>
          <View style={styles.quickStatCard}>
            <Text style={styles.quickStatValue}>
              {income > 0
                ? (((odenecekKdv + gelirVergisi) / income) * 100).toFixed(1)
                : '0'}%
            </Text>
            <Text style={styles.quickStatLabel}>Vergi Oranı</Text>
          </View>
        </View>

        {/* Export buttons */}
        <View style={styles.exportContainer}>
          <TouchableOpacity
            onPress={handleExportPDF}
            style={[styles.exportButton, styles.pdfButton]}
            activeOpacity={0.8}
          >
            <Text style={styles.exportButtonText}>PDF'e Aktar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleExportExcel}
            style={[styles.exportButton, styles.excelButton]}
            activeOpacity={0.8}
          >
            <Text style={styles.exportButtonText}>Excel'e Aktar</Text>
          </TouchableOpacity>
        </View>

        {/* Mobil ipucu */}
        {!isTablet && (
          <View style={styles.tipContainer}>
            <Text style={styles.tipIcon}>💡</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>İpucu:</Text>
              <Text style={styles.tipText}>
                Vergi detaylarını ve hesaplama mantığını görmek için ilgili
                bölümlere dokunun.
              </Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: isTablet ? 24 : 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },

  // Header
  headerTitle: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 24,
  },

  // Main Stats
  mainStatsContainer: {
    marginBottom: 24,
    gap: 16,
  },
  statCard: {
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
  },
  incomeCard: {
    backgroundColor: '#EFF6FF',
    borderLeftColor: '#3B82F6',
  },
  expenseCard: {
    backgroundColor: '#FEF2F2',
    borderLeftColor: '#EF4444',
  },
  hiddenExpenseCard: {
    backgroundColor: '#FFFBEB',
    borderLeftColor: '#F59E0B',
  },
  statContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
    color: '#374151',
  },
  statValue: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
  },
  incomeValue: {
    color: '#1E40AF',
  },
  expenseValue: {
    color: '#DC2626',
  },
  hiddenExpenseValue: {
    color: '#D97706',
  },
  hiddenExpenseNote: {
    fontSize: 12,
    color: '#92400E',
    marginTop: 8,
  },
  hiddenExpenseKdv: {
    fontSize: 12,
    color: '#92400E',
    marginTop: 4,
  },

  // Expandable Card
  expandableCard: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  expandableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  expandableTitle: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: 'bold',
    color: '#2563EB',
    flex: 1,
  },
  expandableRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandableAmount: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: 'bold',
    color: '#374151',
    marginRight: 8,
  },
  expandIcon: {
    fontSize: 12,
    transform: [{ rotate: '0deg' }],
  },
  expandIconRotated: {
    transform: [{ rotate: '180deg' }],
  },
  expandableContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  taxDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  importantRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 8,
    paddingTop: 16,
  },
  taxDetailLabel: {
    fontSize: isTablet ? 14 : 12,
    color: '#6B7280',
  },
  taxDetailValue: {
    fontSize: isTablet ? 14 : 12,
    fontWeight: '600',
    color: '#374151',
  },
  positiveValue: {
    color: '#059669',
  },
  negativeValue: {
    color: '#DC2626',
  },

  // Total Tax Card
  totalTaxCard: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  totalTaxContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalTaxLabel: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
    color: '#1E40AF',
  },
  totalTaxValue: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
    color: '#1E40AF',
  },

  // Net Profit Card
  netProfitCard: {
    backgroundColor: '#059669',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  netProfitTitle: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 8,
  },
  netProfitValue: {
    fontSize: isTablet ? 36 : 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  netProfitSubtitle: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.8,
  },

  // Calculation Logic
  calculationStep: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
  calculationDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  calculationResult: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
  },

  // Save Button
  saveButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: isTablet ? 12 : 18,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: isTablet ? 14 : 16,
    fontWeight: 'bold',
  },

  // Quick Stats
  quickStatsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  quickStatCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
  },
  quickStatValue: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 12,
    color: '#6B7280',
  },

  // Export Buttons
  exportContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  exportButton: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flex: 1,
    alignItems: 'center',
  },
  pdfButton: {
    backgroundColor: '#DC2626',
  },
  excelButton: {
    backgroundColor: '#059669',
  },
  exportButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Tip Container
  tipContainer: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipIcon: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 16,
  },
});

export default Summary;