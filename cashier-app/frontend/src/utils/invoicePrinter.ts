export interface InvoiceData {
  id: string;
  tableNumber: number;
  customerName?: string;
  customerPhone?: string;
  items: InvoiceItem[];
  subtotal: number;
  discount?: number;
  tax?: number;
  total: number;
  paymentMethod?: 'cash' | 'card' | 'mixed';
  cashierName?: string;
  date?: Date;
  qrData?: {
    verificationUrl?: string;
    feedbackUrl?: string;
    invoiceData?: string;
  };
}

export interface InvoiceItem {
  name: string;
  nameEn?: string;
  nameAr?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

import QRCode from 'qrcode';

export type Language = 'fr' | 'en' | 'ar';

const translations = {
  fr: {
    invoice: 'FACTURE',
    receipt: 'REÇU',
    table: 'Table',
    customer: 'Client',
    phone: 'Téléphone',
    items: 'Articles',
    description: 'Description',
    quantity: 'Qté',
    unitPrice: 'Prix Unit.',
    total: 'Total',
    subtotal: 'Sous-total',
    discount: 'Remise',
    tax: 'TVA',
    grandTotal: 'TOTAL',
    paymentMethod: 'Mode de paiement',
    cash: 'Espèces',
    card: 'Carte',
    mixed: 'Mixte',
    cashier: 'Caissier',
    date: 'Date',
    time: 'Heure',
    thankYou: 'Merci pour votre visite !',
    welcome: 'Au revoir et à bientôt',
    currency: 'DA',
    qrCode: 'Code QR'
  },
  en: {
    invoice: 'INVOICE',
    receipt: 'RECEIPT',
    table: 'Table',
    customer: 'Customer',
    phone: 'Phone',
    items: 'Items',
    description: 'Description',
    quantity: 'Qty',
    unitPrice: 'Unit Price',
    total: 'Total',
    subtotal: 'Subtotal',
    discount: 'Discount',
    tax: 'Tax',
    grandTotal: 'TOTAL',
    paymentMethod: 'Payment Method',
    cash: 'Cash',
    card: 'Card',
    mixed: 'Mixed',
    cashier: 'Cashier',
    date: 'Date',
    time: 'Time',
    thankYou: 'Thank you for your visit!',
    welcome: 'Goodbye and see you soon',
    currency: 'DA',
    qrCode: 'QR Code'
  },
  ar: {
    invoice: 'فاتورة',
    receipt: 'إيصال',
    table: 'طاولة',
    customer: 'العميل',
    phone: 'الهاتف',
    items: 'العناصر',
    description: 'الوصف',
    quantity: 'الكمية',
    unitPrice: 'سعر الوحدة',
    total: 'المجموع',
    subtotal: 'المجموع الفرعي',
    discount: 'خصم',
    tax: 'ضريبة',
    grandTotal: 'المجموع الكامل',
    paymentMethod: 'طريقة الدفع',
    cash: 'نقداً',
    card: 'بطاقة',
    mixed: 'مختلط',
    cashier: 'أمين الصندوق',
    date: 'التاريخ',
    time: 'الوقت',
    thankYou: 'شكراً لزيارتكم!',
    welcome: 'مع السلامة وإلى اللقاء',
    currency: 'دج',
    qrCode: 'رمز الاستجابة السريعة'
  }
};

// Generate QR code data URL
async function generateQRCode(data: InvoiceData): Promise<string> {
  try {
    // Create simple QR data with basic invoice information
    const qrContent = data.qrData?.invoiceData || JSON.stringify({
      table: data.tableNumber,
      total: data.total,
      items: data.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.unitPrice
      })),
      date: data.date?.toISOString()
    });

    const qrCodeDataURL = await QRCode.toDataURL(qrContent, {
      width: 50,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return '';
  }
}

