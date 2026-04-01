import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { Transaction } from '../context/TransactionContext';

export const exportToCSV = async (transactions: Transaction[], dateRangeStr: string) => {
    try {
        if (transactions.length === 0) {
            alert('No transactions to export in this range.');
            return;
        }

        // Create CSV String
        const header = 'Date,Type,Category,Title,Amount,Note\n';
        const rows = transactions.map((t) => {
            // Escape quotes and wrap in quotes to handle commas within text
            const safeTitle = `"${(t.title || '').replace(/"/g, '""')}"`;
            const safeNote = `"${(t.note || '').replace(/"/g, '""')}"`;
            const dateStr = new Date(t.date).toLocaleDateString('en-US');
            const type = t.type.toUpperCase();
            
            return `${dateStr},${type},${t.category},${safeTitle},${t.amount},${safeNote}`;
        });
        const csvString = header + rows.join('\n');

        // Write to temporary file
        const filename = `Transactions_${dateRangeStr.replace(/[^a-zA-Z0-9]/g, '_')}.csv`;
        const fileUri = FileSystem.documentDirectory + filename;
        
        await FileSystem.writeAsStringAsync(fileUri, csvString, {
            encoding: FileSystem.EncodingType.UTF8,
        });

        // Share it
        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri, {
                mimeType: 'text/csv',
                dialogTitle: 'Export Transactions CSV',
            });
        } else {
            alert('Sharing is not available on this device');
        }
    } catch (error) {
        console.error('Error exporting CSV:', error);
        alert('Failed to export CSV. Please try again.');
    }
};

export const exportToPDF = async (transactions: Transaction[], dateRangeStr: string) => {
    try {
        if (transactions.length === 0) {
            alert('No transactions to export in this range.');
            return;
        }

        // Calculate Totals
        const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const netBalance = totalIncome - totalExpense;

        // Generate Table Rows
        const rowsHtml = transactions.map((t) => {
            const dateStr = new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const amountColor = t.type === 'expense' ? '#F43F5E' : '#10B981';
            const prefix = t.type === 'expense' ? '-' : '+';
            
            return `
                <tr>
                    <td>${dateStr}</td>
                    <td>
                        <div class="category">${t.category}</div>
                        <div class="title">${t.title || '-'}</div>
                    </td>
                    <td class="amount" style="color: ${amountColor};">
                        ${prefix}$${t.amount.toFixed(2)}
                    </td>
                </tr>
            `;
        }).join('');

        // HTML Template matching BudgetTracko's Dark Theme premium design
        const htmlContent = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                        body {
                            font-family: 'Inter', sans-serif;
                            background-color: #FFFFFF;
                            color: #111111;
                            margin: 0;
                            padding: 40px;
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 40px;
                            padding-bottom: 20px;
                            border-bottom: 1px solid #E2E8F0;
                        }
                        .logo {
                            font-size: 28px;
                            font-weight: 700;
                            background: -webkit-linear-gradient(#6366F1, #8B5CF6);
                            -webkit-background-clip: text;
                            -webkit-text-fill-color: transparent;
                            margin-bottom: 8px;
                        }
                        .report-title {
                            font-size: 16px;
                            color: #6366F1;
                            font-weight: 500;
                            margin-bottom: 4px;
                        }
                        .date-range {
                            font-size: 14px;
                            color: #8E8E93;
                        }
                        .summary-cards {
                            display: flex;
                            justify-content: space-between;
                            margin-bottom: 40px;
                        }
                        .card {
                            background-color: #F8F9FA;
                            border: 1px solid #E2E8F0;
                            border-radius: 12px;
                            padding: 20px;
                            width: 30%;
                            text-align: center;
                            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                        }
                        .card-title {
                            font-size: 12px;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                            color: #8E8E93;
                            margin-bottom: 8px;
                        }
                        .card-value {
                            font-size: 20px;
                            font-weight: 600;
                        }
                        .val-income { color: #10B981; }
                        .val-expense { color: #F43F5E; }
                        .val-net { color: ${netBalance >= 0 ? '#10B981' : '#F43F5E'}; }
                        
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 40px;
                        }
                        th {
                            text-align: left;
                            padding: 12px 16px;
                            color: #8E8E93;
                            font-size: 12px;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                            border-bottom: 1px solid #E2E8F0;
                        }
                        td {
                            padding: 16px;
                            border-bottom: 1px solid #F2F2F7;
                        }
                        .category {
                            font-weight: 500;
                            color: #111111;
                            margin-bottom: 4px;
                        }
                        .title {
                            font-size: 12px;
                            color: #8E8E93;
                        }
                        .amount {
                            font-weight: 600;
                            text-align: right;
                        }
                        .footer {
                            text-align: center;
                            color: #8E8E93;
                            font-size: 12px;
                            margin-top: 40px;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="logo">BudgetTracko</div>
                        <div class="report-title">Financial Transactions Report</div>
                        <div class="date-range">${dateRangeStr}</div>
                    </div>

                    <div class="summary-cards">
                        <div class="card">
                            <div class="card-title">Total Income</div>
                            <div class="card-value val-income">+$${totalIncome.toFixed(2)}</div>
                        </div>
                        <div class="card">
                            <div class="card-title">Total Spending</div>
                            <div class="card-value val-expense">-$${totalExpense.toFixed(2)}</div>
                        </div>
                        <div class="card">
                            <div class="card-title">Net Balance</div>
                            <div class="card-value val-net">${netBalance >= 0 ? '+' : '-'}$${Math.abs(netBalance).toFixed(2)}</div>
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th style="width: 20%">Date</th>
                                <th>Transaction</th>
                                <th style="text-align: right; width: 25%">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHtml}
                        </tbody>
                    </table>

                    <div class="footer">
                        Generated securely via BudgetTracko on ${new Date().toLocaleDateString('en-US')}
                    </div>
                </body>
            </html>
        `;

        const { uri } = await Print.printToFileAsync({
            html: htmlContent,
            base64: false
        });

        // Share it
        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri, {
                mimeType: 'application/pdf',
                dialogTitle: 'Export Transactions PDF',
            });
        } else {
            alert('Sharing is not available on this device');
        }

    } catch (error) {
        console.error('Error exporting PDF:', error);
        alert('Failed to export PDF. Please try again.');
    }
};
