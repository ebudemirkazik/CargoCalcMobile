// components/ExpenseList.jsx - React Native Version
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

function ExpenseList({ expenses = [], fixedExpenses = [], onDeleteExpense }) {
  const format = (n) => n.toLocaleString('tr-TR', { maximumFractionDigits: 2 });

  const totalManualExpenses = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  const totalFixedExpenses = fixedExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  const grandTotal = totalManualExpenses + totalFixedExpenses;

  // Elle eklenen masrafların toplam KDV'si
  const totalManualKdv = expenses.reduce((sum, expense) => {
    const kdv = expense.amount * (expense.kdvRate / (100 + expense.kdvRate));
    return sum + (isNaN(kdv) ? 0 : kdv);
  }, 0);

  // Masraf silme onayı
  const handleDeleteExpense = (expense, index) => {
    Alert.alert(
      'Masraf Sil',
      `"${expense.name}" masrafını silmek istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => onDeleteExpense(index),
        },
      ]
    );
  };

  if (expenses.length === 0 && fixedExpenses.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>📋 Masraflar</Text>

        {/* Boş durum */}
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>💸</Text>
          <Text style={styles.emptyText}>Henüz masraf eklenmedi!</Text>
          <Text style={styles.emptySubtext}>
            Yakıt, yol, bakım gibi masraflarınızı ekleyiniz.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>📋 Masraflar</Text>
          {expenses.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{expenses.length}</Text>
            </View>
          )}
        </View>

        {/* Elle eklenen masraflar */}
        {expenses.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Elle Eklenen Masraflar:</Text>

            <View style={styles.expensesList}>
              {expenses.map((expense, index) => {
                const kdvAmount =
                  expense.amount * (expense.kdvRate / (100 + expense.kdvRate));

                return (
                  <View key={expense.id || index} style={styles.expenseItem}>
                    <View style={styles.expenseInfo}>
                      {/* Masraf adı */}
                      <Text style={styles.expenseName}>{expense.name}</Text>

                      {/* Tutar ve KDV bilgisi */}
                      <View style={styles.expenseAmounts}>
                        <Text style={styles.expenseAmount}>
                          {format(expense.amount)} ₺
                        </Text>

                        {expense.kdvRate > 0 && (
                          <Text style={styles.expenseKdv}>
                            KDV %{expense.kdvRate} = {format(kdvAmount)} ₺
                          </Text>
                        )}
                      </View>
                    </View>

                    {/* Sil butonu */}
                    <TouchableOpacity
                      onPress={() => handleDeleteExpense(expense, index)}
                      style={styles.deleteButton}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.deleteButtonText}>Sil</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>

            {/* Ara toplam */}
            <View style={styles.subtotalContainer}>
              <View style={styles.subtotalRow}>
                <Text style={styles.subtotalLabel}>Ara Toplam:</Text>
                <Text style={styles.subtotalAmount}>
                  {format(totalManualExpenses)} ₺
                </Text>
              </View>
              {totalManualKdv > 0 && (
                <View style={styles.kdvRow}>
                  <Text style={styles.kdvLabel}>Toplam KDV:</Text>
                  <Text style={styles.kdvAmount}>
                    {format(totalManualKdv)} ₺
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Genel toplam */}
        <View style={styles.totalContainer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Toplam Aylık Masraf:</Text>
            <Text style={styles.totalAmount}>
              {format(totalManualExpenses)} ₺
            </Text>
          </View>
          {totalManualKdv > 0 && (
            <View style={styles.totalKdvRow}>
              <Text style={styles.totalKdvLabel}>Toplam İndirilecek KDV:</Text>
              <Text style={styles.totalKdvAmount}>
                {format(totalManualKdv)} ₺
              </Text>
            </View>
          )}
        </View>

        {/* Sabit giderler açıklaması */}
        {fixedExpenses.length > 0 && (
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              Sabit giderler otomatik olarak her ay hesaplamalara dahil edilir.
            </Text>
          </View>
        )}

        {/* Mobil ipucu */}
        {!isTablet && expenses.length > 0 && (
          <View style={styles.tipContainer}>
            <Text style={styles.tipIcon}>💡</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>İpucu:</Text>
              <Text style={styles.tipText}>
                Masraf silmek için sil butonuna dokunun. Silme işlemi onay isteyecektir.
              </Text>
            </View>
          </View>
        )}

        {/* Quick Stats */}
        {expenses.length > 0 && (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{expenses.length}</Text>
              <Text style={styles.statLabel}>Masraf</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {format(totalManualExpenses / expenses.length)}₺
              </Text>
              <Text style={styles.statLabel}>Ortalama</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {totalManualKdv > 0 ? format(totalManualKdv) + '₺' : '0₺'}
              </Text>
              <Text style={styles.statLabel}>KDV İndirimi</Text>
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
    marginBottom: 20,
  },
  title: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: 'bold',
    color: '#374151',
    flex: 1,
  },
  badge: {
    backgroundColor: '#DBEAFE',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E40AF',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Section
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },

  // Expenses List
  expensesList: {
    gap: 12,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  expenseInfo: {
    flex: 1,
    marginRight: 12,
  },
  expenseName: {
    fontSize: isTablet ? 16 : 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  expenseAmounts: {
    gap: 4,
  },
  expenseAmount: {
    fontSize: isTablet ? 16 : 15,
    fontWeight: 'bold',
    color: '#DC2626',
  },
  expenseKdv: {
    fontSize: 12,
    color: '#059669',
  },

  // Delete Button
  deleteButton: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 60,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Subtotal
  subtotalContainer: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subtotalLabel: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  subtotalAmount: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  kdvRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kdvLabel: {
    fontSize: 14,
    color: '#059669',
  },
  kdvAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },

  // Total
  totalContainer: {
    paddingTop: 16,
    marginTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#E5E7EB',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  totalAmount: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
    color: '#DC2626',
  },
  totalKdvRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalKdvLabel: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
    color: '#059669',
  },
  totalKdvAmount: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: 'bold',
    color: '#059669',
  },

  // Info Container
  infoContainer: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  infoText: {
    fontSize: 12,
    color: '#1E40AF',
    textAlign: 'center',
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

  // Stats Container
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  statCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default ExpenseList;