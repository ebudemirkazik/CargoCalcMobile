// src/components/IncomeInput.jsx

import React from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';

const quickValues = [500, 750, 1000, 1500, 2000];

const IncomeInput = ({ income, setIncome, selectedQuick, setSelectedQuick }) => {
  const handleQuickSelect = (value) => {
    setIncome(value);
    setSelectedQuick(value);
  };

  const handleInputChange = (text) => {
    const parsed = parseFloat(text.replace(',', '.'));
    setIncome(isNaN(parsed) ? 0 : parsed);
    setSelectedQuick(null);
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>Gelir</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor="#aaa"
          value={income?.toString() ?? ''}
          onChangeText={handleInputChange}
        />
        <Text style={styles.currency}>₺</Text>
      </View>

      <View style={styles.quickRow}>
        {quickValues.map((value) => (
          <Pressable
            key={value}
            onPress={() => handleQuickSelect(value)}
            style={[
              styles.quickButton,
              selectedQuick === value && styles.quickButtonSelected,
            ]}
          >
            <Text
              style={[
                styles.quickText,
                selectedQuick === value && styles.quickTextSelected,
              ]}
            >
              {value.toLocaleString('tr-TR')}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 24,
    marginHorizontal: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    color: '#333',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#000',
  },
  currency: {
    fontSize: 18,
    marginLeft: 4,
    color: '#333',
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  quickButton: {
    backgroundColor: '#f3f3f3',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  quickButtonSelected: {
    backgroundColor: '#4338ca', // indigo-700
    borderColor: '#4338ca',
  },
  quickText: {
    fontSize: 14,
    color: '#333',
  },
  quickTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default IncomeInput;