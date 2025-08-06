// pages/DataInputPage.jsx - Veri Girişi Sayfası
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

import { useAppContext } from '../App'; // Güncel App.jsx'den import
import { SafeAreaView } from 'react-native-safe-area-context';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import IncomeInput from '../components/IncomeInput';
import AddExpenseForm from '../components/AddExpenseForm';
import ExpenseList from '../components/ExpenseList';
import FixedExpenses from '../components/FixedExpenses';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

const DataInputPage = () => {
  const {
    income,
    expenses,
    fixedExpenses,
    setIncome,
    handleAddExpense,
    handleDeleteExpense,
    handleFixedExpensesChange,
    handleAddToManualExpenses,
    setActiveTab,
  } = useAppContext();

  // Sayfa tamamlanma durumu
  const isIncomeComplete = income > 0;
  const hasExpenses = expenses.length > 0;
  const canProceed = isIncomeComplete; // En azından hakediş girilmeli

  const handleNext = () => {
    if (canProceed) {
      setActiveTab(1); // Hesaplama sayfasına git
    }
  };

  return (
    <SafeAreaProvider>
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Sayfa Başlığı */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>📝 Veri Girişi</Text>
          <Text style={styles.pageDescription}>
            Hakediş tutarınızı, masraflarınızı ve sabit giderlerinizi girin
          </Text>
        </View>

        {/* 1. Hakediş Girişi */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>1</Text>
            <Text style={styles.sectionTitle}>Aylık Hakediş</Text>
            {isIncomeComplete && <Text style={styles.checkmark}>✅</Text>}
          </View>
          <IncomeInput income={income} setIncome={setIncome} />
        </View>

        {/* 2. Masraf Ekleme */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>2</Text>
            <Text style={styles.sectionTitle}>Masraflarınız</Text>
            <Text style={styles.optionalTag}>İsteğe Bağlı</Text>
          </View>
          <AddExpenseForm onAddExpense={handleAddExpense} />
        </View>

        {/* 3. Masraf Listesi - Sadece masraf varsa göster */}
        {hasExpenses && (
          <View style={styles.section}>
            <ExpenseList
              expenses={expenses}
              fixedExpenses={fixedExpenses}
              onDeleteExpense={handleDeleteExpense}
            />
          </View>
        )}

        {/* 4. Sabit Giderler */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>3</Text>
            <Text style={styles.sectionTitle}>Yıllık Sabit Giderler</Text>
            <Text style={styles.optionalTag}>İsteğe Bağlı</Text>
          </View>
          <FixedExpenses
            onFixedExpensesChange={handleFixedExpensesChange}
            onAddToManualExpenses={handleAddToManualExpenses}
          />
        </View>

        {/* Spacer for next button */}
        <View style={styles.spacer} />
      </ScrollView>

      {/* Next Button - Fixed Bottom */}
      <View style={styles.bottomContainer}>
        {/* Progress Summary */}
        <View style={styles.progressSummary}>
          <Text style={styles.progressText}>
            {isIncomeComplete ? (
              hasExpenses ?
                `✅ Hakediş: ${income.toLocaleString('tr-TR')}₺ • ${expenses.length} masraf` :
                `✅ Hakediş: ${income.toLocaleString('tr-TR')}₺`
            ) : (
              '⏳ Lütfen hakediş tutarını girin'
            )}
          </Text>
        </View>

        {/* Next Button */}
        <TouchableOpacity
          style={[
            styles.nextButton,
            canProceed ? styles.nextButtonEnabled : styles.nextButtonDisabled
          ]}
          onPress={handleNext}
          disabled={!canProceed}
          activeOpacity={canProceed ? 0.8 : 1}
        >
          <Text style={[
            styles.nextButtonText,
            canProceed ? styles.nextButtonTextEnabled : styles.nextButtonTextDisabled
          ]}>
            {canProceed ? 'Hesaplamaya Geç 📊' : 'Hakediş Tutarı Gerekli'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120, // Bottom button space
  },

  // Page Header
  pageHeader: {
    padding: 20,
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  pageDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Sections
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionNumber: {
    width: 32,
    height: 32,
    backgroundColor: '#3B82F6',
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  checkmark: {
    fontSize: 20,
  },
  optionalTag: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  // Spacer
  spacer: {
    height: 20,
  },

  // Bottom Container
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },

  // Progress Summary
  progressSummary: {
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },

  // Next Button
  nextButton: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  nextButtonEnabled: {
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  nextButtonTextEnabled: {
    color: '#ffffff',
  },
  nextButtonTextDisabled: {
    color: '#9CA3AF',
  },
});

export default DataInputPage;