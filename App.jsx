// App.jsx - React Native Version with Real Logo Assets
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
  Image,
} from 'react-native';
import IncomeInput from './components/IncomeInput';
import AddExpenseForm from './components/AddExpenseForm';
import ExpenseDonutChart from './components/ExpenseDonutChart';
import FixedExpenses from './components/FixedExpenses';
import ExpenseList from './components/ExpenseList';
import Summary from './components/Summary';
import HistoryList from './components/HistoryList';
import MockStorage from './utils/MockStorage';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

export default function App() {
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [fixedExpenses, setFixedExpenses] = useState([]);
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);

  const handleAddExpense = (newExpense) => {
    const expenseWithId = {
      ...newExpense,
      id: Date.now(),
    };

    setExpenses(prev => [...prev, expenseWithId]);
  };

  const handleDeleteExpense = (id) => {
    console.log('App.jsx handleDeleteExpense çağrıldı, ID:', id);
    console.log('Mevcut expenses:', expenses);
    
    const updatedExpenses = expenses.filter(expense => expense.id !== id);
    console.log('Güncellenmiş expenses:', updatedExpenses);
    
    setExpenses(updatedExpenses);
    
    // Başarılı silme mesajı (opsiyonel)
    console.log('Masraf silindi, yeni liste uzunluğu:', updatedExpenses.length);
  };

  // Sabit giderleri güncelle - Artık otomatik çağrılmayacak
  const handleFixedExpensesChange = (monthlyFixedExpenses) => {
    console.log('handleFixedExpensesChange çağrıldı (artık otomatik değil):', monthlyFixedExpenses);
    setFixedExpenses(monthlyFixedExpenses);
  };

  // Sabit gideri manuel masraflara ekle
  const handleAddToManualExpenses = (fixedExpense) => {
    setExpenses(prev => [...prev, fixedExpense]);
  };

  // History refresh trigger fonksiyonu
  const refreshHistory = () => {
    setHistoryRefreshTrigger(prev => prev + 1);
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
        {/* Header - Gerçek Logo Assets */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('./public/apple-touch-icon.png')} 
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          
          <View style={styles.titleContainer}>
            <Text style={styles.title}>CargoCalc</Text>
            <Text style={styles.subtitle}>Nakliyeciler için Hakediş ve Vergi Hesaplama Aracı</Text>
            <Text style={styles.description}>
              KDV indirimi, net kazanç ve sabit masraflar dahil tüm hesaplamaları akıllı şekilde yapın.
            </Text>
          </View>
        </View>

        {/* Hakediş Input - Real Component */}
        <IncomeInput income={parseFloat(income) || 0} setIncome={setIncome} />

        {/* Masraf Ekleme - Real Component */}
        <AddExpenseForm onAddExpense={handleAddExpense} />

        {/* Masraf Dağılımı Grafiği - Real Component */}
        <ExpenseDonutChart expenses={expenses} />

        {/* Yıllık Sabit Giderler - MockStorage ile */}
        <FixedExpenses 
          onFixedExpensesChange={handleFixedExpensesChange}
          onAddToManualExpenses={handleAddToManualExpenses}
        />

        {/* Masraf Listesi - Real Component */}
        <ExpenseList 
          expenses={expenses}
          fixedExpenses={fixedExpenses}
          onDeleteExpense={handleDeleteExpense}
        />

        {/* Summary Component - Vergi Hesaplamaları ile */}
        <Summary 
          income={numericIncome}
          expenses={expenses}
          fixedExpenses={fixedExpenses}
          onHistorySaved={refreshHistory}
        />

        {/* History List Component */}
        <HistoryList refreshTrigger={historyRefreshTrigger} />

        {/* Test Durumu Göstergesi */}
        <View style={styles.testCard}>
          <Text style={styles.testTitle}>🧪 Test Durumu</Text>
          <Text style={styles.testText}>
            ✅ IncomeInput Component: Aktif{'\n'}
            ✅ AddExpenseForm Component: Aktif{'\n'}
            ✅ ExpenseDonutChart Component: Aktif{'\n'}
            ✅ FixedExpenses Component: Aktif{'\n'}
            ✅ ExpenseList Component: Aktif{'\n'}
            ✅ Summary Component: Aktif (Vergi Hesaplamalı){'\n'}
            ✅ HistoryList Component: Aktif{'\n'}
            ✅ Tüm componentler entegre edildi!
          </Text>
          <Text style={styles.testNote}>
            Income: {income} | Expenses: {expenses.length} adet | Fixed: {fixedExpenses.length} adet
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
  
  // Header - Gerçek Logo Assets
  header: {
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoImage: {
    width: 128,
    height: 128,
    marginBottom: 2,
  },
  
  // Title Container
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1D4ED8',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  description: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
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