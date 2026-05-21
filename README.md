# Wordlist Cleaner

A fast, browser‑based tool for cleaning, normalising, and validating extremely large wordlists.  
Designed for security‑focused workflows where high‑entropy wordlists are essential — such as passphrase generation, password managers, and research.

All processing is performed **client‑side** using a Web Worker, allowing the tool to handle multi‑million‑line lists without freezing the browser.

For non-technical users who just want to use the app out of the box, the app is available to use at 
https://asteroid-99942.github.io/wordlist-cleaner/

---

## 🔍 Features

- **Handles massive wordlists** (3M+ lines) without UI lag  
- **Client‑side processing only** — nothing is uploaded or stored  
- **Web Worker powered** for smooth, non‑blocking performance  
- **Word count preview** before processing  
- **Progress bar** with live updates  
- **Cleans and normalises words**:
  - Removes whitespace  
  - Removes accents/diacritics  
  - Converts to lowercase  
  - Removes digits  
  - Removes punctuation  
  - Removes non‑ASCII characters  
  - Filters out words shorter than 4 characters  
  - Deduplicates  
- **Outputs three files**:
  - `combined.txt` — cleaned, sorted, deduplicated list  
  - `rejected.txt` — words removed during cleaning  
  - `stats.txt` — detailed processing report  
- **ZIP download** containing all output files  

---

## 🚀 How It Works

1. Drag‑and‑drop one or more `.txt` wordlists into the dropzone  
2. The tool shows a **word count preview**  
3. Click **Process Wordlists**  
4. A Web Worker processes the data in the background  
5. The progress bar updates as the worker runs  
6. When complete, download:
   - Cleaned list  
   - Rejected list  
   - Stats report  
   - Or a ZIP containing all three  

---

## 🛠️ Technology

- **HTML / CSS / JavaScript**
- **Web Workers** for multi‑million‑line processing
- **JSZip** for ZIP file generation
- **No backend** — works entirely offline once loaded

---

## 🔐 Why This Exists

Entropy matters.  
The more high‑quality words available to a passphrase generator, the stronger the resulting passwords.

This tool makes it easy to:

- Merge multiple wordlists  
- Clean and normalise them  
- Remove junk, duplicates, and noise  
- Produce a high‑entropy, security‑grade final list  

All without exposing your data to any server.


## 📦 Running Locally

Just clone the repo and open `index.html` in any modern browser:
