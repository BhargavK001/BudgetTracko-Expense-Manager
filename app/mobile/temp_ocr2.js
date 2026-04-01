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
let totalAmount = 0;

// find amounts in format 1,000.00 or 100.00
const extractAmounts = (str) => {
    const matches = str.match(/\b\d{1,7}(?:,\d{3})*(?:\.\d{2})\b/g) || [];
    return matches.map(m => parseFloat(m.replace(/,/g, '')));
};

const totalRegex = /total|amount due|net amount|grand/i;
for (let i = 0; i < lines.length; i++) {
    if (totalRegex.test(lines[i])) {
        // Find amounts on same line
        const sameLine = extractAmounts(lines[i]);
        if (sameLine.length > 0) {
            totalAmount = Math.max(totalAmount, ...sameLine);
        } else {
            // Check next 2 lines
            for (let j = 1; j <= 2; j++) {
                if (lines[i+j]) {
                    const nextLineAmts = extractAmounts(lines[i+j]);
                    if (nextLineAmts.length > 0) {
                        totalAmount = Math.max(totalAmount, ...nextLineAmts);
                        break; // usually total is the first number after
                    }
                }
            }
        }
    }
}
console.log("Found Total:", totalAmount);
