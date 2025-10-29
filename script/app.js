'use strict';
// App de cifra (César) com UI minimalista e execução Python via Pyodide
// - Mantém estado de modo (encode/decode)
// - Carrega Pyodide assincronamente e expõe a função Python `caesar`
// - Faz validação simples e feedback de carregamento

// Referências de elementos da interface
const messageEl = document.getElementById('message');
const shiftEl = document.getElementById('shift');
const binaryInputEl = document.getElementById('binaryInput');
const morseInputEl = document.getElementById('morseInput');
const encodeBtn = document.getElementById('encode');
const decodeBtn = document.getElementById('decode');
const runBtn = document.getElementById('run');
const clearBtn = document.getElementById('clear');
const copyBtn = document.getElementById('copy');
const outputEl = document.getElementById('output');
const errorEl = document.getElementById('error');
const themeToggleEl = document.getElementById('themeToggle');
let spinnerEl = null;

// Estado da aplicação
let mode = 'encode';
let pyReady = false; // indica quando o runtime Python está pronto
const hasCipherUI = !!document.getElementById('cipherForm');
const hasBinaryUI = !!document.getElementById('binaryForm');
const hasMorseUI = !!document.getElementById('morseForm');
const needsPython = hasCipherUI || hasBinaryUI || hasMorseUI;

// Atualiza placeholders conforme a página e o modo
function updatePlaceholders() {
    if (hasCipherUI && messageEl) {
        messageEl.placeholder = mode === 'encode' ? 'Type text to encrypt' : 'Type text to decrypt';
    }
    if (hasBinaryUI && binaryInputEl) {
        binaryInputEl.placeholder = mode === 'encode'
            ? 'e.g. Type text to binary'
            : 'e.g. Type binary to text';
    }
    if (hasMorseUI && morseInputEl) {
        morseInputEl.placeholder = mode === 'encode'
            ? 'e.g. Type text to morse'
            : 'e.g. Type morse to text';
    }
}

// Alterna o modo visualmente e no estado
function setMode(newMode) {
    mode = newMode;
    if (encodeBtn) encodeBtn.classList.toggle('active', mode === 'encode');
    if (decodeBtn) decodeBtn.classList.toggle('active', mode === 'decode');
    updatePlaceholders();
}

// Carrega Pyodide e executa o módulo Python da cifra
let pyodideLoader = null;
const cipherPyPath = window.location.pathname.includes('/pages/')
    ? '../script/cipher.py'
    : 'script/cipher.py';

async function ensurePythonReady() {
    if (!needsPython) return;
    try {
        if (!window.loadPyodide) {
            await new Promise((resolve, reject) => {
                const s = document.createElement('script');
                s.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
                s.defer = true;
                s.onload = resolve;
                s.onerror = reject;
                document.head.appendChild(s);
            });
        }
    } catch (_) {
        throw new Error('Failed to load Python runtime. Check your internet connection or if the CDN is blocked.');
    }
    try {
        if (!pyodideLoader) {
            pyodideLoader = (async () => {
                const py = await loadPyodide();
                const res = await fetch(cipherPyPath);
                if (!res.ok) throw new Error('Failed to fetch cipher.py');
                const code = await res.text();
                await py.runPythonAsync(code);
                pyReady = true;
                return py;
            })();
        }
        await pyodideLoader;
    } catch (e) {
        throw new Error('Failed to initialize Python code. Please refresh or try again.');
    }
}

// Chama função Python exposta no módulo
async function runPythonFn(fnName, ...args) {
    const py = await pyodideLoader;
    const fn = py.globals.get(fnName);
    try {
        const result = fn(...args);
        // Converte PyProxy/objeto Python em string JS quando aplicável
        if (result == null) return '';
        if (typeof result === 'string') return result;
        if (typeof result.toString === 'function') return result.toString();
        return String(result);
    } finally {
        if (fn && typeof fn.destroy === 'function') fn.destroy();
    }
}

// Utilitário: limita e normaliza número dentro de [min, max]
function clamp(n, min, max) {
    if (!Number.isFinite(n)) return null;
    const v = Math.trunc(n);
    return Math.min(max, Math.max(min, v));
}

// Valida o deslocamento informado
function validate() {
    errorEl.textContent = '';
    const shiftVal = clamp(Number(shiftEl.value), 0, 25);
    if (shiftVal === null) {
        errorEl.textContent = 'Enter a valid shift (0 to 25).';
        return null;
    }
    return shiftVal;
}

