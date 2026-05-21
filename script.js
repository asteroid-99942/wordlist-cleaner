let files = [];
let worker = new Worker('worker.js');

let latestClean = "";
let latestRejected = "";
let latestStats = "";

// UI handlers
const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("fileInput");
const processBtn = document.getElementById("processBtn");
const previewDiv = document.getElementById("preview");
const previewText = document.getElementById("previewText");
const progressContainer = document.getElementById("progressContainer");
const progressBar = document.getElementById("progressBarInner");
const progressText = document.getElementById("progressText");
const resultsDiv = document.getElementById("results");

// Clicking dropzone opens file dialog
dropzone.onclick = () => fileInput.click();

// File input change
fileInput.onchange = async (e) => {
    files = [...e.target.files];
    showPreview();
};

// Drag & drop
dropzone.ondrop = async (e) => {
    e.preventDefault();
    files = [...e.dataTransfer.files];
    showPreview();
};

dropzone.ondragover = (e) => e.preventDefault();

// UNIVERSAL TOKENIZER (same as worker)
// Splits on ANY non-letter, including commas, spaces, punctuation, tabs, pipes, etc.
function tokenize(text) {
    return text
        .split(/[^A-Za-zÀ-ÿ]+/)
        .filter(w => w.trim().length > 0);
}

// Word count preview (now accurate for comma-separated lists)
async function showPreview() {
    if (files.length === 0) return;

    let count = 0;
    for (const file of files) {
        const text = await file.text();
        const words = tokenize(text);
        count += words.length;
    }

    previewDiv.style.display = "block";
    previewText.textContent =
        `Total words detected across all files: ${count.toLocaleString()}`;
}

// Main processing – offloaded to worker
processBtn.onclick = async () => {
    if (files.length === 0) {
        alert("No files selected.");
        return;
    }

    // Read all files into one big string
    let bigText = "";
    for (const file of files) {
        bigText += await file.text() + "\n";
    }

    // Reset UI
    resultsDiv.style.display = "none";
    progressContainer.style.display = "block";
    progressBar.style.width = "0%";
    progressText.textContent = "0% complete";

    // Send big text to worker
    worker.postMessage({
        type: 'process',
        text: bigText
    });
};

// Handle messages from worker
worker.onmessage = (e) => {
    const msg = e.data;

    if (msg.type === 'progress') {
        progressBar.style.width = msg.percent + "%";
        progressText.textContent = msg.percent + "% complete";
    }

    if (msg.type === 'done') {
        progressBar.style.width = "100%";
        progressText.textContent = "100% complete";

        latestClean = msg.cleanList;
        latestRejected = msg.rejectedList;
        latestStats = msg.stats;

        // Show results + wire buttons
        resultsDiv.style.display = "block";

        document.getElementById("downloadClean").onclick = () =>
            downloadFile("combined.txt", latestClean);

        document.getElementById("downloadRejected").onclick = () =>
            downloadFile("rejected.txt", latestRejected);

        document.getElementById("downloadStats").onclick = () =>
            downloadFile("stats.txt", latestStats);

        document.getElementById("downloadZip").onclick = () => {
            const zip = new JSZip();
            zip.file("combined.txt", latestClean);
            zip.file("rejected.txt", latestRejected);
            zip.file("stats.txt", latestStats);

            zip.generateAsync({ type: "blob" }).then((content) => {
                const a = document.createElement("a");
                a.href = URL.createObjectURL(content);
                a.download = "wordlist-cleaner-output.zip";
                a.click();
            });
        };

        setTimeout(() => {
            progressContainer.style.display = "none";
        }, 800);
    }
};

// Helper: download a single file
function downloadFile(filename, content) {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
