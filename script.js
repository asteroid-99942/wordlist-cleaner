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

let files = [];

// UI handlers
document.getElementById("dropzone").onclick = () =>
    document.getElementById("fileInput").click();

document.getElementById("fileInput").onchange = (e) =>
    files = [...e.target.files];

document.getElementById("dropzone").ondrop = (e) => {
    e.preventDefault();
    files = [...e.dataTransfer.files];
};

document.getElementById("dropzone").ondragover = (e) => e.preventDefault();

document.getElementById("processBtn").onclick = async () => {
    if (files.length === 0) return alert("No files selected.");

    let rawWords = [];

    // Read all files
    for (const file of files) {
        const text = await file.text();
        rawWords.push(...text.split(/\r?\n/));
    }

    let accepted = new Set();
    let rejected = [];

    let rej_empty = 0;
    let rej_short = 0;
    let rej_unsalvageable = 0;

    // Show progress bar
    const progressContainer = document.getElementById("progressContainer");
    const bar = document.getElementById("progressBarInner");
    const text = document.getElementById("progressText");

    progressContainer.style.display = "block";
    bar.style.width = "0%";
    text.textContent = "0% complete";

    // Process words with progress updates
    for (let i = 0; i < rawWords.length; i++) {
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

        const pct = Math.floor((i / rawWords.length) * 100);
        bar.style.width = pct + "%";
        text.textContent = pct + "% complete";
    }

    bar.style.width = "100%";
    text.textContent = "100% complete";

    const cleanList = [...accepted].sort().join("\n");
    const rejectedList = [...new Set(rejected)].sort().join("\n");

    const stats = `
WORDLIST CLEANING REPORT
=========================

Total input words:        ${rawWords.length}
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

    document.getElementById("results").style.display = "block";

    document.getElementById("downloadClean").onclick = () =>
        downloadFile("combined.txt", cleanList);

    document.getElementById("downloadRejected").onclick = () =>
        downloadFile("rejected.txt", rejectedList);

    document.getElementById("downloadStats").onclick = () =>
        downloadFile("stats.txt", stats);

    setTimeout(() => {
        progressContainer.style.display = "none";
    }, 800);
};

function downloadFile(filename, content) {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
