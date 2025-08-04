// components/ExpenseDonutChart.jsx - React Native Version (Fixed SVG)
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

function ExpenseDonutChart({ expenses }) {
  // Masraf kategorilerini analiz et
  const categorizeExpenses = (expenses) => {
    const categories = {
      yakit: { name: 'Yakıt', total: 0, color: '#ef4444', icon: '⛽' },
      yol: { name: 'Yol', total: 0, color: '#3b82f6', icon: '🛣️' },
      bakim: { name: 'Bakım', total: 0, color: '#10b981', icon: '🔧' },
      arac: { name: 'Araç', total: 0, color: '#BB00FF', icon: '🚗' },
      yemek: { name: 'Yemek', total: 0, color: '#f59e0b', icon: '🍽️' },
      faturalar: { name: 'Faturalar', total: 0, color: '#8b5cf6', icon: '📄' },
      diger: { name: 'Diğer', total: 0, color: '#6b7280', icon: '📦' },
      fatura: { name: 'Fatura', total: 0, color: '#96ff73', icon: '📋' },
    };

    expenses.forEach((expense) => {
      const name = expense.name.toLowerCase().trim();

      if (
        name.includes('yakıt') ||
        name.includes('benzin') ||
        name.includes('mazot') ||
        name === 'yakıt'
      ) {
        categories.yakit.total += expense.amount;
      } else if (
        name.includes('yol') ||
        name.includes('otoyol') ||
        name.includes('köprü') ||
        name.includes('geçiş') ||
        name === 'yol'
      ) {
        categories.yol.total += expense.amount;
      } else if (
        name.includes('bakım') ||
        name.includes('onarım') ||
        name.includes('servis') ||
        name === 'bakım'
      ) {
        categories.bakim.total += expense.amount;
      } else if (
        name.includes('sigorta') ||
        name.includes('kasko') ||
        name === 'sigorta'
      ) {
        categories.arac.total += expense.amount;
      } else if (
        name.includes('yemek') ||
        name.includes('restoran') ||
        name.includes('kahvaltı') ||
        name.includes('öğle') ||
        name.includes('akşam') ||
        name === 'yemek'
      ) {
        categories.yemek.total += expense.amount;
      } else if (
        name.includes('telefon') ||
        name.includes('elektrik') ||
        name.includes('su') ||
        name.includes('gaz') ||
        name.includes('internet')
      ) {
        categories.faturalar.total += expense.amount;
      } else if (name.includes('fatura')) {
        categories.fatura.total += expense.amount;
      } else if (
        name.includes('lastik') ||
        name === 'lastik'
      ) {
        categories.arac.total += expense.amount;
      } else {
        categories.diger.total += expense.amount;
      }
    });

    // Sadece değeri olan kategorileri döndür
    return Object.values(categories)
      .filter((cat) => cat.total > 0)
      .map((cat) => ({
        name: cat.name,
        value: cat.total,
        color: cat.color,
        icon: cat.icon,
      }));
  };

  const data = categorizeExpenses(expenses);
  const totalAmount = data.reduce((sum, item) => sum + item.value, 0);

  // Yüzdeleri hesapla ve büyükten küçüğe sırala
  data.forEach((item) => {
    item.percentage =
      totalAmount > 0 ? ((item.value / totalAmount) * 100).toFixed(1) : 0;
  });

  // Data'yı değere göre büyükten küçüğe sırala
  const sortedData = data.sort((a, b) => b.value - a.value);

  const format = (n) => n.toLocaleString('tr-TR', { maximumFractionDigits: 0 });

  // Clean Visual Chart Component
  const CleanVisualChart = ({ data, size = 180 }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    return (
      <View style={styles.cleanChartContainer}>
        {/* Title */}
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>📊 Kategori Dağılımı</Text>
        </View>
        
        {/* Visual Bars */}
        <View style={styles.barsContainer}>
          {data.map((item, index) => (
            <View key={index} style={styles.barRow}>
              <View style={styles.barInfo}>
                <Text style={styles.barIcon}>{item.icon}</Text>
                <Text style={styles.barLabel}>{item.name}</Text>
              </View>
              
              <View style={styles.barContainer}>
                <View 
                  style={[
                    styles.barFill,
                    { 
                      backgroundColor: item.color,
                      width: `${item.percentage}%`,
                    }
                  ]} 
                />
              </View>
              
              <View style={styles.barValues}>
                <Text style={styles.barAmount}>{format(item.value)}₺</Text>
                <Text style={styles.barPercentage}>%{item.percentage}</Text>
              </View>
            </View>
          ))}
        </View>
        
        {/* Summary */}
        <View style={styles.chartSummary}>
          <Text style={styles.summaryText}>
            Toplam: <Text style={styles.summaryAmount}>{format(total)}₺</Text> • {data.length} kategori
          </Text>
        </View>
      </View>
    );
  };

  // Hiç masraf yoksa
  if (data.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Masraf Dağılımı</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📈</Text>
          <Text style={styles.emptyText}>Henüz masraf eklenmedi</Text>
          <Text style={styles.emptySubtext}>
            Masraf eklediğinizde burada kategori analizi görünecek
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        <Text style={styles.title}>Masraf Dağılımı</Text>

        {/* Clean Visual Chart */}
        <CleanVisualChart data={sortedData} />

        {/* Kategori listesi kaldırıldı - chart'ın içinde zaten var */}

        {/* En yüksek kategori vurgusu */}
        {sortedData.length > 0 && (
          <View style={styles.highlightContainer}>
            <Text style={styles.highlightText}>
              <Text style={styles.highlightLabel}>🔝 En çok harcama:</Text>{' '}
              {sortedData[0].icon} {sortedData[0].name}
              <Text style={styles.highlightPercentage}>
                {' '}(%{sortedData[0].percentage})
              </Text>
            </Text>
          </View>
        )}

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{sortedData.length}</Text>
            <Text style={styles.statLabel}>Kategori</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {format(totalAmount / sortedData.length || 0)}₺
            </Text>
            <Text style={styles.statLabel}>Ortalama</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              %{sortedData[0]?.percentage || 0}
            </Text>
            <Text style={styles.statLabel}>En Yüksek</Text>
          </View>
        </View>

        {/* Quick Analysis */}
        <View style={styles.analysisContainer}>
          <Text style={styles.analysisTitle}>💡 Hızlı Analiz</Text>
          <Text style={styles.analysisText}>
            {sortedData.length > 1 ? (
              `En büyük masraf kaleminin ${sortedData[0].name} (%${sortedData[0].percentage}) olduğu görülüyor. 
              ${sortedData.length} farklı kategoride toplam ${format(totalAmount)}₺ masraf yapılmış.`
            ) : (
              `Tüm masraflar ${sortedData[0].name} kategorisinde toplanmış.`
            )}
          </Text>
        </View>
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

  // Title
  title: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 20,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Clean Chart Styles
  cleanChartContainer: {
    marginBottom: 24,
  },
  chartHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  barsContainer: {
    marginBottom: 16,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  barInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 100,
    marginRight: 12,
  },
  barIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  barLabel: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
  },
  barContainer: {
    flex: 1,
    height: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 12,
  },
  barFill: {
    height: '100%',
    borderRadius: 10,
    minWidth: 8,
  },
  barValues: {
    alignItems: 'flex-end',
    width: 70,
  },
  barAmount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  barPercentage: {
    fontSize: 10,
    color: '#6B7280',
  },
  chartSummary: {
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  summaryText: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryAmount: {
    fontWeight: 'bold',
    color: '#374151',
  },

  // Legend
  legendContainer: {
    marginBottom: 20,
  },
  legendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  legendText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
  },
  legendRight: {
    alignItems: 'flex-end',
  },
  legendAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  legendPercentage: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },

  // Highlight
  highlightContainer: {
    backgroundColor: '#EFF6FF',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  highlightText: {
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 18,
  },
  highlightLabel: {
    fontWeight: '600',
  },
  highlightPercentage: {
    fontWeight: 'bold',
  },

  // Statistics Cards
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  statValue: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },

  // Analysis
  analysisContainer: {
    backgroundColor: '#FFFBEB',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    borderRadius: 8,
    padding: 12,
  },
  analysisTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  analysisText: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
});

export default ExpenseDonutChart;