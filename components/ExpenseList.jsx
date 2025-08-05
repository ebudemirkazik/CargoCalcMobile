// ExpenseList.jsx - React Native Version with Working Delete
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

const ExpenseList = ({ expenses, fixedExpenses = [], onDeleteExpense }) => {

  const handleDelete = (expenseId) => {
    Alert.alert(
      'Masrafı Sil',
      'Bu masrafı silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            console.log('ExpenseList: Silme işlemi başlatıldı, ID:', expenseId);
            if (onDeleteExpense) {
              onDeleteExpense(expenseId);
            } else {
              console.error('onDeleteExpense prop bulunamadı!');
            }
          },
        },
      ]
    );
  };

  const format = (amount) => {
    if (!amount || isNaN(amount)) return '0';
    return amount.toLocaleString('tr-TR', { maximumFractionDigits: 2 });
  };

  // Toplam hesaplamaları - Gizli masraflar ayrı
  const visibleExpenses = Array.isArray(expenses) ? expenses.filter(expense =>
    !expense.isHiddenFromVisible && expense.name.toLowerCase() !== 'fatura'
  ) : [];

  const hiddenExpenses = Array.isArray(expenses) ? expenses.filter(expense =>
    expense.isHiddenFromVisible || expense.name.toLowerCase() === 'fatura'
  ) : [];

  const totalExpenseAmount = visibleExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const totalExpenseKdv = Array.isArray(expenses) ? expenses.reduce((sum, expense) => {
    if (!expense.hasFatura) return sum;

    const rate = expense.kdvRate || 0;
    const amount = expense.amount || 0;
    const kdv = (amount * rate) / (100 + rate);

    return sum + kdv;
  }, 0) : 0;

  const totalFixedAmount = Array.isArray(fixedExpenses) ? fixedExpenses.reduce((sum, expense) => sum + (expense.monthlyAmount || 0), 0) : 0;
  const totalFixedKdv = Array.isArray(fixedExpenses) ? fixedExpenses.reduce((sum, expense) => {
    const rate = expense.kdvRate || 0;
    const amount = expense.monthlyAmount || 0;
    const kdv = (amount * rate) / (100 + rate);

    return sum + kdv;
  }, 0) : 0;

  const grandTotalAmount = totalExpenseAmount + totalFixedAmount;
  const grandTotalKdv = totalExpenseKdv + totalFixedKdv;

  console.log('ExpenseList render:', {
    expensesCount: expenses?.length || 0,
    fixedExpensesCount: fixedExpenses?.length || 0,
    totalExpenseAmount,
    onDeleteExpense: !!onDeleteExpense
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📄 Masraflar</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{(expenses?.length || 0) + (fixedExpenses?.length || 0)}</Text>
        </View>
      </View>

      {(expenses?.length === 0 && fixedExpenses?.length === 0) ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>💸</Text>
          <Text style={styles.emptyText}>Henüz masraf eklenmemiş</Text>
          <Text style={styles.emptySubtext}>Yukarıdaki formdan masraf ekleyin</Text>
        </View>
      ) : (
        <View style={styles.expensesList}>

          {/* Elle Eklenen Masraflar - Görünür */}
          {visibleExpenses && visibleExpenses.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Elle Eklenen Masraflar:</Text>

              {visibleExpenses.map((expense) => {
                const kdvAmount = expense.hasFatura ? ((expense.amount || 0) * (expense.kdvRate || 0)) / 100 : 0;

                return (
                  <View key={expense.id} style={styles.expenseItem}>
                    <View style={styles.expenseInfo}>
                      <View style={styles.expenseHeader}>
                        <Text style={styles.expenseName}>{expense.name}</Text>
                        <View style={[
                          styles.faturaStatus,
                          expense.hasFatura ? styles.faturaStatusActive : styles.faturaStatusInactive
                        ]}>
                          <Text style={[
                            styles.faturaStatusText,
                            expense.hasFatura ? styles.faturaStatusTextActive : styles.faturaStatusTextInactive
                          ]}>
                            {expense.hasFatura ? '🧾 Faturalı' : '💰 Faturasız'}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.expenseAmount}>{format(expense.amount)} ₺</Text>
                      {expense.hasFatura && expense.kdvRate > 0 && (
                        <Text style={styles.expenseKdv}>
                          KDV %{expense.kdvRate} = {format(kdvAmount)} ₺ (İndirilecek)
                        </Text>
                      )}
                      {!expense.hasFatura && (
                        <Text style={styles.expenseNoKdv}>
                          KDV indirimi yok
                        </Text>
                      )}
                    </View>

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDelete(expense.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.deleteButtonText}>Sil</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}

          {/* Gizli Masraflar - Sadece vergi hesaplamalarında kullanılıyor */}
          {hiddenExpenses && hiddenExpenses.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔒 Gizli Masraflar (Sadece Vergi Hesabında):</Text>

              {hiddenExpenses.map((expense) => {
                const kdvAmount = expense.hasFatura ? ((expense.amount || 0) * (expense.kdvRate || 0)) / 100 : 0;

                return (
                  <View key={expense.id} style={[styles.expenseItem, styles.hiddenExpenseItem]}>
                    <View style={styles.expenseInfo}>
                      <View style={styles.expenseHeader}>
                        <Text style={styles.expenseName}>{expense.name}</Text>
                        <View style={styles.hiddenBadge}>
                          <Text style={styles.hiddenBadgeText}>🔒 Gizli</Text>
                        </View>
                      </View>

                      <Text style={styles.expenseAmount}>{format(expense.amount)} ₺</Text>
                      {expense.hasFatura && expense.kdvRate > 0 && (
                        <Text style={styles.expenseKdv}>
                          KDV %{expense.kdvRate} = {format(kdvAmount)} ₺ (İndirilecek)
                        </Text>
                      )}
                      <Text style={styles.hiddenNote}>
                        Görünür masraflara dahil değil, sadece vergi hesabında kullanılıyor
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDelete(expense.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.deleteButtonText}>Sil</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}

          {/* Sabit Giderler (sadece görüntüleme) */}
          {fixedExpenses && fixedExpenses.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sabit Giderler (Aylık):</Text>

              {fixedExpenses.map((expense, idx) => {
                const kdvAmount = ((expense.monthlyAmount || 0) * (expense.kdvRate || 0)) / 100;

                return (
                  <View key={`fixed-${idx}`} style={[styles.expenseItem, styles.fixedExpenseItem]}>
                    <View style={styles.expenseInfo}>
                      <Text style={styles.expenseName}>{expense.name}</Text>
                      <Text style={styles.expenseAmount}>{format(expense.monthlyAmount)} ₺</Text>
                      {expense.kdvRate > 0 && (
                        <Text style={styles.expenseKdv}>
                          KDV %{expense.kdvRate} = {format(kdvAmount)} ₺
                        </Text>
                      )}
                    </View>

                    <View style={styles.fixedBadge}>
                      <Text style={styles.fixedBadgeText}>Sabit</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Toplam */}
          <View style={styles.totalSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Ara Toplam:</Text>
              <Text style={styles.totalValue}>{format(grandTotalAmount)} ₺</Text>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Toplam KDV:</Text>
              <Text style={[styles.totalValue, styles.kdvValue]}>{format(grandTotalKdv)} ₺</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.grandTotalLabel}>Toplam Aylık Masraf:</Text>
              <Text style={styles.grandTotalValue}>{format(grandTotalAmount)} ₺</Text>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.grandTotalLabel}>Toplam İndirilecek KDV:</Text>
              <Text style={[styles.grandTotalValue, styles.kdvValue]}>{format(grandTotalKdv)} ₺</Text>
            </View>
          </View>

          {/* İpucu */}
          <View style={styles.tipContainer}>
            <Text style={styles.tipIcon}>💡</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>İpucu:</Text>
              <Text style={styles.tipText}>
                Masraf silmek için "Sil" butonuna dokunun. Silme işlemi kesindir ve geri alınamaz.
              </Text>
            </View>
          </View>

          {/* Debug Info */}
          <View style={styles.debugContainer}>
            <Text style={styles.debugText}>
              Debug: Görünür={visibleExpenses?.length || 0}, Gizli={hiddenExpenses?.length || 0},
              Sabit={fixedExpenses?.length || 0}, Toplam={format(grandTotalAmount)}₺, KDV={format(grandTotalKdv)}₺
            </Text>
          </View>
        </View>
      )}
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

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  badge: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
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

  // Expenses List
  expensesList: {
    // maxHeight kaldırıldı - artık scroll yok
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },

  // Expense Item
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  fixedExpenseItem: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FCD34D',
  },
  hiddenExpenseItem: {
    backgroundColor: '#F3E8FF',
    borderColor: '#C4B5FD',
    borderWidth: 2,
  },
  expenseInfo: {
    flex: 1,
    marginRight: 12,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  expenseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },

  // Fatura Status
  faturaStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  faturaStatusActive: {
    backgroundColor: '#D1FAE5',
  },
  faturaStatusInactive: {
    backgroundColor: '#FEE2E2',
  },
  faturaStatusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  faturaStatusTextActive: {
    color: '#065F46',
  },
  faturaStatusTextInactive: {
    color: '#991B1B',
  },

  expenseAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  expenseKdv: {
    fontSize: 12,
    color: '#059669',
  },
  expenseNoKdv: {
    fontSize: 12,
    color: '#DC2626',
  },
  hiddenNote: {
    fontSize: 11,
    color: '#7C3AED',
    fontStyle: 'italic',
    marginTop: 4,
  },

  // Hidden Badge
  hiddenBadge: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  hiddenBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },

  // Delete Button
  deleteButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Fixed Badge
  fixedBadge: {
    backgroundColor: '#D97706',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  fixedBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },

  // Total Section
  totalSection: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  totalLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  grandTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  kdvValue: {
    color: '#059669',
  },
  divider: {
    height: 1,
    backgroundColor: '#D1D5DB',
    marginVertical: 8,
  },

  // Tip Container
  tipContainer: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  tipIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 16,
  },

  // Debug Container
  debugContainer: {
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  debugText: {
    fontSize: 12,
    color: '#1E40AF',
  },
});

export default ExpenseList;