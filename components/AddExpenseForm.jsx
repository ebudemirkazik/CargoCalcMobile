// components/AddExpenseForm.jsx - React Native Version (Fixed)
import React, { useState } from 'react';
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
// Picker import'unu kaldırdık - custom buttons kullanacağız

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

function AddExpenseForm({ onAddExpense }) {
  const [expense, setExpense] = useState({
    name: '',
    amount: '',
    kdvRate: 20,
  });

  const [errors, setErrors] = useState({});

  // Hızlı masraf şablonları
  const quickExpenses = [
    { name: 'Yakıt', kdvRate: 20, icon: '⛽' },
    { name: 'Yol', kdvRate: 20, icon: '🛣️' },
    { name: 'Bakım', kdvRate: 20, icon: '🔧' },
    { name: 'Yemek', kdvRate: 10, icon: '🍽️' },
    { name: 'Sigorta', kdvRate: 20, icon: '🛡️' },
    { name: 'Lastik', kdvRate: 20, icon: '🔘' },
  ];

  // Masraf adı validasyonu - sadece harfler, boşluk ve Türkçe karakterler
  const validateName = (name) => {
    const nameRegex = /^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/;
    if (!name.trim()) {
      return 'Masraf adı boş olamaz';
    }
    if (name.trim().length < 2) {
      return 'Masraf adı en az 2 karakter olmalı';
    }
    if (!nameRegex.test(name.trim())) {
      return 'Masraf adında sadece harfler kullanılabilir';
    }
    return null;
  };

  // Tutar validasyonu - sadece sayılar ve ondalık
  const validateAmount = (amount) => {
    if (!amount) {
      return 'Tutar boş olamaz';
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) {
      return 'Geçerli bir sayı giriniz';
    }
    if (numAmount <= 0) {
      return 'Tutar 0\'dan büyük olmalı';
    }
    if (numAmount > 1000000) {
      return 'Tutar çok büyük (max: 1.000.000₺)';
    }
    return null;
  };

  // Input değişiklikleri
  const handleNameChange = (value) => {
    setExpense({ ...expense, name: value });

    // Gerçek zamanlı validasyon
    const error = validateName(value);
    setErrors({ ...errors, name: error });
  };

  const handleAmountChange = (value) => {
    // Sadece sayı, nokta ve virgül kabul et
    value = value.replace(/[^0-9.,]/g, '');
    // Virgülü noktaya çevir
    value = value.replace(',', '.');
    // Birden fazla nokta varsa sadece ilkini bırak
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }

    setExpense({ ...expense, amount: value });

    // Gerçek zamanlı validasyon
    const error = validateAmount(value);
    setErrors({ ...errors, amount: error });
  };

  // Hızlı masraf seçimi - KDV rate'i de güncelle
  const handleQuickExpense = (quickExpense) => {
    setExpense({
      name: quickExpense.name,
      amount: expense.amount, // Mevcut tutarı koru
      kdvRate: quickExpense.kdvRate, // KDV oranını güncelle
    });

    // Name error'ını temizle
    setErrors({ ...errors, name: null });
  };

  const handleSubmit = () => {
    // Tüm alanları valide et
    const nameError = validateName(expense.name);
    const amountError = validateAmount(expense.amount);

    if (nameError || amountError) {
      setErrors({
        name: nameError,
        amount: amountError,
      });
      return;
    }

    // Temiz veri oluştur
    const cleanExpense = {
      name: expense.name.trim(),
      amount: parseFloat(expense.amount),
      kdvRate: parseFloat(expense.kdvRate),
    };

    onAddExpense(cleanExpense);

    // Toast benzeri Alert göster
    Alert.alert(
      'Başarılı! ✅',
      `${cleanExpense.name} masrafı eklendi!\nTutar: ${format(cleanExpense.amount)} ₺\nKDV: %${cleanExpense.kdvRate}`,
      [{ text: 'Tamam', style: 'default' }]
    );

    // Formu temizle
    setExpense({ name: '', amount: '', kdvRate: 20 });
    setErrors({});
  };

  const format = (n) => n.toLocaleString('tr-TR', { maximumFractionDigits: 2 });

  const getInputStyle = (hasError) => {
    if (hasError) {
      return [styles.input, styles.inputError];
    }
    return [styles.input, styles.inputDefault];
  };

  const isFormValid = expense.name && expense.amount && !errors.name && !errors.amount;

  // KDV hesaplama fonksiyonu
  const calculateKdv = () => {
    if (!expense.amount || isNaN(parseFloat(expense.amount)) || expense.kdvRate <= 0) {
      return null;
    }

    const amount = parseFloat(expense.amount);
    const kdvRate = parseFloat(expense.kdvRate);
    
    // KDV tutarı hesaplama (dahil KDV'den KDV payını çıkarma)
    const kdvAmount = amount * (kdvRate / (100 + kdvRate));
    const netAmount = amount - kdvAmount;

    return {
      kdvAmount,
      netAmount,
      totalAmount: amount
    };
  };

  const kdvCalculation = calculateKdv();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        {/* Header */}
        <Text style={styles.headerTitle}>Yeni Masraf Ekle</Text>

        {/* Hızlı Masraf Seçimi */}
        <View style={styles.quickSelectionSection}>
          <Text style={styles.sectionTitle}>Hızlı Seçim:</Text>
          <View style={styles.quickButtonGrid}>
            {quickExpenses.map((quick) => (
              <TouchableOpacity
                key={quick.name}
                onPress={() => handleQuickExpense(quick)}
                style={[
                  styles.quickButton,
                  expense.name === quick.name ? styles.quickButtonSelected : styles.quickButtonDefault
                ]}
                activeOpacity={0.7}
              >
                <Text style={styles.quickButtonIcon}>{quick.icon}</Text>
                <Text style={[
                  styles.quickButtonText,
                  expense.name === quick.name ? styles.quickButtonTextSelected : styles.quickButtonTextDefault
                ]}>
                  {quick.name}
                </Text>
                <Text style={styles.quickButtonKdv}>KDV %{quick.kdvRate}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          {/* Masraf Adı */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Masraf Adı</Text>
            <TextInput
              style={getInputStyle(errors.name)}
              placeholder="Örn: Yakıt, Bakım, Yol"
              value={expense.name}
              onChangeText={handleNameChange}
              placeholderTextColor="#9CA3AF"
              maxLength={50}
              returnKeyType="next"
            />
            {errors.name && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{errors.name}</Text>
              </View>
            )}
          </View>

          {/* Tutar */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Tutar (₺)</Text>
            <TextInput
              style={getInputStyle(errors.amount)}
              placeholder="Örn: 1500"
              value={expense.amount}
              onChangeText={handleAmountChange}
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              returnKeyType="done"
            />
            {errors.amount && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{errors.amount}</Text>
              </View>
            )}
          </View>

          {/* KDV Oranı - Custom Button Selector */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>KDV Oranı</Text>
            <View style={styles.kdvButtonGrid}>
              {[
                { value: 0, label: '%0', desc: 'Muaf' },
                { value: 1, label: '%1', desc: 'Özel' },
                { value: 10, label: '%10', desc: 'İndirimli' },
                { value: 20, label: '%20', desc: 'Genel' },
              ].map((kdvOption) => (
                <TouchableOpacity
                  key={kdvOption.value}
                  onPress={() => setExpense({ ...expense, kdvRate: kdvOption.value })}
                  style={[
                    styles.kdvButton,
                    expense.kdvRate === kdvOption.value ? styles.kdvButtonSelected : styles.kdvButtonDefault
                  ]}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.kdvButtonLabel,
                    expense.kdvRate === kdvOption.value ? styles.kdvButtonLabelSelected : styles.kdvButtonLabelDefault
                  ]}>
                    KDV {kdvOption.label}
                  </Text>
                  <Text style={[
                    styles.kdvButtonDesc,
                    expense.kdvRate === kdvOption.value ? styles.kdvButtonDescSelected : styles.kdvButtonDescDefault
                  ]}>
                    {kdvOption.desc}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* KDV Hesaplama Önizleme */}
          {kdvCalculation && (
            <View style={styles.previewContainer}>
              <View style={styles.previewHeader}>
                <Text style={styles.previewIcon}>🧮</Text>
                <Text style={styles.previewTitle}>KDV Hesaplaması:</Text>
              </View>
              <View style={styles.previewContent}>
                <Text style={styles.previewText}>
                  • KDV Tutarı:{' '}
                  <Text style={styles.previewValue}>
                    {format(kdvCalculation.kdvAmount)} ₺
                  </Text>
                </Text>
                <Text style={styles.previewText}>
                  • Net Tutar:{' '}
                  <Text style={styles.previewValue}>
                    {format(kdvCalculation.netAmount)} ₺
                  </Text>
                </Text>
                <View style={styles.previewDivider} />
                <Text style={styles.previewTextBold}>
                  • Toplam Masraf:{' '}
                  <Text style={styles.previewValueBold}>
                    {format(kdvCalculation.totalAmount)} ₺
                  </Text>
                </Text>
              </View>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!isFormValid}
            style={[
              styles.submitButton,
              isFormValid ? styles.submitButtonEnabled : styles.submitButtonDisabled
            ]}
            activeOpacity={isFormValid ? 0.8 : 1}
          >
            <View style={styles.submitButtonContent}>
              <Text style={styles.submitButtonIcon}>
                {isFormValid ? '➕' : '⚠️'}
              </Text>
              <Text style={[
                styles.submitButtonText,
                isFormValid ? styles.submitButtonTextEnabled : styles.submitButtonTextDisabled
              ]}>
                {isFormValid ? 'Masrafı Ekle' : 'Bilgileri Tamamlayın'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Mobil İpucu */}
        {!isTablet && (
          <View style={styles.tipContainer}>
            <Text style={styles.tipIcon}>💡</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>İpucu:</Text>
              <Text style={styles.tipText}>
                Hızlı seçim butonlarını kullanarak yaygın masrafları kolayca
                ekleyebilirsiniz. Her buton otomatik olarak uygun KDV oranını seçer.
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
  quickButtonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  quickButton: {
    borderWidth: 2,
    borderRadius: 12,
    padding: isTablet ? 12 : 16,
    margin: 6,
    alignItems: 'center',
    minWidth: isTablet ? '30%' : '45%',
    maxWidth: isTablet ? '30%' : '45%',
  },
  quickButtonDefault: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  quickButtonSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  quickButtonIcon: {
    fontSize: isTablet ? 20 : 24,
    marginBottom: 4,
  },
  quickButtonText: {
    fontSize: isTablet ? 12 : 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  quickButtonTextDefault: {
    color: '#374151',
  },
  quickButtonTextSelected: {
    color: '#1E40AF',
  },
  quickButtonKdv: {
    fontSize: 10,
    color: '#6B7280',
  },

  // Form Section
  formSection: {
    gap: 20,
  },
  fieldContainer: {
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: isTablet ? 12 : 18,
    fontSize: isTablet ? 14 : 16,
  },
  inputDefault: {
    borderColor: '#D1D5DB',
    backgroundColor: '#ffffff',
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
    fontSize: 14,
    marginRight: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    flex: 1,
  },

  // KDV Button Grid
  kdvButtonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  kdvButton: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    margin: 4,
    alignItems: 'center',
    minWidth: isTablet ? '22%' : '45%',
    maxWidth: isTablet ? '24%' : '48%',
  },
  kdvButtonDefault: {
    backgroundColor: '#F3F4F6',
    borderColor: '#D1D5DB',
  },
  kdvButtonSelected: {
    backgroundColor: '#DBEAFE',
    borderColor: '#3B82F6',
  },
  kdvButtonLabel: {
    fontSize: isTablet ? 14 : 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  kdvButtonLabelDefault: {
    color: '#374151',
  },
  kdvButtonLabelSelected: {
    color: '#1E40AF',
  },
  kdvButtonDesc: {
    fontSize: 10,
    fontWeight: '400',
  },
  kdvButtonDescDefault: {
    color: '#6B7280',
  },
  kdvButtonDescSelected: {
    color: '#1E40AF',
  },

  // Preview
  previewContainer: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    padding: 16,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  previewTitle: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
    color: '#1E40AF',
  },
  previewContent: {
    gap: 6,
  },
  previewText: {
    fontSize: isTablet ? 14 : 12,
    color: '#1E40AF',
  },
  previewTextBold: {
    fontSize: isTablet ? 14 : 12,
    color: '#1E40AF',
    fontWeight: '600',
  },
  previewValue: {
    fontWeight: '600',
  },
  previewValueBold: {
    fontWeight: 'bold',
  },
  previewDivider: {
    height: 1,
    backgroundColor: '#BFDBFE',
    marginVertical: 4,
  },

  // Submit Button
  submitButton: {
    borderRadius: 12,
    paddingVertical: isTablet ? 12 : 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginTop: 8,
  },
  submitButtonEnabled: {
    backgroundColor: '#3B82F6',
  },
  submitButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitButtonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  submitButtonText: {
    fontSize: isTablet ? 14 : 16,
    fontWeight: 'bold',
  },
  submitButtonTextEnabled: {
    color: '#ffffff',
  },
  submitButtonTextDisabled: {
    color: '#9CA3AF',
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
    marginTop: 16,
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

export default AddExpenseForm;