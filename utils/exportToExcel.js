// src/utils/exportToExcel.js - React Native Version
import * as XLSX from "xlsx";
import RNFS from "react-native-fs";
import { Platform, Alert, PermissionsAndroid } from "react-native";
import Share from "react-native-share";

// Android için dosya yazma izni isteme
const requestWritePermission = async () => {
  if (Platform.OS !== 'android') return true;
  
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'Dosya Kaydetme İzni',
        message: 'Excel dosyasını kaydetmek için depolama izni gerekiyor.',
        buttonNeutral: 'Daha Sonra Sor',
        buttonNegative: 'İptal',
        buttonPositive: 'İzin Ver',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn('İzin alma hatası:', err);
    return false;
  }
};

export const exportToExcel = async (data, filename = "CargoCalc-Hesaplama.xlsx") => {
  try {
    // İzin kontrolü
    const hasPermission = await requestWritePermission();
    if (!hasPermission) {
      Alert.alert('Hata', 'Dosya kaydetmek için depolama izni gerekiyor.');
      return;
    }

    // Worksheet oluştur
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Hesaplama");

    // Excel buffer oluştur
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    // Dosya yolu belirle
    const documentPath = Platform.select({
      ios: RNFS.DocumentDirectoryPath,
      android: RNFS.DownloadDirectoryPath,
    });
    
    const filePath = `${documentPath}/${filename}`;

    // Base64 string'e çevir
    const base64String = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "base64",
    });

    // Dosyayı kaydet
    await RNFS.writeFile(filePath, base64String, 'base64');

    // Başarı mesajı ve paylaşma seçeneği
    Alert.alert(
      'Başarılı!',
      `Excel dosyası kaydedildi: ${filename}`,
      [
        {
          text: 'Tamam',
          style: 'default',
        },
        {
          text: 'Paylaş',
          onPress: () => shareFile(filePath),
        },
      ]
    );

    return filePath;
  } catch (error) {
    console.error('Excel export hatası:', error);
    Alert.alert('Hata', 'Excel dosyası oluşturulamadı: ' + error.message);
    throw error;
  }
};

// Dosyayı paylaşma fonksiyonu
const shareFile = async (filePath) => {
  try {
    const shareOptions = {
      title: 'CargoCalc Hesaplama',
      url: `file://${filePath}`,
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      filename: filePath.split('/').pop(),
    };

    await Share.open(shareOptions);
  } catch (error) {
    console.error('Paylaşma hatası:', error);
    // Sessizce geç, paylaşma iptal edilmiş olabilir
  }
};

// iOS için Documents klasöründeki dosyaları listeleme (debugging için)
export const listDownloadedFiles = async () => {
  try {
    const files = await RNFS.readDir(RNFS.DocumentDirectoryPath);
    const excelFiles = files.filter(file => file.name.endsWith('.xlsx'));
    return excelFiles;
  } catch (error) {
    console.error('Dosya listeleme hatası:', error);
    return [];
  }
};

// Belirli bir dosyayı silme fonksiyonu (temizlik için)
export const deleteExcelFile = async (filename) => {
  try {
    const documentPath = Platform.select({
      ios: RNFS.DocumentDirectoryPath,
      android: RNFS.DownloadDirectoryPath,
    });
    
    const filePath = `${documentPath}/${filename}`;
    const exists = await RNFS.exists(filePath);
    
    if (exists) {
      await RNFS.unlink(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Dosya silme hatası:', error);
    return false;
  }
};