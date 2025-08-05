// AddExpenseForm.jsx - React Native Version with Fatura Feature
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

const AddExpenseForm = ({ onAddExpense }) => {
  const [expense, setExpense] = useState({
    name: '',
    amount: '',
    kdvRate: 20,
    hasFatura: true, // Varsayılan olarak fatura var
  });

  const handleSubmit = () => {
    if (!expense.name.trim()) {
      Alert.alert('Uyarı', 'Lütfen masraf adını girin!');
      return;
    }

    if (!expense.amount || isNaN(parseFloat(expense.amount))) {
      Alert.alert('Uyarı', 'Lütfen geçerli bir tutar girin!');
      return;
    }

    const newExpense = {
      name: expense.name.trim(),
      amount: parseFloat(expense.amount),
      kdvRate: parseFloat(expense.kdvRate),
      hasFatura: expense.hasFatura,
    };

    console.log('Yeni masraf ekleniyor:', newExpense);

    if (onAddExpense) {
      onAddExpense(newExpense);
    }

    // Form'u temizle
    setExpense({
      name: '',
      amount: '',
      kdvRate: 20,
      hasFatura: true,
    });

    Alert.alert('Başarılı!', 'Masraf başarıyla eklendi!');
  };

  const format = (amount) => {
    if (!amount || isNaN(amount)) return '0';
    return parseFloat(amount).toLocaleString('tr-TR', { maximumFractionDigits: 2 });
  };

  // KDV Seçenekleri
  const kdvOptions = [
    { value: 0, label: '%0', desc: 'Muaf', color: '#6B7280' },
    { value: 1, label: '%1', desc: 'Özel', color: '#8B5CF6' },
    { value: 10, label: '%10', desc: 'İndirimli', color: '#F59E0B' },
    { value: 20, label: '%20', desc: 'Genel', color: '#EF4444' },
  ];

  // KDV Hesaplama (fatura durumuna göre)
  const calculateKdv = () => {
    const amount = parseFloat(expense.amount) || 0;
    if (!expense.hasFatura || expense.kdvRate === 0) return 0;
    
    // Fatura varsa: KDV dahil tutardan KDV'yi çıkar
    return (amount * expense.kdvRate) / (100 + expense.kdvRate);
  };

  const kdvAmount = calculateKdv();
  const netAmount = (parseFloat(expense.amount) || 0) - kdvAmount;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💸 Masraf Ekle</Text>

      {/* Masraf Adı */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Masraf Adı</Text>
        <TextInput
          style={styles.input}
          placeholder="Örn: Yakıt, Yol Ücreti, Bakım"
          value={expense.name}
          onChangeText={(value) => setExpense({ ...expense, name: value })}
          placeholderTextColor="#9CA3AF"
          returnKeyType="next"
        />
      </View>

      {/* Tutar */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Tutar (₺)</Text>
        <TextInput
          style={styles.input}
          placeholder="Örn: 500"
          value={expense.amount}
          onChangeText={(value) => setExpense({ ...expense, amount: value })}
          placeholderTextColor="#9CA3AF"
          keyboardType="numeric"
          returnKeyType="done"
        />
      </View>

      {/* Fatura Durumu */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Fatura Durumu</Text>
        <View style={styles.faturaButtonContainer}>
          <TouchableOpacity
            style={[
              styles.faturaButton,
              expense.hasFatura ? styles.faturaButtonActive : styles.faturaButtonInactive
            ]}
            onPress={() => setExpense({ ...expense, hasFatura: true })}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.faturaButtonText,
              expense.hasFatura ? styles.faturaButtonTextActive : styles.faturaButtonTextInactive
            ]}>
              🧾 Fatura Var
            </Text>
            <Text style={[
              styles.faturaButtonDesc,
              expense.hasFatura ? styles.faturaButtonDescActive : styles.faturaButtonDescInactive
            ]}>
              KDV indirilebilir
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.faturaButton,
              !expense.hasFatura ? styles.faturaButtonActive : styles.faturaButtonInactive
            ]}
            onPress={() => setExpense({ ...expense, hasFatura: false, kdvRate: 0 })}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.faturaButtonText,
              !expense.hasFatura ? styles.faturaButtonTextActive : styles.faturaButtonTextInactive
            ]}>
              💰 Fatura Yok
            </Text>
            <Text style={[
              styles.faturaButtonDesc,
              !expense.hasFatura ? styles.faturaButtonDescActive : styles.faturaButtonDescInactive
            ]}>
              KDV indirilemez
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* KDV Oranı - Sadece fatura varsa */}
      {expense.hasFatura && (
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>KDV Oranı</Text>
          <View style={styles.kdvGrid}>
            {kdvOptions.map((kdvOption) => (
              <TouchableOpacity
                key={kdvOption.value}
                style={[
                  styles.kdvButton,
                  expense.kdvRate === kdvOption.value ? styles.kdvButtonActive : styles.kdvButtonInactive,
                  { borderColor: kdvOption.color }
                ]}
                onPress={() => setExpense({ ...expense, kdvRate: kdvOption.value })}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.kdvButtonLabel,
                  expense.kdvRate === kdvOption.value ? { color: kdvOption.color } : styles.kdvButtonLabelInactive
                ]}>
                  KDV {kdvOption.label}
                </Text>
                <Text style={[
                  styles.kdvButtonDesc,
                  expense.kdvRate === kdvOption.value ? { color: kdvOption.color } : styles.kdvButtonDescInactive
                ]}>
                  {kdvOption.desc}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Hesaplama Önizlemesi */}
      {expense.amount && !isNaN(parseFloat(expense.amount)) && (
        <View style={styles.previewContainer}>
          <Text style={styles.previewTitle}>📊 Hesaplama Önizlemesi:</Text>
          <View style={styles.previewContent}>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Girilen Tutar:</Text>
              <Text style={styles.previewValue}>{format(expense.amount)} ₺</Text>
            </View>
            
            {expense.hasFatura && expense.kdvRate > 0 ? (
              <>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>KDV Tutarı (İndirilecek):</Text>
                  <Text style={[styles.previewValue, styles.kdvValue]}>
                    {format(kdvAmount)} ₺
                  </Text>
                </View>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Net Masraf:</Text>
                  <Text style={styles.previewValue}>{format(netAmount)} ₺</Text>
                </View>
              </>
            ) : (
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Net Masraf:</Text>
                <Text style={styles.previewValue}>{format(expense.amount)} ₺</Text>
              </View>
            )}
            
            <View style={styles.previewNote}>
              <Text style={styles.previewNoteText}>
                {expense.hasFatura 
                  ? `✅ Fatura var - KDV ${expense.kdvRate > 0 ? 'indirilebilir' : 'muaf'}`
                  : '❌ Fatura yok - KDV indirilemez'
                }
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Submit Button */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          (!expense.name.trim() || !expense.amount) ? styles.submitButtonDisabled : styles.submitButtonEnabled
        ]}
        onPress={handleSubmit}
        disabled={!expense.name.trim() || !expense.amount}
        activeOpacity={(!expense.name.trim() || !expense.amount) ? 1 : 0.8}
      >
        <Text style={[
          styles.submitButtonText,
          (!expense.name.trim() || !expense.amount) ? styles.submitButtonTextDisabled : styles.submitButtonTextEnabled
        ]}>
          Masraf Ekle
        </Text>
      </TouchableOpacity>

      {/* Bilgilendirme */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoIcon}>💡</Text>
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Fatura Kuralları:</Text>
          <Text style={styles.infoText}>
            • <Text style={styles.infoBold}>Fatura Var:</Text> KDV dahil tutar girin, KDV otomatik hesaplanır{'\n'}
            • <Text style={styles.infoBold}>Fatura Yok:</Text> Net tutarı girin, KDV indirimi yoktur
          </Text>
        </View>
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

  // Form Fields
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 18,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#374151',
  },

  // Fatura Buttons
  faturaButtonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  faturaButton: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  faturaButtonActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  faturaButtonInactive: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  faturaButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  faturaButtonTextActive: {
    color: '#1E40AF',
  },
  faturaButtonTextInactive: {
    color: '#6B7280',
  },
  faturaButtonDesc: {
    fontSize: 12,
  },
  faturaButtonDescActive: {
    color: '#3B82F6',
  },
  faturaButtonDescInactive: {
    color: '#9CA3AF',
  },

  // KDV Grid
  kdvGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  kdvButton: {
    width: '48%',
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  kdvButtonActive: {
    backgroundColor: '#F9FAFB',
  },
  kdvButtonInactive: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  kdvButtonLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  kdvButtonLabelInactive: {
    color: '#6B7280',
  },
  kdvButtonDesc: {
    fontSize: 10,
  },
  kdvButtonDescInactive: {
    color: '#9CA3AF',
  },

  // Preview
  previewContainer: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#15803D',
    marginBottom: 12,
  },
  previewContent: {
    gap: 8,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 13,
    color: '#166534',
  },
  previewValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#166534',
  },
  kdvValue: {
    color: '#059669',
  },
  previewNote: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
  },
  previewNoteText: {
    fontSize: 12,
    color: '#15803D',
    textAlign: 'center',
  },

  // Submit Button
  submitButton: {
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonEnabled: {
    backgroundColor: '#3B82F6',
  },
  submitButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButtonTextEnabled: {
    color: '#ffffff',
  },
  submitButtonTextDisabled: {
    color: '#9CA3AF',
  },

  // Info
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#92400E',
    lineHeight: 16,
  },
  infoBold: {
    fontWeight: '600',
  },
});

export default AddExpenseForm;