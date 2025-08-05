import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { calculateIncomeTax } from "../utils/taxCalculator";
import { useToast } from "./ToastNotification"; // Native versiyonuna uyarlanmalı
import AsyncStorage from "@react-native-async-storage/async-storage";

function Summary({ income, expenses, onHistoryUpdate }) {
  const { addToast } = useToast();

  const saveSummaryToLocal = async (data) => {
    try {
      const existing =
        JSON.parse(await AsyncStorage.getItem("cargoCalcHistory")) || [];
      existing.push({ ...data, date: new Date().toISOString() });
      await AsyncStorage.setItem("cargoCalcHistory", JSON.stringify(existing));
    } catch (error) {
      console.error("Hesaplama geçmişi kaydedilemedi:", error);
    }
  };

  const isFatura = (item) => item.name.trim().toLowerCase() === "fatura";

  const totalExpenses = expenses.reduce((acc, item) => {
    return isFatura(item) ? acc : acc + item.amount;
  }, 0);

  const totalKdv = expenses.reduce((acc, item) => {
    const kdv = item.amount * (item.kdvRate / (100 + item.kdvRate));
    return acc + (isNaN(kdv) ? 0 : kdv);
  }, 0);

  const vergiMatrahMasraflar = expenses.reduce((acc, item) => acc + item.amount, 0);
  const hakedisKdv = income * (20 / 120);
  const odenecekKdv = hakedisKdv - totalKdv;
  const gelirVergisiMatrahi = income - vergiMatrahMasraflar - odenecekKdv;
  const gelirVergisi = calculateIncomeTax(gelirVergisiMatrahi);
  const netKazanc = income - totalExpenses - odenecekKdv - gelirVergisi;

  const faturaExpenses = expenses.filter(isFatura);
  const totalFaturaMasraflar = faturaExpenses.reduce(
    (acc, item) => acc + item.amount,
    0
  );
  const faturaKdv = faturaExpenses.reduce((acc, item) => {
    const kdv = item.amount * (item.kdvRate / (100 + item.kdvRate));
    return acc + (isNaN(kdv) ? 0 : kdv);
  }, 0);

  const format = (n) =>
    n.toLocaleString("tr-TR", { maximumFractionDigits: 2 });

  const handleSave = () => {
    if (income > 0) {
      const summaryData = {
        income,
        totalExpenses,
        totalKdv,
        hakedisKdv,
        odenecekKdv,
        gelirVergisiMatrahi,
        gelirVergisi,
        netKazanc,
        expenses: expenses,
      };
      saveSummaryToLocal(summaryData);
      onHistoryUpdate?.();
      addToast("Hesaplama başarıyla kaydedildi!", "success", 4000);
    } else {
      addToast("Lütfen önce hakediş tutarını giriniz.", "warning", 3000);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Finansal Özet</Text>

      <View style={styles.cardBlue}>
        <Text style={styles.label}>Hakediş</Text>
        <Text style={styles.valueBlue}>{format(income)} ₺</Text>
      </View>

      <View style={styles.cardRed}>
        <Text style={styles.label}>Görünür Masraflar</Text>
        <Text style={styles.valueRed}>{format(totalExpenses)} ₺</Text>
      </View>

      {totalFaturaMasraflar > 0 && (
        <View style={styles.cardYellow}>
          <Text style={styles.label}>Gizli Masraflar (Fatura)</Text>
          <Text style={styles.valueYellow}>{format(totalFaturaMasraflar)} ₺</Text>
          <Text style={styles.subText}>KDV İndirimi: {format(faturaKdv)} ₺</Text>
        </View>
      )}

      <View style={styles.taxBlock}>
        <Text style={styles.label}>Toplam Vergi Yükü (KDV + GV):</Text>
        <Text style={styles.valueDark}>{format(odenecekKdv + gelirVergisi)} ₺</Text>
      </View>

      <View style={styles.netProfitBlock}>
        <Text style={styles.netLabel}>NET KAZANÇ</Text>
        <Text style={styles.netValue}>{format(netKazanc)} ₺</Text>
        <Text style={styles.subTextWhite}>Tüm vergiler düşülmüş net kâr</Text>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Hesaplamayı Kaydet</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 16,
  },
  cardBlue: {
    backgroundColor: "#eff6ff",
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
    marginBottom: 12,
  },
  cardRed: {
    backgroundColor: "#fee2e2",
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#ef4444",
    marginBottom: 12,
  },
  cardYellow: {
    backgroundColor: "#fef9c3",
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#facc15",
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
  valueBlue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1d4ed8",
  },
  valueRed: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#dc2626",
  },
  valueYellow: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ca8a04",
  },
  subText: {
    fontSize: 12,
    color: "#7f1d1d",
    marginTop: 4,
  },
  taxBlock: {
    backgroundColor: "#f1f5f9",
    padding: 16,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    marginBottom: 16,
  },
  valueDark: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginTop: 8,
  },
  netProfitBlock: {
    backgroundColor: "#22c55e",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  netLabel: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 6,
  },
  netValue: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
  },
  subTextWhite: {
    color: "#f1f5f9",
    fontSize: 12,
    marginTop: 6,
  },
  saveButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 12,
    borderRadius: 10,
  },
  saveButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default Summary;
