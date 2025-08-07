// components/FixedExpenses.jsx - React Native Version with MockStorage
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
import asyncStorageManager from '../utils/AsyncStorage'; // ✅ Güncel storage

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

function FixedExpenses({ onFixedExpensesChange, onAddToManualExpenses }) {
  const [fixedExpenses, setFixedExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({
    name: '',
    yearlyAmount: '',
    kdvRate: 20,
    hasFatura: true,
  });

  // MockStorage'dan yükleme
  useEffect(() => {
    loadFixedExpenses();
  }, []);

  const loadFixedExpenses = async () => {
    try {
      const stored = await asyncStorageManager.getItem('fixedExpenses');
      const expenses = stored ? JSON.parse(stored) : [];
      console.log('FixedExpenses yüklendi:', expenses);
      setFixedExpenses(expenses);
    } catch (error) {
      console.error('FixedExpenses yükleme hatası:', error);
      setFixedExpenses([]);
    }
  };


  const saveFixedExpenses = async (expenses) => {
    try {
      await asyncStorageManager.setItem('fixedExpenses', JSON.stringify(expenses));
      console.log('FixedExpenses kaydedildi:', expenses);
    } catch (error) {
      console.error('FixedExpenses kaydetme hatası:', error);
    }
  };

  // Aylık masrafları hesapla ve parent'a gönder - SADECE MANUEL EKLENDİĞİNDE
  const calculateMonthlyExpenses = (expenses) => {
    const monthlyExpenses = expenses.map((expense) => ({
      name: expense.name,
      monthlyAmount: Math.round(expense.yearlyAmount / 12), // Aylık tutar
      kdvRate: expense.kdvRate,
      isFixed: true, // Sabit gider olduğunu belirt
      hasFatura: true,
    }));

    console.log('Hesaplanan monthly expenses:', monthlyExpenses);

    // Bu fonksiyon artık sadece manuel eklemede kullanılacak
    // Parent'a otomatik göndermesin
    // if (onFixedExpensesChange) {
    //   onFixedExpensesChange(monthlyExpenses);
    // }

    return monthlyExpenses;
  };

  // Yeni sabit gider ekle
  const handleAddExpense = async () => {
    if (!newExpense.name || !newExpense.yearlyAmount) {
      Alert.alert('Uyarı', 'Lütfen tüm alanları doldurun!');
      return;
    }

    const expense = {
      id: Date.now(),
      name: newExpense.name.trim(),
      yearlyAmount: parseFloat(newExpense.yearlyAmount),
      kdvRate: parseFloat(newExpense.kdvRate),

    };

    const updated = [...fixedExpenses, expense];
    setFixedExpenses(updated);
    await saveFixedExpenses(updated);
    // calculateMonthlyExpenses(updated); // Kaldırdık - otomatik eklemesin

    // Form'u temizle
    setNewExpense({ name: '', yearlyAmount: '', kdvRate: 20 });
    Alert.alert('Başarılı!', 'Sabit gider başarıyla eklendi!');
  };

  // Sabit gider sil
  const handleDeleteExpense = async (id) => {
    Alert.alert(
      'Silme Onayı',
      'Bu sabit gideri silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            const updated = fixedExpenses.filter((expense) => expense.id !== id);
            setFixedExpenses(updated);
            await saveFixedExpenses(updated);
            // calculateMonthlyExpenses(updated); // Kaldırdık - otomatik eklemesin
            Alert.alert('Başarılı!', 'Sabit gider silindi!');
          },
        },
      ]
    );
  };

  // Sabit gideri manuel masraflara ekle
  const handleAddToManual = (expense) => {
    const monthlyAmount = Math.round(expense.yearlyAmount / 12);
    const manualExpense = {
      id: Date.now(),
      name: expense.name,
      amount: monthlyAmount,
      kdvRate: expense.kdvRate,
      hasFatura: true,
    };

    if (onAddToManualExpenses) {
      onAddToManualExpenses(manualExpense);
      Alert.alert(
        'Başarılı!',
        `${expense.name} manuel masraflara eklendi!\nAylık tutar: ${format(monthlyAmount)} ₺`
      );
    }
  };

  const format = (n) => {
    if (!n || isNaN(n)) return '0';
    return n.toLocaleString('tr-TR', { maximumFractionDigits: 2 });
  };

  const totalYearlyAmount = fixedExpenses.reduce(
    (sum, expense) => sum + (expense.yearlyAmount || 0),
    0
  );
  const totalMonthlyAmount = Math.round(totalYearlyAmount / 12);

  // Toplam KDV hesapla
  const totalYearlyKdv = fixedExpenses.reduce((sum, expense) => {
    const kdv = (expense.yearlyAmount || 0) * ((expense.kdvRate || 0) / (100 + (expense.kdvRate || 0)));
    return sum + (isNaN(kdv) ? 0 : kdv);
  }, 0);
  const totalMonthlyKdv = Math.round(totalYearlyKdv / 12);

  // KDV Options
  const kdvOptions = [
    { value: 0, label: '%0', desc: 'Muaf' },
    { value: 1, label: '%1', desc: 'Özel' },
    { value: 10, label: '%10', desc: 'İndirimli' },
    { value: 20, label: '%20', desc: 'Genel' },
  ];

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await loadFixedExpenses();
      setIsLoading(false);
    })();
  }, []);
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>⏳ Sabit giderler yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        {/* Header */}
        <Text style={styles.headerTitle}>💾 Yıllık Sabit Giderler</Text>

        {/* Debug Info */}
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>
            Debug: {fixedExpenses.length} sabit gider, Toplam aylık: {format(totalMonthlyAmount)} ₺
          </Text>
        </View>



        {/* Yeni sabit gider ekleme formu */}
        <View style={styles.formSection}>
          {/* Gider Adı */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Gider Adı</Text>
            <TextInput
              style={styles.input}
              placeholder="Örn: Sigorta, Bakım, Lastik"
              value={newExpense.name}
              onChangeText={(value) => setNewExpense({ ...newExpense, name: value })}
              placeholderTextColor="#9CA3AF"
              returnKeyType="next"
            />
          </View>

          {/* Yıllık Tutar */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Yıllık Tutar (₺)</Text>
            <TextInput
              style={styles.input}
              placeholder="Örn: 12000"
              value={newExpense.yearlyAmount}
              onChangeText={(value) => setNewExpense({ ...newExpense, yearlyAmount: value })}
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              returnKeyType="done"
            />
          </View>

          {/* KDV Oranı - Button Grid */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>KDV Oranı</Text>
            <View style={styles.kdvButtonGrid}>
              {kdvOptions.map((kdvOption) => (
                <TouchableOpacity
                  key={kdvOption.value}
                  onPress={() => setNewExpense({ ...newExpense, kdvRate: kdvOption.value })}
                  style={[
                    styles.kdvButton,
                    newExpense.kdvRate === kdvOption.value ? styles.kdvButtonSelected : styles.kdvButtonDefault
                  ]}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.kdvButtonLabel,
                    newExpense.kdvRate === kdvOption.value ? styles.kdvButtonLabelSelected : styles.kdvButtonLabelDefault
                  ]}>
                    KDV {kdvOption.label}
                  </Text>
                  <Text style={[
                    styles.kdvButtonDesc,
                    newExpense.kdvRate === kdvOption.value ? styles.kdvButtonDescSelected : styles.kdvButtonDescDefault
                  ]}>
                    {kdvOption.desc}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Aylık tutar önizlemesi */}
          {newExpense.yearlyAmount && !isNaN(parseFloat(newExpense.yearlyAmount)) && (
            <View style={styles.previewContainer}>
              <Text style={styles.previewTitle}>📅 Aylık Tutar Önizlemesi:</Text>
              <View style={styles.previewContent}>
                <Text style={styles.previewText}>
                  • Aylık Tutar:{' '}
                  <Text style={styles.previewValue}>
                    {format(parseFloat(newExpense.yearlyAmount) / 12)} ₺
                  </Text>
                </Text>
                {newExpense.kdvRate > 0 && (
                  <Text style={styles.previewText}>
                    • Aylık KDV İndirimi:{' '}
                    <Text style={styles.previewValue}>
                      {format(
                        (parseFloat(newExpense.yearlyAmount) / 12) *
                        (newExpense.kdvRate / (100 + parseFloat(newExpense.kdvRate)))
                      )}{' '}
                      ₺
                    </Text>
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleAddExpense}
            disabled={!newExpense.name || !newExpense.yearlyAmount}
            style={[
              styles.submitButton,
              (!newExpense.name || !newExpense.yearlyAmount) ? styles.submitButtonDisabled : styles.submitButtonEnabled
            ]}
            activeOpacity={(!newExpense.name || !newExpense.yearlyAmount) ? 1 : 0.8}
          >
            <Text style={[
              styles.submitButtonText,
              (!newExpense.name || !newExpense.yearlyAmount) ? styles.submitButtonTextDisabled : styles.submitButtonTextEnabled
            ]}>
              Sabit Gider Ekle
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sabit giderler listesi */}
        {fixedExpenses.length > 0 && (
          <View style={styles.expensesList}>
            <Text style={styles.listTitle}>📋 Kayıtlı Sabit Giderler:</Text>

            {fixedExpenses.map((expense) => {
              const yearlyKdv = (expense.yearlyAmount || 0) * ((expense.kdvRate || 0) / (100 + (expense.kdvRate || 0)));
              const monthlyKdv = Math.round(yearlyKdv / 12);
              const monthlyAmount = Math.round((expense.yearlyAmount || 0) / 12);

              return (
                <View key={expense.id} style={styles.expenseItem}>
                  {/* Expense Info */}
                  <View style={styles.expenseInfo}>
                    <Text style={styles.expenseName}>{expense.name}</Text>

                    <View style={styles.expenseAmounts}>
                      <Text style={styles.expenseYearly}>
                        Yıllık: <Text style={styles.expenseYearlyValue}>{format(expense.yearlyAmount)} ₺</Text>
                      </Text>
                      <Text style={styles.expenseMonthly}>
                        Aylık: <Text style={styles.expenseMonthlyValue}>{format(monthlyAmount)} ₺</Text>
                      </Text>
                      {expense.kdvRate > 0 && (
                        <Text style={styles.expenseKdv}>
                          KDV %{expense.kdvRate} = {format(monthlyKdv)} ₺/ay
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      onPress={() => handleAddToManual(expense)}
                      style={styles.addButton}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.addButtonText}>
                        {isTablet ? 'Manuel Listeye Ekle' : 'Ekle'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleDeleteExpense(expense.id)}
                      style={styles.deleteButton}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.deleteButtonText}>Sil</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}

            {/* Toplam */}
            <View style={styles.totalContainer}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Toplam Sabit Giderler:</Text>
                <View style={styles.totalValues}>
                  <Text style={styles.totalYearly}>{format(totalYearlyAmount)} ₺/yıl</Text>
                  <Text style={styles.totalMonthly}>{format(totalMonthlyAmount)} ₺/ay</Text>
                </View>
              </View>

              {totalMonthlyKdv > 0 && (
                <View style={[styles.totalRow, styles.kdvRow]}>
                  <Text style={styles.kdvLabel}>Toplam İndirilecek KDV:</Text>
                  <View style={styles.totalValues}>
                    <Text style={styles.kdvYearly}>{format(totalYearlyKdv)} ₺/yıl</Text>
                    <Text style={styles.kdvMonthly}>{format(totalMonthlyKdv)} ₺/ay</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Açıklama */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>🤔 Nasıl Çalışır:</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoText}>
              • Yıllık sabit giderlerinizi buraya kaydedin (sigorta, rutin bakım, lastik vb.)
            </Text>
            <Text style={styles.infoText}>
              • Bu giderler sadece burada görünür ve aylık tutarları hesaplanır
            </Text>
            <Text style={styles.infoText}>
              • "Ekle" butonu ile aylık tutarları kolayca manuel masraflara ekleyebilirsiniz
            </Text>
          </View>
        </View>
      </View>
    </View>
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

  // Debug
  debugContainer: {
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  debugText: {
    fontSize: 12,
    color: '#1E40AF',
  },

  // Header
  headerTitle: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 24,
  },

  // Form Section
  formSection: {
    marginBottom: 24,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: isTablet ? 12 : 18,
    fontSize: isTablet ? 14 : 16,
    backgroundColor: '#ffffff',
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
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  previewContent: {
    gap: 4,
  },
  previewText: {
    fontSize: isTablet ? 14 : 12,
    color: '#1E40AF',
  },
  previewValue: {
    fontWeight: '600',
  },

  // Submit Button
  submitButton: {
    borderRadius: 12,
    paddingVertical: isTablet ? 12 : 18,
    alignItems: 'center',
  },
  submitButtonEnabled: {
    backgroundColor: '#3B82F6',
  },
  submitButtonDisabled: {
    backgroundColor: '#D1D5DB',
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

  // Expenses List
  expensesList: {
    marginBottom: 24,
  },
  listTitle: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  expenseItem: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  expenseInfo: {
    marginBottom: 12,
  },
  expenseName: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  expenseAmounts: {
    gap: 4,
  },
  expenseYearly: {
    fontSize: isTablet ? 14 : 12,
    color: '#6B7280',
  },
  expenseYearlyValue: {
    fontWeight: '600',
    color: '#374151',
  },
  expenseMonthly: {
    fontSize: isTablet ? 14 : 12,
    color: '#2563EB',
  },
  expenseMonthlyValue: {
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  expenseKdv: {
    fontSize: 12,
    color: '#059669',
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  addButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flex: 1,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: isTablet ? 12 : 14,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 60,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: isTablet ? 12 : 14,
    fontWeight: '600',
  },

  // Total Container
  totalContainer: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  kdvRow: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#BFDBFE',
  },
  totalLabel: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  kdvLabel: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
    color: '#059669',
  },
  totalValues: {
    alignItems: 'flex-end',
  },
  totalYearly: {
    fontSize: 12,
    color: '#1E40AF',
  },
  totalMonthly: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  kdvYearly: {
    fontSize: 12,
    color: '#059669',
  },
  kdvMonthly: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: 'bold',
    color: '#059669',
  },

  // Info Container
  infoContainer: {
    backgroundColor: '#EFF6FF',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    borderRadius: 8,
    padding: 16,
  },
  infoTitle: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 12,
  },
  infoContent: {
    gap: 8,
  },
  infoText: {
    fontSize: isTablet ? 14 : 12,
    color: '#1E40AF',
    lineHeight: 18,
  },
});

export default FixedExpenses;