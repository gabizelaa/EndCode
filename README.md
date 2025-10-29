# EndCode – Encode/Decode Toolkit

Ferramentas minimalistas para codificar e decodificar texto diretamente no navegador (via Python/Pyodide):
- Caesar Cipher: criptografar/descriptografar com deslocamento
- Binary: converter texto ⇄ binário (UTF‑8)
- Morse: converter texto ⇄ código Morse

## Demonstração
- Home: landing com resumo e links para as ferramentas
- Páginas:
  - `pages/caesar.html`
  - `pages/binary.html`
  - `pages/morse.html`

## Como usar
1) Baixe/clonar o repositório
2) Abra `index.html` no navegador
3) Use a navegação do topo (Home, Caesar, Binary, Morse)

Se seu navegador bloquear `fetch` de arquivos locais, execute um servidor simples:
- Python: `python -m http.server 5500` e acesse `http://localhost:5500/`

Observação: o runtime Python (Pyodide) é carregado sob demanda pela internet (CDN). A primeira execução pode levar alguns segundos.

## Recursos
- Tema dark/light com persistência
- Acessibilidade básica (`aria-current`, `aria-busy`)
- Spinner e mensagens de erro claras (rede/CDN vs execução)

## Estrutura
```
.
├─ index.html              # Home (landing)
├─ css/
│  └─ style.css            # Estilos (tema, layout, componentes)
├─ script/
│  ├─ app.js               # UI, eventos, carregamento Pyodide e ponte p/ Python
│  └─ cipher.py            # Funções: caesar, text↔binary, text↔morse
└─ pages/
   ├─ caesar.html          # Página Caesar
   ├─ binary.html          # Página Binary
   └─ morse.html           # Página Morse
```

## Tecnologias
- HTML, CSS, JavaScript
- Python no navegador (Pyodide/CDN)
- Sem backend

## Boas práticas
- Respeita `prefers-reduced-motion`
- Entradas validadas com mensagens guiadas
- Encode/Decode em modo duplo (texto→código e código→texto)

## Contribuição
Sugestões e PRs são bem-vindos. Abra issues com ideias, bugs ou melhorias.

## Licença
Uso livre para fins pessoais/educacionais. Ajuste conforme necessidade.
