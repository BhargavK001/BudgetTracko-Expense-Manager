const text = `HOTEL VAISHALI
FC ROAD,PUNE - 04
PH -25531244/25531184
GSTIN - 27cWXPS7897E2Z7
FSSAI - 11524035000395
Name:
Date: 17/01/26 Garden: G19
17:03
Cashier: abhishek Bill No.: 1114
Token No.: 1114 Assign to: Ram
Maruti Yadav
Item Qty. Price Amount
PLAIN UTTAPPHAM 2 100.00 200.00
CHATNI/SAMBAR 2 15.00 30.00
Total Qty: 4 Sub 230.00
Total
CGST@2.5 2.5% 5.75
SGST@2.5 2.5% 5.75
Round off +0.50
Grand Total  242.00
Thank You visit Again`;

const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

let totalAmount = 0;
const totalPatterns = [
    /(?:grand\s*total|total\s*amount|amount\s*due|net\s*total|total)[:\s]*[$]?\s*([\d,]+\.?\d*)/i,
    /(?:total)[:\s]*[$]?\s*([\d,]+\.?\d*)/i,
];

for (const line of lines) {
    for (const pat of totalPatterns) {
        const match = line.match(pat);
        if (match) {
            const amt = parseFloat(match[1].replace(/,/g, ''));
            if (!isNaN(amt) && amt > 0) {
                if (amt > totalAmount) {
                    totalAmount = amt;
                }
            }
        }
    }
}
console.log("Total Found:", totalAmount);
