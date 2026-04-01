import * as FileSystem from 'expo-file-system/legacy';

// ─── Types ────────────────────────────────────────────────
export interface BillParseResult {
    merchantName: string;
    date: Date | null;
    totalAmount: number;
    lineItems: { name: string; price: number }[];
    rawText: string;
    detectedCategory?: string;
}

// ─── Google Cloud Vision OCR ──────────────────────────────
const GOOGLE_VISION_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_VISION_KEY || '';

export async function extractTextFromImage(imageUri: string): Promise<string> {
    // Read image as base64
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: 'base64',
    });

    if (!GOOGLE_VISION_API_KEY) {
        console.warn('No Google Vision API key set. Using mock OCR.');
        return simulateMockOCR();
    }

    const body = {
        requests: [{
            image: { content: base64 },
            features: [{ type: 'TEXT_DETECTION', maxResults: 1 }],
        }],
    };

    const res = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        },
    );

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Vision API error: ${res.status} - ${errText}`);
    }

    const data = await res.json();
    const fullText = data?.responses?.[0]?.fullTextAnnotation?.text || '';
    return fullText;
}

// ─── Bill Parsing Logic ───────────────────────────────────
export function parseBillText(rawText: string): BillParseResult {
    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

    const result: BillParseResult = {
        merchantName: '',
        date: null,
        totalAmount: 0,
        lineItems: [],
        rawText,
        detectedCategory: undefined,
    };

    if (lines.length === 0) return result;

    // 1. Merchant name — usually the first non-empty line
    result.merchantName = lines[0];

    // 2. Date — look for common patterns
    const datePatterns = [
        /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,  // DD/MM/YYYY or MM/DD/YYYY
        /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+(\d{2,4})/i,
        /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+(\d{1,2}),?\s+(\d{2,4})/i,
    ];

    for (const line of lines) {
        for (const pat of datePatterns) {
            const match = line.match(pat);
            if (match) {
                // Manually parse DD/MM/YY as it's common in India and Date() can be hit-or-miss
                if (pat.source.includes('\\d{1,2})[\\/\\-](\\d{1,2})')) {
                    const d = parseInt(match[1]);
                    const m = parseInt(match[2]) - 1;
                    let y = parseInt(match[3]);
                    if (y < 100) y += 2000;
                    const parsed = new Date(y, m, d);
                    if (!isNaN(parsed.getTime())) {
                        result.date = parsed;
                        break;
                    }
                } else {
                    try {
                        const parsed = new Date(match[0]);
                        if (!isNaN(parsed.getTime())) {
                            result.date = parsed;
                            break;
                        }
                    } catch { /* skip */ }
                }
            }
        }
        if (result.date) break;
    }

    // Helper: extracts all decimal currency amounts from a string
    const extractAmounts = (text: string, requireDecimal = true): number[] => {
        const regex = requireDecimal 
            ? /\b\d{1,7}(?:,\d{3})*(?:\.\d{1,2})\b/g 
            : /\b\d{1,7}(?:,\d{3})*(?:\.\d{1,2})?\b/g;
        const matches = text.match(regex) || [];
        return matches.map(m => parseFloat(m.replace(/,/g, '')));
    };

    // 3. Total amount — look for "total", "grand total", "amount due", etc.
    const totalRegex = /total|amount\s*due|net\s*amount|pay|grand/i;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (totalRegex.test(line)) {
            // First check if amount is on the same line (lenient on decimal if "total" is in the same line)
            const sameLineAmounts = extractAmounts(line, false);
            if (sameLineAmounts.length > 0) {
                const maxOnLine = Math.max(...sameLineAmounts);
                if (maxOnLine > result.totalAmount && maxOnLine !== 0) {
                    result.totalAmount = maxOnLine;
                }
            } else {
                // Check next 2 lines for an orphaned float amount (require decimal strictly to avoid matching random IDs)
                for (let offset = 1; offset <= 2; offset++) {
                    if (lines[i + offset]) {
                        const nextAmounts = extractAmounts(lines[i + offset], true);
                        if (nextAmounts.length > 0) {
                            const maxNext = Math.max(...nextAmounts);
                            if (maxNext > result.totalAmount) {
                                result.totalAmount = maxNext;
                            }
                            break; 
                        }
                    }
                }
            }
        }
    }

    // Absolute fallback: If no total keyword worked, just find the largest decimal number on the whole bill
    if (result.totalAmount === 0) {
        const allAmounts = extractAmounts(rawText, true);
        if (allAmounts.length > 0) {
            // Filter out abnormally large values (like phone numbers mistakenly parsed) just in case
            const validAmounts = allAmounts.filter(a => a < 500000);
            if (validAmounts.length > 0) {
                result.totalAmount = Math.max(...validAmounts);
            }
        }
    }

    // 4. Line items — lines containing a price but NOT total/tax/discount
    const pricePattern = /[₹$]?\s*([\d,]+\.\d{2})\s*$/; // Require exactly 2 decimals for better filtering
    const skipWords = /total|amount\s*due|net|tax|gst|cgst|sgst|discount|subtotal|sub\s*total|service|round|change|cash|card|upi|paid|balance|vat|date|time|token|bill|biller|name|dine|table|order|customer/i;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (skipWords.test(line)) continue;

        const priceMatch = line.match(pricePattern);
        if (priceMatch) {
            const price = parseFloat(priceMatch[1].replace(/,/g, ''));
            if (price > 0 && price < result.totalAmount * 1.5) {
                let itemName = line.replace(pricePattern, '').trim();

                // If the item name is empty or just generic numbers, look at the previous line
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

    // Fallback: if no total was found, sum up line items
    if (result.totalAmount === 0 && result.lineItems.length > 0) {
        result.totalAmount = result.lineItems.reduce((sum, item) => sum + item.price, 0);
    }

    // 5. Attempt Category Detection
    result.detectedCategory = detectCategoryFromNameAndItems(result.merchantName, result.lineItems);

    return result;
}

// ─── Category Detection Heuristics ────────────────────────
export function detectCategoryFromNameAndItems(merchant: string, items: { name: string }[]): string {
    const textToAnalyze = (merchant + ' ' + items.map(i => i.name).join(' ')).toLowerCase();

    const categoryKeywords: Record<string, string[]> = {
        'Food & Dining': [
            'restaurant', 'pizza', 'burger', 'cafe', 'coffee', 'zomato', 'swiggy', 'mcdonalds', 'kfc', 'starbucks',
            'bakery', 'dining', 'food', 'pav', 'bhaji', 'rice', 'gravy', 'veg', 'chicken', 'thali', 'biryani', 'paneer',
            'dosa', 'idli', 'vada', 'roti', 'nan', 'curry', 'masala', 'fried', 'noodle', 'soup'
        ],
        'Groceries': ['supermarket', 'mart', 'grocery', 'milk', 'bread', 'vegetables', 'blinkit', 'zepto', 'instamart', 'bigbasket', 'dmart', 'reliance fresh'],
        'Transport': ['uber', 'ola', 'rapido', 'taxi', 'fuel', 'petrol', 'diesel', 'shell', 'hp', 'indian oil', 'toll', 'parking', 'flight', 'indigo', 'spicejet'],
        'Shopping': ['amazon', 'flipkart', 'myntra', 'nykaa', 'zara', 'h&m', 'mall', 'clothing', 'shoes', 'apparel', 'retail'],
        'Health & Fitness': ['pharmacy', 'hospital', 'clinic', 'apollo', 'netmeds', 'gym', 'cult.fit', 'fitness', 'medicine', 'doctor'],
        'Entertainment': ['movie', 'pvr', 'inox', 'bookmyshow', 'netflix', 'prime', 'spotify', 'games', 'playstation', 'steam', 'concert'],
        'Bills & Utilities': ['electricity', 'water', 'gas', 'internet', 'broadband', 'jio', 'airtel', 'vi', 'recharge', 'bescom', 'mahavitaran'],
    };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
        for (const word of keywords) {
            if (textToAnalyze.includes(word)) {
                return category;
            }
        }
    }

    return 'Miscellaneous'; // Fallback
}

// ─── Format line items as notes string ────────────────────
export function formatLineItemsAsNotes(items: { name: string; price: number }[], currencySymbol: string = '₹'): string {
    if (items.length === 0) return '';
    return items.map(item => `• ${item.name} — ${currencySymbol}${item.price.toFixed(2)}`).join('\n');
}

// ─── Mock OCR for testing without API key ─────────────────
function simulateMockOCR(): string {
    return [
        'Pizza Palace',
        '12/03/2026',
        '',
        'Margherita Pizza     350.00',
        'Garlic Bread         150.00',
        'Cold Drink            80.00',
        '',
        'Subtotal             580.00',
        'GST (5%)              29.00',
        'Grand Total          609.00',
        '',
        'Thank you! Visit again.',
    ].join('\n');
}
