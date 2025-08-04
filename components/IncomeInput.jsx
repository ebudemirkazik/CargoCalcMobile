// components/IncomeInput.jsx - React Native Version
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

function IncomeInput({ income, setIncome }) {
  const [inputValue, setInputValue] = useState(income.toString());
  const [error, setError] = useState('');
  const [showOtherAmounts, setShowOtherAmounts] = useState(false);

  // Hakediş validasyonu
  const validateIncome = (value) => {
    if (!value) {
      return 'Hakediş tutarı boş olamaz';
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return 'Geçerli bir sayı giriniz';
    }

    if (numValue < 0) {
      return 'Hakediş negatif olamaz';
    }

    if (numValue > 10000000) {
      return 'Tutar çok büyük (max: 10.000.000₺)';
    }

    return null;
  };

  const handleChange = (value) => {
    // Sadece sayı, nokta ve virgül kabul et
    value = value.replace(/[^0-9.,]/g, '');

    // Virgülü noktaya çevir
    value = value.replace(',', '.');

    // Birden fazla nokta varsa sadece ilkini bırak
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }

    // Başında sıfır varsa temizle (00123 -> 123)
    if (value.length > 1 && value[0] === '0' && value[1] !== '.') {
      value = value.replace(/^0+/, '');
    }

    setInputValue(value);

    // Gerçek zamanlı validasyon
    const validationError = validateIncome(value);
    setError(validationError);

    // Hata yoksa parent'a gönder
    if (!validationError && value) {
      const numValue = parseFloat(value);
      setIncome(numValue);
    } else if (!value) {
      setIncome(0);
    }
  };

  const handleBlur = () => {
    // Focus kaybedince son validasyon
    const validationError = validateIncome(inputValue);
    setError(validationError);

    // Değer varsa formatla
    if (inputValue && !validationError) {
      const numValue = parseFloat(inputValue);
      setInputValue(numValue.toString());
      setIncome(numValue);
    }
  };

  const handleFocus = () => {
    // Focus alınca hatayı temizle
    setError('');
  };

  // Hızlı tutar butonları
  const quickAmounts = [
    { amount: 80000, label: '80K', popular: false },
    { amount: 100000, label: '100K', popular: true },
    { amount: 115000, label: '115K', popular: true },
    { amount: 120000, label: '120K', popular: true },
    { amount: 125000, label: '125K', popular: true },
    { amount: 130000, label: '130K', popular: true },
    { amount: 135000, label: '135K', popular: false },
    { amount: 140000, label: '140K', popular: false },
    { amount: 150000, label: '150K', popular: true },
    { amount: 160000, label: '160K', popular: false },
    { amount: 175000, label: '175K', popular: false },
    { amount: 200000, label: '200K', popular: false },
  ];

  const handleQuickAmount = (amount) => {
    setInputValue(amount.toString());
    setIncome(amount);
    setError('');
  };

  const handleClear = () => {
    setInputValue('');
    setIncome(0);
    setError('');
  };

  const format = (n) => n.toLocaleString('tr-TR', { maximumFractionDigits: 0 });

  const getInputStyle = () => {
    if (error) {
      return [styles.input, styles.inputError];
    } else if (income > 0) {
      return [styles.input, styles.inputSuccess];
    } else {
      return [styles.input, styles.inputDefault];
    }
  };

  const popularAmounts = quickAmounts.filter(item => item.popular);
  const otherAmounts = quickAmounts.filter(item => !item.popular);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerIcon}>💰</Text>
          <Text style={styles.headerTitle}>Aylık Hakediş</Text>
        </View>

        {/* Ana Input */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Hakediş Tutarı (₺)</Text>
          <TextInput
            style={getInputStyle()}
            value={inputValue}
            onChangeText={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder="Örn: 125000"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            returnKeyType="done"
          />

          {/* Hata mesajı */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </View>

        {/* Hızlı Seçim */}
        <View style={styles.quickSelectionSection}>
          <Text style={styles.sectionTitle}>Hızlı Seçim:</Text>

          {/* Popüler Tutarlar */}
          <View style={styles.popularSection}>
            <Text style={styles.subsectionTitle}>Popüler Tutarlar:</Text>
            <View style={styles.buttonGrid}>
              {popularAmounts.map((item) => (
                <TouchableOpacity
                  key={item.amount}
                  onPress={() => handleQuickAmount(item.amount)}
                  style={[
                    styles.quickButton,
                    income === item.amount ? styles.quickButtonSelected : styles.quickButtonDefault
                  ]}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.quickButtonText,
                    income === item.amount ? styles.quickButtonTextSelected : styles.quickButtonTextDefault
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Diğer Tutarlar - Genişletilebilir */}
          <View style={styles.otherSection}>
            <TouchableOpacity
              onPress={() => setShowOtherAmounts(!showOtherAmounts)}
              style={styles.expandButton}
              activeOpacity={0.7}
            >
              <Text style={styles.expandButtonText}>Diğer Tutarlar</Text>
              <Text style={[styles.expandIcon, showOtherAmounts && styles.expandIconRotated]}>
                ⬇️
              </Text>
            </TouchableOpacity>

            {showOtherAmounts && (
              <View style={styles.buttonGrid}>
                {otherAmounts.map((item) => (
                  <TouchableOpacity
                    key={item.amount}
                    onPress={() => handleQuickAmount(item.amount)}
                    style={[
                      styles.quickButton,
                      styles.otherButton,
                      income === item.amount ? styles.otherButtonSelected : styles.otherButtonDefault
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.quickButtonText,
                      income === item.amount ? styles.otherButtonTextSelected : styles.otherButtonTextDefault
                    ]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Temizle Butonu */}
        {income > 0 && (
          <TouchableOpacity
            onPress={handleClear}
            style={styles.clearButton}
            activeOpacity={0.8}
          >
            <Text style={styles.clearButtonText}>Temizle</Text>
          </TouchableOpacity>
        )}

        {/* Hakediş Analizi */}
        {income > 0 && !error && (
          <View style={styles.analysisContainer}>
            <Text style={styles.analysisTitle}>Hakediş Analizi:</Text>

            <View style={styles.analysisGrid}>
              <View style={styles.analysisCard}>
                <Text style={styles.analysisCardLabel}>KDV Dahil Tutar:</Text>
                <Text style={[styles.analysisCardValue, styles.infoColor]}>
                  {format(income)} ₺
                </Text>
              </View>

              <View style={styles.analysisCard}>
                <Text style={styles.analysisCardLabel}>KDV Tutarı (%20):</Text>
                <Text style={[styles.analysisCardValue, styles.redColor]}>
                  {format(income * (20 / 120))} ₺
                </Text>
              </View>

              <View style={[styles.analysisCard, styles.analysisCardFull]}>
                <Text style={styles.analysisCardLabel}>Net Hakediş (KDV Hariç):</Text>
                <Text style={[styles.analysisCardValue, styles.greenColor]}>
                  {format(income - income * (20 / 120))} ₺
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Mobil İpucu */}
        {!isTablet && (
          <View style={styles.tipContainer}>
            <Text style={styles.tipIcon}>💡</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>İpucu:</Text>
              <Text style={styles.tipText}>
                Hızlı seçim butonlarını kullanarak yaygın hakediş tutarlarını
                kolayca seçebilirsiniz.
              </Text>
              <Text style={styles.tipText}>
                "Diğer Tutarlar" butonundan farklı tutarlara erişebilirsiniz.
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: 'bold',
    color: '#374151',
  },

  // Input Section
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: isTablet ? 16 : 18,
    fontSize: isTablet ? 16 : 18,
    fontWeight: '600',
  },
  inputDefault: {
    borderColor: '#D1D5DB',
    backgroundColor: '#ffffff',
  },
  inputSuccess: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },

  // Error
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  errorIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    flex: 1,
  },

  // Quick Selection
  quickSelectionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },

  // Popular Section
  popularSection: {
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },

  // Button Grid
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  quickButton: {
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: isTablet ? 16 : 12,
    paddingVertical: isTablet ? 12 : 14,
    margin: 4,
    minWidth: isTablet ? 80 : 70,
    alignItems: 'center',
  },
  quickButtonDefault: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  quickButtonSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  quickButtonText: {
    fontSize: isTablet ? 14 : 12,
    fontWeight: '600',
  },
  quickButtonTextDefault: {
    color: '#1E40AF',
  },
  quickButtonTextSelected: {
    color: '#ffffff',
  },

  // Other Section
  otherSection: {
    marginTop: 8,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  expandButtonText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '500',
    marginRight: 4,
  },
  expandIcon: {
    fontSize: 12,
    transform: [{ rotate: '0deg' }],
  },
  expandIconRotated: {
    transform: [{ rotate: '180deg' }],
  },

  // Other Buttons
  otherButton: {
    borderWidth: 1,
  },
  otherButtonDefault: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  otherButtonSelected: {
    backgroundColor: '#374151',
    borderColor: '#374151',
  },
  otherButtonTextDefault: {
    color: '#374151',
  },
  otherButtonTextSelected: {
    color: '#ffffff',
  },

  // Clear Button
  clearButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: isTablet ? 12 : 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  clearButtonText: {
    color: '#ffffff',
    fontSize: isTablet ? 14 : 16,
    fontWeight: 'bold',
  },

  // Analysis
  analysisContainer: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  analysisTitle: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 12,
  },
  analysisGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  analysisCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    margin: 6,
    width: isTablet ? '47%' : '47%',
  },
  analysisCardFull: {
    width: isTablet ? '97%' : '97%',
  },
  analysisCardLabel: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
    marginBottom: 4,
  },
  analysisCardValue: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: 'bold',
  },
  infoColor: {
    color: '#1E40AF',
  },
  redColor: {
    color: '#DC2626',
  },
  greenColor: {
    color: '#059669',
  },

  // Tip
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
    marginBottom: 2,
  },
});

export default IncomeInput;