export async function generateInvoiceHTML(data: InvoiceData, language: Language = 'fr'): Promise<string> {
  const t = translations[language];
  const isRTL = language === 'ar';
  const currentDate = data.date || new Date();

  const formatCurrency = (amount: number): string => {
    return `${amount.toLocaleString()} ${t.currency}`;
  };

  const getPaymentMethodText = (method?: string): string => {
    if (!method) return '';
    switch (method) {
      case 'cash': return t.cash;
      case 'card': return t.card;
      case 'mixed': return t.mixed;
      default: return method;
    }
  };

  // Generate QR code
  const qrCodeDataURL = await generateQRCode(data);

  return `
    <!DOCTYPE html>
    <html dir="${isRTL ? 'rtl' : 'ltr'}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${t.invoice}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.1;
          color: #333;
          background: white;
          padding: 3mm;
          direction: ${isRTL ? 'rtl' : 'ltr'};
          font-size: 7px;
        }
        
        .invoice {
          width: 80mm;
          max-height: 120mm;
          margin: 0 auto;
          background: white;
          overflow: hidden;
        }
        
        .header {
          text-align: center;
          border-bottom: 1px solid #000;
          padding-bottom: 2mm;
          margin-bottom: 3mm;
        }
        
        .restaurant-name {
          font-size: 10px;
          font-weight: bold;
          margin-bottom: 1mm;
        }
        
        .invoice-title {
          font-size: 9px;
          font-weight: bold;
          margin: 1mm 0;
        }
        
        .invoice-info {
          margin-bottom: 3mm;
        }
        
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5mm;
          font-size: 7px;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 2mm;
        }
        
        .items-table th,
        .items-table td {
          padding: 0.5mm;
          text-align: ${isRTL ? 'right' : 'left'};
          border-bottom: 1px solid #ddd;
          font-size: 7px;
        }
        
        .items-table th {
          background-color: #f5f5f5;
          font-weight: bold;
        }
        
        .amount-col {
          text-align: right;
        }
        
        .totals {
          margin-top: 2mm;
          padding-top: 1mm;
          border-top: 1px solid #000;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5mm;
          font-size: 8px;
        }
        
        .grand-total {
          font-weight: bold;
          font-size: 16px;
          border-top: 2px solid #000;
          padding-top: 8px;
          margin-top: 8px;
        }
        
        .footer {
          text-align: center;
          margin-top: 2mm;
          padding-top: 1mm;
          border-top: 1px dashed #666;
          font-size: 6px;
          color: #666;
        }
        
        .payment-info {
          margin: 15px 0;
          padding: 10px;
          background-color: #f9f9f9;
          border-radius: 5px;
        }
        
        @media print {
          body {
            padding: 10px;
          }
          
          .invoice {
            max-width: 100%;
            margin: 0;
          }
          
          @page {
            size: 80mm auto;
            margin: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice">
        <!-- Header -->
        <div class="header">
          <div class="restaurant-name">Restaurant Al-Andalus</div>
          <div style="font-size: 12px; color: #666;">Adresse: 123 Rue de la Paix, Alger</div>
          <div style="font-size: 12px; color: #666;">Tél: +213 21 123 456</div>
          <div class="invoice-title">${t.invoice}</div>
        </div>
        
        <!-- Invoice Information -->
        <div class="invoice-info">
          <div class="info-row">
            <span>${t.date}: ${currentDate.toLocaleDateString(language === 'ar' ? 'ar-DZ' : language === 'en' ? 'en-US' : 'fr-FR')}</span>
            <span>${t.time}: ${currentDate.toLocaleTimeString(language === 'ar' ? 'ar-DZ' : language === 'en' ? 'en-US' : 'fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div class="info-row">
            <span>${t.table}: ${data.tableNumber}</span>
            <span>${t.cashier}: ${data.cashierName || 'N/A'}</span>
          </div>
          ${data.customerName ? `
          <div class="info-row">
            <span>${t.customer}:</span>
            <span>${data.customerName}</span>
          </div>
          ` : ''}
          ${data.customerPhone ? `
          <div class="info-row">
            <span>${t.phone}:</span>
            <span>${data.customerPhone}</span>
          </div>
          ` : ''}
          ${data.cashierName ? `
          <div class="info-row">
            <span>${t.cashier}:</span>
            <span>${data.cashierName}</span>
          </div>
          ` : ''}
        </div>
        
        <!-- Items Table -->
        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 40%">${t.description}</th>
              <th style="width: 15%">${t.quantity}</th>
              <th style="width: 20%">${t.unitPrice}</th>
              <th style="width: 25%" class="amount-col">${t.total}</th>
            </tr>
          </thead>
          <tbody>
            ${data.items.map(item => {
              const itemName = language === 'en' && item.nameEn ? item.nameEn : 
                               language === 'ar' && item.nameAr ? item.nameAr : 
                               item.name;
              return `
                <tr>
                  <td>${itemName}</td>
                  <td>${item.quantity}</td>
                  <td>${formatCurrency(item.unitPrice)}</td>
                  <td class="amount-col">${formatCurrency(item.total)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        
        <!-- Totals -->
        <div class="totals">
          <div class="total-row">
            <span>${t.subtotal}:</span>
            <span>${formatCurrency(data.subtotal)}</span>
          </div>
          
          ${data.discount ? `
          <div class="total-row">
            <span>${t.discount}:</span>
            <span>-${formatCurrency(data.discount)}</span>
          </div>
          ` : ''}
          
          ${data.tax ? `
          <div class="total-row">
            <span>${t.tax}:</span>
            <span>${formatCurrency(data.tax)}</span>
          </div>
          ` : ''}
          
          <div class="total-row grand-total">
            <span>${t.grandTotal}:</span>
            <span>${formatCurrency(data.total)}</span>
          </div>
        </div>
        
        <!-- Payment Information -->
        ${data.paymentMethod ? `
        <div class="payment-info">
          <div class="info-row">
            <span>${t.paymentMethod}:</span>
            <span>${getPaymentMethodText(data.paymentMethod)}</span>
          </div>
        </div>
        ` : ''}
        
        <!-- QR Code Section -->
        ${qrCodeDataURL ? `
        <div style="text-align: center; margin: 1mm 0; padding: 1mm; border: 1px dashed #666;">
          <div style="margin-bottom: 0.5mm;">
            <img src="${qrCodeDataURL}" alt="QR Code" style="width: 12mm; height: 12mm;" />
          </div>
          <div style="font-size: 6px; font-weight: bold;">${t.qrCode}</div>
          <div style="font-size: 5px; color: #666; margin-top: 0.5mm;">Table ${data.tableNumber} - ${data.total.toLocaleString()} ${t.currency}</div>
        </div>
        ` : ''}

        <!-- Footer -->
        <div class="footer">
          <div style="margin-bottom: 0.5mm;">${t.thankYou}</div>
          <div style="margin-bottom: 0.5mm;">${t.welcome}</div>
          <div style="font-size: 5px;">N° Facture: ${data.id}</div>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function printInvoice(data: InvoiceData, language: Language = 'fr'): Promise<void> {
  try {
    const htmlContent = await generateInvoiceHTML(data, language);
    
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for the content to load before printing
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500); // Increased timeout to allow QR code to load
      };
    } else {
      // Fallback: download as HTML file
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${data.id}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error('Error printing invoice:', error);
    // Fallback to simple print without QR code
    alert('Erreur lors de la génération du code QR. Impression sans QR code...');
  }
}

// Helper function to create mock invoice data for testing
export function createMockInvoiceData(tableNumber: number, customerName?: string): InvoiceData {
  return {
    id: `INV-${Date.now()}`,
    tableNumber,
    customerName,
    customerPhone: '+213 555 123 456',
    items: [
      {
        name: 'Couscous Royal',
        nameEn: 'Royal Couscous',
        nameAr: 'كسكس ملكي',
        quantity: 2,
        unitPrice: 800,
        total: 1600
      },
      {
        name: 'Thé à la menthe',
        nameEn: 'Mint Tea',
        nameAr: 'شاي بالنعناع',
        quantity: 2,
        unitPrice: 200,
        total: 400
      },
      {
        name: 'Baklawa',
        nameEn: 'Baklava',
        nameAr: 'بقلاوة',
        quantity: 4,
        unitPrice: 150,
        total: 600
      }
    ],
    subtotal: 2600,
    discount: 150,
    tax: 0,
    total: 2450,
    paymentMethod: 'card',
    cashierName: 'Younes',
    date: new Date(),
    qrData: {
      verificationUrl: `https://restaurant-al-andalus.com/verify/INV-${Date.now()}`,
      feedbackUrl: 'https://restaurant-al-andalus.com/feedback',
      invoiceData: `Invoice verification data for table ${tableNumber}`
    }
  };
}
