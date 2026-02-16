const { Parser } = require('json2csv');
const csv = require('csv-parser');
const stream = require('stream');

/**
 * Convert JSON data to CSV
 * @param {Array} data - Array of objects
 * @param {Array} fields - Array of field names (optional)
 * @returns {String} CSV string
 */
exports.toCSV = (data, fields = []) => {
    try {
        const unsafeChars = ['=', '+', '-', '@'];
        const sanitizedData = data.map(row => {
            const newRow = { ...row };
            for (const key in newRow) {
                const value = newRow[key];
                if (typeof value === 'string' && unsafeChars.some(char => value.startsWith(char))) {
                    newRow[key] = `'${value}`;
                }
            }
            return newRow;
        });

        const opts = fields.length ? { fields } : {};
        const parser = new Parser(opts);
        return parser.parse(sanitizedData);
    } catch (err) {
        console.error('CSV Conversion Error:', err);
        throw new Error('Failed to convert data to CSV');
    }
};

/**
 * Parse CSV buffer to JSON
 * @param {Buffer} buffer - File buffer
 * @returns {Promise<Array>} Array of objects
 */
exports.parseCSV = (buffer) => {
    return new Promise((resolve, reject) => {
        const results = [];
        const bufferStream = new stream.PassThrough();
        bufferStream.end(buffer);

        bufferStream
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (err) => reject(err));
    });
};
