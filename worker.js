// Clean and normalise a single word
function cleanWord(word) {
    word = word.trim();
    if (!word) return "";

    // Remove accents
    word = word.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Lowercase
    word = word.toLowerCase();

    // Remove non-ASCII
    word = word.replace(/[^\x20-\x7E]/g, "");

    // Remove digits
    word = word.replace(/\d/g, "");

    // Remove punctuation (keep only a–z)
    word = word.replace(/[^a-z]/g, "");

    return word;
}

// MAIN WORKER ENTRY POINT
onmessage = (e) => {
    const msg = e.data;

    if (msg.type === 'process') {

        // ⭐ Split inside the worker (MUCH faster for millions of lines)
        const rawWords = msg.text.split(/\r?\n/);

        let accepted = new Set();
        let rejected = [];

        let rej_empty = 0;
        let rej_short = 0;
        let rej_unsalvageable = 0;

        const total = rawWords.length;
        const progressStep = Math.max(1, Math.floor(total / 100)); // ~1% steps

        for (let i = 0; i < total; i++) {
            const original = rawWords[i];
            let cleaned = cleanWord(original);

            if (!cleaned) {
                rej_empty++;
                rejected.push(original);
            } else if (cleaned.length < 4) {
                rej_short++;
                rejected.push(original);
            } else if (/[^a-z]/.test(cleaned)) {
                rej_unsalvageable++;
                rejected.push(original);
            } else {
                accepted.add(cleaned);
            }

            // Send progress updates
            if (i % progressStep === 0) {
                const percent = Math.floor((i / total) * 100);
                postMessage({ type: 'progress', percent });
            }
        }

        const cleanList = [...accepted].sort().join("\n");
        const rejectedList = [...new Set(rejected)].sort().join("\n");

        const stats = `
WORDLIST CLEANING REPORT
=========================

Total input words:        ${total}
Accepted words:           ${accepted.size}
Rejected words:           ${rejected.length}

Rejection breakdown:
 - Empty after cleaning:   ${rej_empty}
 - Too short (<4 chars):   ${rej_short}
 - Unsalvageable:          ${rej_unsalvageable}

Filters applied:
 - Trim whitespace
 - Remove accents/diacritics
 - Remove non-ASCII characters
 - Lowercase
 - Remove digits
 - Remove punctuation
 - Remove words < 4 characters
 - Deduplicate
`;

        // Send final result back to main thread
        postMessage({
            type: 'done',
            cleanList,
            rejectedList,
            stats
        });
    }
};
