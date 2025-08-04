// App.jsx - React Native Version with IncomeInput
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import IncomeInput from './components/IncomeInput';
import AddExpenseForm from './components/AddExpenseForm';
import ExpenseDonutChart from './components/ExpenseDonutChart';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

export default function App() {
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState([]);

  const handleAddExpense = (newExpense) => {
    const expenseWithId = {
      ...newExpense,
      id: Date.now(),
    };

    setExpenses(prev => [...prev, expenseWithId]);
  };

  const handleDeleteExpense = (id) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const numericIncome = parseFloat(income) || 0;
  const netIncome = numericIncome - totalExpenses;

  const formatCurrency = (amount) => {
    return amount.toLocaleString('tr-TR') + ' ₺';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🚚</Text>
          <Text style={styles.title}>CargoCalc</Text>
          <Text style={styles.subtitle}>Nakliye Hesaplama Aracı</Text>
        </View>

        {/* Hakediş Input - Real Component */}
        <IncomeInput income={parseFloat(income) || 0} setIncome={setIncome} />

        {/* Masraf Ekleme - Real Component */}
        <AddExpenseForm onAddExpense={handleAddExpense} />

        {/* Masraf Dağılımı Grafiği - Real Component */}
        <ExpenseDonutChart expenses={expenses} />

        {/* Masraf Listesi */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Masraflar</Text>
          
          {expenses.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>💸</Text>
              <Text style={styles.emptyText}>Henüz masraf eklenmedi</Text>
            </View>
          ) : (
            expenses.map((expense) => (
              <View key={expense.id} style={styles.expenseItem}>
                <View style={styles.expenseInfo}>
                  <Text style={styles.expenseName}>{expense.name}</Text>
                  <Text style={styles.expenseAmount}>{formatCurrency(expense.amount)}</Text>
                  {expense.kdvRate && (
                    <Text style={styles.expenseKdv}>KDV: %{expense.kdvRate}</Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteExpense(expense.id)}
                >
                  <Text style={styles.deleteButtonText}>Sil</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Özet */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📈 Finansal Özet</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Hakediş:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(numericIncome)}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Toplam Masraf:</Text>
            <Text style={[styles.summaryValue, styles.expenseColor]}>
              -{formatCurrency(totalExpenses)}
            </Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.summaryRow}>
            <Text style={styles.netIncomeLabel}>Net Kazanç:</Text>
            <Text style={[styles.netIncomeValue, netIncome >= 0 ? styles.positive : styles.negative]}>
              {formatCurrency(netIncome)}
            </Text>
          </View>
        </View>

        {/* Test Durumu Göstergesi */}
        <View style={styles.testCard}>
          <Text style={styles.testTitle}>🧪 Test Durumu</Text>
          <Text style={styles.testText}>
            ✅ IncomeInput Component: Aktif{'\n'}
            ✅ AddExpenseForm Component: Aktif{'\n'}
            ✅ ExpenseDonutChart Component: Aktif{'\n'}
            ⏳ Diğer componentler: Gelecek
          </Text>
          <Text style={styles.testNote}>
            Income: {income} | Expenses: {expenses.length} adet
          </Text>
        </View>

        {/* Footer Uyarı */}
        <View style={styles.footer}>
          <Text style={styles.footerIcon}>⚠️</Text>
          <Text style={styles.footerText}>
            Bu hesaplama aracı sadece genel bilgi amaçlıdır. 
            Gerçek vergi hesaplamaları için muhasebeci ile görüşünüz.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  
  // Header
  header: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logo: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1D4ED8',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  
  // Card
  card: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 16,
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  
  // Expense Item
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  expenseAmount: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: 'bold',
  },
  expenseKdv: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 2,
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  // Summary
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  expenseColor: {
    color: '#EF4444',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  netIncomeLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  netIncomeValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  positive: {
    color: '#10B981',
  },
  negative: {
    color: '#EF4444',
  },
  
  // Test Card
  testCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  testTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 8,
  },
  testText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
    marginBottom: 8,
  },
  testNote: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  
  // Footer
  footer: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
  },
  footerIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  footerText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
});