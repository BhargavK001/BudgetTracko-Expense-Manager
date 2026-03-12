import * as FileSystem from 'expo-file-system/legacy';

// ─── Types ────────────────────────────────────────────────
export interface BillParseResult {
    merchantName: string;
    date: Date | null;
    totalAmount: number;
    lineItems: { name: string; price: number }[];
    rawText: string;
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
                try {
                    const parsed = new Date(match[0]);
                    if (!isNaN(parsed.getTime())) {
                        result.date = parsed;
                        break;
                    }
                } catch { /* skip */ }
            }
        }
        if (result.date) break;
    }

    // 3. Total amount — look for "total", "grand total", "amount due", etc.
    const totalPatterns = [
        /(?:grand\s*total|total\s*amount|amount\s*due|net\s*total|total)[:\s]*[₹$]?\s*([\d,]+\.?\d*)/i,
        /(?:total)[:\s]*[₹$]?\s*([\d,]+\.?\d*)/i,
    ];

    for (const line of lines) {
        for (const pat of totalPatterns) {
            const match = line.match(pat);
            if (match) {
                const amt = parseFloat(match[1].replace(/,/g, ''));
                if (!isNaN(amt) && amt > 0) {
                    // Keep the largest "total" found (grand total > subtotal)
                    if (amt > result.totalAmount) {
                        result.totalAmount = amt;
                    }
                }
            }
        }
    }

    // 4. Line items — lines containing a price but NOT total/tax/discount
    const pricePattern = /[₹$]?\s*([\d,]+\.?\d{0,2})\s*$/;
    const skipWords = /total|tax|gst|cgst|sgst|discount|subtotal|sub\s*total|service\s*charge|round|change|cash|card|upi|paid|balance|vat/i;

    for (const line of lines) {
        if (skipWords.test(line)) continue;
        const priceMatch = line.match(pricePattern);
        if (priceMatch) {
            const price = parseFloat(priceMatch[1].replace(/,/g, ''));
            if (price > 0 && price < result.totalAmount * 1.5) {
                // Extract the item name (everything before the price)
                const itemName = line.replace(pricePattern, '').trim();
                if (itemName && itemName.length > 1 && !/^\d+$/.test(itemName)) {
                    result.lineItems.push({ name: itemName, price });
                }
            }
        }
    }

    // Fallback: if no total was found, sum up line items
    if (result.totalAmount === 0 && result.lineItems.length > 0) {
        result.totalAmount = result.lineItems.reduce((sum, item) => sum + item.price, 0);
    }

    return result;
}

// ─── Format line items as notes string ────────────────────
export function formatLineItemsAsNotes(items: { name: string; price: number }[]): string {
    if (items.length === 0) return '';
    return items.map(item => `• ${item.name} — ₹${item.price.toFixed(2)}`).join('\n');
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
