import CryptoJS from 'crypto-js';

// ─── DOM refs ────────────────────────────────────────────────────────────────
const plaintextInput     = document.getElementById('plaintext-input');
const secretKeyInput     = document.getElementById('secret-key-input');
const toggleKeyBtn       = document.getElementById('toggle-key-btn');

const btnCifrar          = document.getElementById('btn-cifrar');
const cipherOutput       = document.getElementById('cipher-output');
const cipherPlaceholder  = document.getElementById('cipher-placeholder');
const copyCipherBtn      = document.getElementById('copy-cipher-btn');

const cipherInputDecrypt = document.getElementById('cipher-input-decrypt');
const btnDescifrar       = document.getElementById('btn-descifrar');
const decipherOutput     = document.getElementById('decipher-output');
const decipherPlaceholder= document.getElementById('decipher-placeholder');
const copyDecipherBtn    = document.getElementById('copy-decipher-btn');

const statusRow          = document.getElementById('status-row');
const statusDot          = document.getElementById('status-dot');
const statusMsg          = document.getElementById('status-msg');
const toast              = document.getElementById('toast');

// ─── Cipher / Decipher functions (CryptoJS AES) ──────────────────────────────

/**
 * Cifra un texto usando AES con la llave provista.
 * @param {string} texto  Texto plano
 * @param {string} llave  Llave secreta
 * @returns {string}      Texto cifrado en Base64
 */
const cifrar = (texto, llave) => {
  const textoCifrado = CryptoJS.AES.encrypt(texto, llave).toString();
  return textoCifrado;
};

/**
 * Descifra un texto cifrado AES con la llave provista.
 * @param {string} texto  Texto cifrado en Base64
 * @param {string} llave  Llave secreta
 * @returns {string}      Texto descifrado (UTF-8)
 */
const descifrar = (texto, llave) => {
  const bytes           = CryptoJS.AES.decrypt(texto, llave);
  const textoDescifrado = bytes.toString(CryptoJS.enc.Utf8);
  return textoDescifrado;
};

// ─── Toggle key visibility ────────────────────────────────────────────────────
toggleKeyBtn.addEventListener('click', () => {
  const isPassword = secretKeyInput.type === 'password';
  secretKeyInput.type = isPassword ? 'text' : 'password';
  toggleKeyBtn.textContent = isPassword ? 'Ocultar' : 'Mostrar';
});

// ─── Encrypt button ──────────────────────────────────────────────────────────
btnCifrar.addEventListener('click', () => {
  const texto = plaintextInput.value.trim();
  const llave = secretKeyInput.value;

  if (!texto) {
    showToast('Escribe un mensaje antes de cifrar.');
    shakeElement(plaintextInput);
    return;
  }
  if (!llave) {
    showToast('La llave secreta no puede estar vacía.');
    shakeElement(secretKeyInput);
    return;
  }

  const resultado = cifrar(texto, llave);

  // Show result
  cipherPlaceholder.hidden = true;
  cipherOutput.hidden      = false;
  cipherOutput.textContent = resultado;
  copyCipherBtn.hidden     = false;

  // Auto-fill decrypt textarea
  cipherInputDecrypt.value = resultado;

  // Reset decipher panel
  resetDecipherPanel();

  showToast('Texto cifrado correctamente.');
});

// ─── Decrypt button ──────────────────────────────────────────────────────────
btnDescifrar.addEventListener('click', () => {
  const textoCifrado = cipherInputDecrypt.value.trim();
  const llave        = secretKeyInput.value;

  if (!textoCifrado) {
    showToast('No hay texto cifrado para descifrar.');
    shakeElement(cipherInputDecrypt);
    return;
  }
  if (!llave) {
    showToast('La llave secreta no puede estar vacía.');
    shakeElement(secretKeyInput);
    return;
  }

  try {
    const resultado = descifrar(textoCifrado, llave);

    if (!resultado) {
      throw new Error('La llave es incorrecta o el texto está corrompido.');
    }

    // Show success
    decipherPlaceholder.hidden = true;
    decipherOutput.hidden      = false;
    decipherOutput.textContent = resultado;
    copyDecipherBtn.hidden     = false;

    setStatus('success', 'Descifrado exitoso.');
    showToast('Texto descifrado correctamente.');

  } catch (err) {
    setStatus('error', `Error: ${err.message}`);
    decipherPlaceholder.hidden = false;
    decipherOutput.hidden      = true;
    copyDecipherBtn.hidden     = true;
    showToast('No se pudo descifrar. Verifica la llave.');
  }
});

// ─── Copy buttons ─────────────────────────────────────────────────────────────
copyCipherBtn.addEventListener('click', () => {
  copyToClipboard(cipherOutput.textContent, 'Texto cifrado copiado.');
});

copyDecipherBtn.addEventListener('click', () => {
  copyToClipboard(decipherOutput.textContent, 'Texto descifrado copiado.');
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
function resetDecipherPanel() {
  decipherPlaceholder.hidden = false;
  decipherOutput.hidden      = true;
  copyDecipherBtn.hidden     = true;
  statusRow.hidden           = true;
  statusDot.className        = 'status-dot';
  statusMsg.className        = 'status-msg';
  statusMsg.textContent      = '';
}

function setStatus(type, message) {
  statusRow.hidden     = false;
  statusDot.className  = `status-dot ${type}`;
  statusMsg.className  = `status-msg ${type}`;
  statusMsg.textContent = message;
}

let toastTimer = null;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

function shakeElement(el) {
  el.style.animation = 'none';
  el.offsetHeight; // reflow
  el.style.animation = 'shake 0.4s ease';
  el.addEventListener('animationend', () => { el.style.animation = ''; }, { once: true });
}

async function copyToClipboard(text, successMsg) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(successMsg);
  } catch {
    showToast('No se pudo copiar al portapapeles.');
  }
}

// ─── Shake keyframe (injected dynamically) ────────────────────────────────────
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%       { transform: translateX(-6px); }
    40%       { transform: translateX(6px); }
    60%       { transform: translateX(-4px); }
    80%       { transform: translateX(4px); }
  }
`;
document.head.appendChild(style);
