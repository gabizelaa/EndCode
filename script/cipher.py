def caesar(text: str, shift: int, direction: str) -> str:
    """Aplica a Cifra de César.

    text: texto de entrada (mantém pontuação/espaços)
    shift: deslocamento (mod 26)
    direction: 'encode' para criptografar, 'decode' para descriptografar
    """

    # Normaliza deslocamento para [0, 25]
    try:
        s = int(shift)
    except Exception:
        s = 0
    s %= 26

    # Inverte o sinal ao decodificar
    if str(direction).lower() == "decode":
        s = -s

    out = []
    for ch in str(text):
        o = ord(ch)
        # Letras maiúsculas A-Z
        if 65 <= o <= 90:
            base = 65
            out.append(chr(((o - base + s) % 26) + base))
        # Letras minúsculas a-z
        elif 97 <= o <= 122:
            base = 97
            out.append(chr(((o - base + s) % 26) + base))
        # Outros caracteres permanecem inalterados
        else:
            out.append(ch)
    return "".join(out)


def binary_to_text(binary: str) -> str:
    """Decode ASCII text from a string of bits.

    Accepts formats like:
    - "01001000 01101001"
    - "0100100001101001"
    - Mixed whitespace/newlines
    Ignores non [01] characters.
    """
    if binary is None:
        return ""
    s = str(binary)
    # Keep only 0,1 and spaces
    filtered = []
    for ch in s:
        if ch in ("0", "1", " "):
            filtered.append(ch)
    s = "".join(filtered).strip()
    parts = [p for p in s.split() if p]
    bytes_list = []
    if parts:
        # Space-separated groups
        for p in parts:
            if len(p) == 8 and set(p) <= {"0", "1"}:
                bytes_list.append(p)
    else:
        # Continuous string, chunk every 8 bits
        s = s.replace(" ", "")
        for i in range(0, len(s), 8):
            chunk = s[i:i + 8]
            if len(chunk) == 8 and set(chunk) <= {"0", "1"}:
                bytes_list.append(chunk)
    out = []
    for b in bytes_list:
        try:
            out.append(chr(int(b, 2)))
        except Exception:
            pass
    return "".join(out)


_MORSE = {
    ".-": "A", "-...": "B", "-.-.": "C", "-..": "D", ".": "E", "..-.": "F",
    "--.": "G", "....": "H", "..": "I", ".---": "J", "-.-": "K", ".-..": "L",
    "--": "M", "-.": "N", "---": "O", ".--.": "P", "--.-": "Q", ".-.": "R",
    "...": "S", "-": "T", "..-": "U", "...-": "V", ".--": "W", "-..-": "X",
    "-.--": "Y", "--..": "Z",
    "-----": "0", ".----": "1", "..---": "2", "...--": "3", "....-": "4",
    ".....": "5", "-....": "6", "--...": "7", "---..": "8", "----.": "9",
    ".-.-.-": ".", "--..--": ",", "..--..": "?", ".----.": "'", "-.-.--": "!",
    "-..-.": "/", "-.--.": "(", "-.--.-": ")", ".-...": "&", "---...": ":",
    "-.-.-.": ";", "-...-": "=", ".-.-.": "+", "-....-": "-", "..--.-": "_",
    ".-..-.": '"', "...-..-": "$", ".--.-.": "@"
}


def morse_to_text(morse: str) -> str:
    """Decode text from Morse code.

    Word separators supported: '/', ' / ', or 3 spaces. Letters are space-separated.
    Example: '.... . .-.. .-.. --- / .-- --- .-. .-.. -.' -> 'HELLO WORLD'
    """
    if morse is None:
        return ""
    s = " ".join(str(morse).strip().split())  # normalize whitespace
    # Normalize word separators
    s = s.replace(" / ", " / ").replace("/", " / ")
    s = s.replace("   ", " / ")  # 3 spaces -> word sep
    words = [w for w in s.split(" / ") if w]
    decoded_words = []
    for w in words:
        letters = [l for l in w.split(" ") if l]
        decoded_letters = [_MORSE.get(l, "") for l in letters]
        decoded_words.append("".join(decoded_letters))
    return " ".join(decoded_words)


def text_to_binary(text: str) -> str:
    """Encode text to its binary (UTF-8) representation separated by spaces."""
    if text is None:
        return ""
    output_bits = []
    for ch in str(text):
        try:
            for b in ch.encode('utf-8'):
                output_bits.append(bin(b)[2:].zfill(8))
        except Exception:
            output_bits.append('????????')
    return ' '.join(output_bits)


_MORSE_ENCODE = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
    'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
    'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
    'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..',
    '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
    '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
    '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--',
    '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...',
    ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-',
    '"': '.-..-.', '$': '...-..-', '@': '.--.-.'
}


def text_to_morse(text: str) -> str:
    """Encode text to Morse code.

    Letters separated by spaces; words separated by ' / '.
    Unknown characters are skipped.
    """
    if text is None:
        return ""
    words = str(text).upper().split()
    encoded_words = []
    for w in words:
        codes = []
        for ch in w:
            code = _MORSE_ENCODE.get(ch)
            if code:
                codes.append(code)
        encoded_words.append(' '.join(codes))
    return ' / '.join(encoded_words)