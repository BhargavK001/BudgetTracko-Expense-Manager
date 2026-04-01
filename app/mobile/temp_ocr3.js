const rawText = `HOTEL VAISHALI
FC ROAD,PUNE - 04
PLAIN UTTAPPHAM 2 100.00 200.00
CHATNI/SAMBAR 2 15.00 30.00
Total Qty: 4 Sub Total
230.00
CGST@2.5 2.5% 5.75
SGST@2.5 2.5% 5.75
Round off +0.50
Grand Total
242.00
Thank You visit Again
Cash Tendered 500.00
Change 258.00`;

const lines = rawText.split("\n").map(l => l.trim()).filter(Boolean);
const result = { totalAmount: 0, lineItems: [] };

const extractAmounts = (text) => {
    const matches = text.match(/\b\d{1,7}(?:,\d{3})*(?:\.\d{2})\b/g) || [];
    return matches.map(m => parseFloat(m.replace(/,/g, '')));
};

const totalRegex = /total|amount\s*due|net\s*amount|pay|grand/i;
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (totalRegex.test(line)) {
        const sameLineAmounts = extractAmounts(line);
        if (sameLineAmounts.length > 0) {
            const maxOnLine = Math.max(...sameLineAmounts);
            if (maxOnLine > result.totalAmount) { result.totalAmount = maxOnLine; }
        } else {
            for (let offset = 1; offset <= 2; offset++) {
                if (lines[i + offset]) {
                    const nextAmounts = extractAmounts(lines[i + offset]);
                    if (nextAmounts.length > 0) {
                        const maxNext = Math.max(...nextAmounts);
                        if (maxNext > result.totalAmount) { result.totalAmount = maxNext; }
                        break;
                    }
                }
            }
        }
    }
}
if (result.totalAmount === 0) {
    const allAmounts = extractAmounts(rawText);
    if (allAmounts.length > 0) { result.totalAmount = Math.max(...allAmounts); }
}

const pricePattern = /[$]?\s*([\d,]+\.?\d{2})\s*$/;
const skipWords = /total|amount\s*due|net|tax|gst|cgst|sgst|discount|subtotal|sub\s*total|service|round|change|cash|card|upi|paid|balance|vat|date|time|token|bill|biller|name|dine|table|order|customer/i;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (skipWords.test(line)) continue;

    const priceMatch = line.match(pricePattern);
    if (priceMatch) {
        const price = parseFloat(priceMatch[1].replace(/,/g, ''));
        if (price > 0 && price < result.totalAmount * 1.5) {
            let itemName = line.replace(pricePattern, '').trim();

            if ((!itemName || /^\d+$/.test(itemName)) && i > 0) {
                const prevLine = lines[i - 1];
                if (!skipWords.test(prevLine) && !pricePattern.test(prevLine)) {
                    itemName = prevLine + ' ' + itemName;
                }
            }

            if (itemName && itemName.length > 1 && !/^\d+$/.test(itemName)) {
                result.lineItems.push({ name: itemName.trim(), price });
            }
        }
    }
}

console.log("Parsed:", result);
