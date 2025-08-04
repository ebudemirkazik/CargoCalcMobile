// utils/exportToPDF.js - React Native Version
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import { Platform, Alert, PermissionsAndroid } from 'react-native';
import { getCategory } from "./categorizeExpense";

// Android için dosya yazma izni isteme
const requestWritePermission = async () => {
  if (Platform.OS !== 'android') return true;
  
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'Dosya Kaydetme İzni',
        message: 'PDF dosyasını kaydetmek için depolama izni gerekiyor.',
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

export const exportToPDF = async ({
  expenses,
  income,
  totalExpenses,
  totalFaturaMasraflar,
  faturaKdv,
  totalKdv,
  hakedisKdv,
  odenecekKdv,
  gelirVergisiMatrahi,
  gelirVergisi,
  netKazanc,
}) => {
  try {
    // İzin kontrolü
    const hasPermission = await requestWritePermission();
    if (!hasPermission) {
      Alert.alert('Hata', 'PDF oluşturmak için depolama izni gerekiyor.');
      return;
    }

    const today = new Date().toLocaleDateString("tr-TR");
    const formatCurrency = (amount) => `${amount.toLocaleString("tr-TR")} ₺`;

    // HTML içeriği oluştur
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CargoCalc Hesap Özeti</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            margin: 15px;
            color: #333;
            line-height: 1.4;
            font-size: 12px;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 15px;
        }
        .header h1 {
            color: #2563eb;
            margin: 0;
            font-size: 24px;
        }
        .header p {
            color: #666;
            margin: 5px 0 0 0;
            font-size: 11px;
        }
        .section {
            margin-bottom: 20px;
            page-break-inside: avoid;
        }
        .section h2 {
            background: #2563eb;
            color: white;
            padding: 8px 10px;
            margin: 0 0 10px 0;
            border-radius: 4px;
            font-size: 14px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
            border: 1px solid #ddd;
        }
        th {
            background: #f8fafc;
            padding: 8px;
            text-align: left;
            font-weight: bold;
            color: #374151;
            border: 1px solid #ddd;
            font-size: 11px;
        }
        td {
            padding: 6px 8px;
            border: 1px solid #ddd;
            font-size: 11px;
        }
        tr:nth-child(even) {
            background: #f9fafb;
        }
        .amount {
            text-align: right;
            font-weight: bold;
        }
        .positive { color: #059669; }
        .negative { color: #dc2626; }
        .warning { color: #d97706; }
        .info { color: #2563eb; }
        
        .summary-grid {
            display: table;
            width: 100%;
            margin-bottom: 15px;
        }
        .summary-row {
            display: table-row;
        }
        .summary-card {
            display: table-cell;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 10px;
            text-align: center;
            width: 25%;
        }
        .summary-card h3 {
            margin: 0 0 5px 0;
            font-size: 10px;
            color: #64748b;
            text-transform: uppercase;
        }
        .summary-card .value {
            font-size: 16px;
            font-weight: bold;
            margin: 0;
        }
        
        .net-profit {
            background: #059669;
            color: white;
            text-align: center;
            padding: 15px;
            border-radius: 6px;
            margin: 15px 0;
        }
        .net-profit h2 {
            background: none;
            color: white;
            margin: 0 0 5px 0;
            font-size: 12px;
        }
        .net-profit .amount {
            font-size: 24px;
            font-weight: bold;
            margin: 0;
            text-align: center;
        }
        
        .footer {
            margin-top: 25px;
            padding-top: 15px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 9px;
            page-break-inside: avoid;
        }
        
        .bold-row {
            border-top: 2px solid #333;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚚 CargoCalc</h1>
        <p>Nakliye Maliyet ve Hakediş Hesap Özeti</p>
        <p>Rapor Tarihi: ${today}</p>
    </div>

    <div class="summary-grid">
        <div class="summary-row">
            <div class="summary-card">
                <h3>Toplam Hakediş</h3>
                <p class="value info">${formatCurrency(income)}</p>
            </div>
            <div class="summary-card">
                <h3>Toplam Masraflar</h3>
                <p class="value negative">${formatCurrency(totalExpenses)}</p>
            </div>
            <div class="summary-card">
                <h3>Toplam Vergi</h3>
                <p class="value warning">${formatCurrency(odenecekKdv + gelirVergisi)}</p>
            </div>
            <div class="summary-card">
                <h3>Kar Marjı</h3>
                <p class="value positive">${income > 0 ? ((netKazanc / income) * 100).toFixed(1) : "0"}%</p>
            </div>
        </div>
    </div>

    ${expenses.length > 0 ? `
    <div class="section">
        <h2>📊 Masraf Detayları</h2>
        <table>
            <thead>
                <tr>
                    <th>Masraf Adı</th>
                    <th>Kategori</th>
                    <th>KDV</th>
                    <th style="text-align: right;">Tutar</th>
                </tr>
            </thead>
            <tbody>
                ${expenses.map(expense => `
                    <tr>
                        <td><strong>${expense.name}</strong></td>
                        <td>${getCategory(expense.name)}</td>
                        <td>%${expense.kdvRate}</td>
                        <td class="amount negative">${formatCurrency(expense.amount)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    ` : ''}

    <div class="section">
        <h2>💰 Finansal Özet</h2>
        <table>
            <tbody>
                <tr>
                    <td><strong>Hakediş (KDV Dahil)</strong></td>
                    <td class="amount info">${formatCurrency(income)}</td>
                </tr>
                <tr>
                    <td>Görünür Masraflar</td>
                    <td class="amount negative">-${formatCurrency(totalExpenses)}</td>
                </tr>
                ${totalFaturaMasraflar > 0 ? `
                <tr>
                    <td>Gizli Masraflar (Fatura)</td>
                    <td class="amount warning">-${formatCurrency(totalFaturaMasraflar)}</td>
                </tr>
                <tr>
                    <td>Fatura KDV İndirimi</td>
                    <td class="amount positive">+${formatCurrency(faturaKdv)}</td>
                </tr>
                ` : ''}
                <tr>
                    <td>Toplam KDV İndirimi</td>
                    <td class="amount positive">+${formatCurrency(totalKdv)}</td>
                </tr>
                <tr>
                    <td>Hakediş KDV (%20)</td>
                    <td class="amount negative">-${formatCurrency(hakedisKdv)}</td>
                </tr>
                <tr class="bold-row">
                    <td><strong>Ödenecek KDV</strong></td>
                    <td class="amount negative"><strong>-${formatCurrency(odenecekKdv)}</strong></td>
                </tr>
                <tr>
                    <td>Gelir Vergisi Matrahı</td>
                    <td class="amount">${formatCurrency(gelirVergisiMatrahi)}</td>
                </tr>
                <tr class="bold-row">
                    <td><strong>Gelir Vergisi</strong></td>
                    <td class="amount negative"><strong>-${formatCurrency(gelirVergisi)}</strong></td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="net-profit">
        <h2>NET KAZANÇ</h2>
        <p class="amount">${formatCurrency(netKazanc)}</p>
        <p style="margin: 5px 0 0 0; font-size: 10px;">Tüm vergiler düşülmüş net kâr</p>
    </div>

    <div class="section">
        <h2>📈 Performans Analizi</h2>
        <table>
            <tbody>
                <tr>
                    <td><strong>Kar Marjı</strong></td>
                    <td class="amount positive">${income > 0 ? ((netKazanc / income) * 100).toFixed(1) : "0"}%</td>
                </tr>
                <tr>
                    <td><strong>Vergi Oranı</strong></td>
                    <td class="amount warning">${income > 0 ? (((odenecekKdv + gelirVergisi) / income) * 100).toFixed(1) : "0"}%</td>
                </tr>
                <tr>
                    <td><strong>Masraf Oranı</strong></td>
                    <td class="amount negative">${income > 0 ? ((totalExpenses / income) * 100).toFixed(1) : "0"}%</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="footer">
        <p><strong>⚠️ Önemli Uyarı:</strong> Bu hesaplama aracı sadece genel bilgi ve fikir vermek amacıyla hazırlanmıştır.</p>
        <p>Gerçek vergi hesaplamaları için muhasebeci veya mali müşaviriniz ile görüşünüz.</p>
        <p style="margin-top: 10px;">© 2025 CargoCalc - Bu araç bilgilendirme amaçlıdır.</p>
    </div>
</body>
</html>`;

    // PDF seçenekleri
    const options = {
      html: htmlContent,
      fileName: `CargoCalc-${today.replace(/\./g, '-')}`,
      directory: Platform.select({
        ios: 'Documents',
        android: 'Downloads',
      }),
      width: 595, // A4 width in points
      height: 842, // A4 height in points
      padding: 20,
      bgColor: '#FFFFFF',
    };

    // PDF oluştur
    const file = await RNHTMLtoPDF.convert(options);
    
    if (file.filePath) {
      // Başarı mesajı ve seçenekler
      Alert.alert(
        'PDF Oluşturuldu!',
        `Dosya kaydedildi: ${file.filePath}`,
        [
          {
            text: 'Tamam',
            style: 'default',
          },
          {
            text: 'Paylaş',
            onPress: () => sharePDF(file.filePath),
          },
          {
            text: 'Aç',
            onPress: () => openPDF(file.filePath),
          },
        ]
      );

      return file.filePath;
    } else {
      throw new Error('PDF oluşturulamadı');
    }

  } catch (error) {
    console.error('PDF export hatası:', error);
    Alert.alert('Hata', 'PDF oluşturulamadı: ' + error.message);
    throw error;
  }
};

// PDF'i paylaşma fonksiyonu
const sharePDF = async (filePath) => {
  try {
    const shareOptions = {
      title: 'CargoCalc Hesap Özeti',
      url: `file://${filePath}`,
      type: 'application/pdf',
      filename: filePath.split('/').pop(),
    };

    await Share.open(shareOptions);
  } catch (error) {
    console.error('PDF paylaşma hatası:', error);
    // Sessizce geç, paylaşma iptal edilmiş olabilir
  }
};

// PDF'i açma fonksiyonu
const openPDF = async (filePath) => {
  try {
    const shareOptions = {
      url: `file://${filePath}`,
      type: 'application/pdf',
    };

    await Share.open(shareOptions);
  } catch (error) {
    console.error('PDF açma hatası:', error);
    Alert.alert('Hata', 'PDF açılamadı. Lütfen bir PDF okuyucu uygulaması yükleyin.');
  }
};

// PDF dosyasını silme fonksiyonu
export const deletePDF = async (filename) => {
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
    console.error('PDF silme hatası:', error);
    return false;
  }
};

// Kaydedilen PDF dosyalarını listeleme
export const listPDFFiles = async () => {
  try {
    const documentPath = Platform.select({
      ios: RNFS.DocumentDirectoryPath,
      android: RNFS.DownloadDirectoryPath,
    });
    
    const files = await RNFS.readDir(documentPath);
    const pdfFiles = files.filter(file => file.name.endsWith('.pdf'));
    return pdfFiles;
  } catch (error) {
    console.error('PDF listeleme hatası:', error);
    return [];
  }
};