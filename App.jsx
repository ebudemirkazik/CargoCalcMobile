import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, View, Text, StatusBar } from 'react-native';
import IncomeInput from './components/IncomeInput';

const App = () => {
  const [income, setIncome] = useState(0);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Text style={styles.title}>CargoCalc Mobil</Text>
        <IncomeInput income={income} setIncome={setIncome} />
        <Text style={styles.result}>Gelir: ₺{income}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
  container: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  result: {
    fontSize: 18,
    marginTop: 20,
  },
});

export default App;