// Executa a ação conforme a página e mostra o resultado
async function handleRun() {
    errorEl.textContent = '';
    const shouldDisable = !!runBtn;
    if (shouldDisable) runBtn.disabled = true;
    showLoading();
    try {
        if (!pyReady) {
            errorEl.textContent = 'Loading Python...';
            await ensurePythonReady();
            errorEl.textContent = '';
        }
        if (hasCipherUI) {
            const s = validate();
            if (s === null) return;
            const text = String(messageEl?.value || '');
            if (!text.trim()) {
                errorEl.textContent = 'Enter some text to process.';
                return;
            }
            outputEl.value = await runPythonFn('caesar', text, s, mode);
            return;
        }
        if (hasBinaryUI) {
            const input = String((messageEl?.value ?? binaryInputEl?.value) || '');
            if (!input.trim()) {
                errorEl.textContent = mode === 'encode' ? 'Type text to convert to binary.' : 'Type binary (8-bit blocks) to decode.';
                return;
            }
            outputEl.value = mode === 'encode'
                ? await runPythonFn('text_to_binary', input)
                : await runPythonFn('binary_to_text', input);
            return;
        }
        if (hasMorseUI) {
            const input = String((messageEl?.value ?? morseInputEl?.value) || '');
            if (!input.trim()) {
                errorEl.textContent = mode === 'encode' ? 'Type text to convert to Morse.' : 'Type Morse code to decode.';
                return;
            }
            outputEl.value = mode === 'encode'
                ? await runPythonFn('text_to_morse', input)
                : await runPythonFn('morse_to_text', input);
            return;
        }
    } catch (e) {
        errorEl.textContent = e && e.message ? e.message : 'An error occurred. Please try again.';
    } finally {
        if (shouldDisable) runBtn.disabled = false;
        hideLoading();
    }
}

function showLoading() {
    document.body.setAttribute('aria-busy', 'true');
    if (!spinnerEl) {
        spinnerEl = document.createElement('div');
        spinnerEl.className = 'spinner-overlay';
        spinnerEl.innerHTML = '<div class="spinner"></div>';
        document.body.appendChild(spinnerEl);
    }
    spinnerEl.classList.add('active');
}

function hideLoading() {
    document.body.removeAttribute('aria-busy');
    if (spinnerEl) spinnerEl.classList.remove('active');
}

// Copia o resultado para a área de transferência
async function handleCopy() {
    const text = String(outputEl.value || '');
    if (!text) return;
    try {
        await navigator.clipboard.writeText(text);
        if (copyBtn) {
            const old = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            setTimeout(() => { copyBtn.textContent = old; }, 1000);
        }
    } catch (_) {
        outputEl.select();
        document.execCommand('copy');
    }
}

// Limpa campos e mensagens
function handleClear() {
    if (messageEl) messageEl.value = '';
    if (binaryInputEl) binaryInputEl.value = '';
    if (morseInputEl) morseInputEl.value = '';
    outputEl.value = '';
    errorEl.textContent = '';
}

// Tema: persistência e alternância (default: dark)
function getStoredTheme() {
    try { return localStorage.getItem('theme'); } catch (_) { return null; }
}

function storeTheme(theme) {
    try { localStorage.setItem('theme', theme); } catch (_) {}
}

function applyTheme(theme) {
    const t = theme === 'light' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', t);
    if (themeToggleEl) themeToggleEl.textContent = t === 'dark' ? 'Light mode' : 'Dark mode';
}

function initTheme() {
    const stored = getStoredTheme();
    const initial = stored || 'dark';
    applyTheme(initial);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    storeTheme(next);
}

// Ações da interface
if (encodeBtn) encodeBtn.addEventListener('click', () => setMode('encode'));
if (decodeBtn) decodeBtn.addEventListener('click', () => setMode('decode'));
if (runBtn) runBtn.addEventListener('click', handleRun);
if (copyBtn) copyBtn.addEventListener('click', handleCopy);
if (clearBtn) clearBtn.addEventListener('click', handleClear);
if (themeToggleEl) themeToggleEl.addEventListener('click', toggleTheme);

// Modo padrão
if (encodeBtn && decodeBtn) setMode('encode');
else updatePlaceholders();
initTheme();

