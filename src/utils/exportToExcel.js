import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

export const exportOrdersToExcel = (orders, formatDate, formatTime) => {
  // Prepare data for Excel
  const exportData = orders.map((order) => ({
    'Order ID': order.orderNumber,
    'Customer Name': order.customerName,
    'Phone': order.phone || 'N/A',
    'Cake Type': order.cakeType,
    'Weight (lb)': order.weight,
    'Message on Cake': order.cakeMessage || 'N/A',
    'Total Price (₹)': order.totalPrice,
    'Advance Paid (₹)': order.advancePayment,
    'Amount Due (₹)': order.duesPayment,
    'Delivery Date': formatDate(order.deliveryDate),
    'Delivery Time': formatTime(order.deliveryTime),
    'Order Created': formatDate(order.createdAt),
    'Payment Status': Number(order.duesPayment) === 0 ? 'Paid' : 'Pending',
  }));

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 12 }, { wch: 20 }, { wch: 15 }, { wch: 15 },
    { wch: 12 }, { wch: 25 }, { wch: 15 }, { wch: 15 },
    { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
    { wch: 15 },
  ];

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

  // Generate filename with current date
  const today = new Date().toISOString().split('T')[0];
  const filename = `Cake4All_Orders_${today}.xlsx`;

  // Download file
  XLSX.writeFile(workbook, filename);
  
  toast.success(`Exported ${orders.length} orders to Excel!`);
};