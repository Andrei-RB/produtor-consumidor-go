/* Realce de sintaxe próprio — sem biblioteca externa.

   Decisão registrada no storyboard (Sprint 2): cada dependência de CDN é
   um jeito a mais do site perder uma camada inteira se a rede da
   faculdade bloquear o domínio no dia da apresentação. Um tokenizador de
   ~60 linhas cobre exatamente o que as cenas 09 e 18 precisam mostrar —
   C, Java e Go — sem esse risco.

   Não é um parser: é um tokenizador por regex, linha a linha. Reconhece
   comentário, string, número, palavra-chave e "risco" — os identificadores
   de sincronização manual que a narrativa quer destacar (pthread_mutex_lock,
   synchronized, wait...). Em Go essa lista fica vazia de propósito: o
   bloqueio de canal é sintaxe da linguagem, não uma chamada de biblioteca,
   e por isso já sai colorido como palavra-chave comum. */

const LINGUAGENS = {
  c: {
    palavrasChave: [
      "int", "char", "void", "struct", "return", "if", "else", "while",
      "for", "sizeof", "typedef", "static", "const", "unsigned", "do",
    ],
    risco: [
      "pthread_mutex_lock", "pthread_mutex_unlock",
      "pthread_cond_wait", "pthread_cond_signal",
      "sem_wait", "sem_post",
    ],
  },
  java: {
    palavrasChave: [
      "class", "void", "int", "boolean", "true", "false", "new", "return",
      "if", "else", "while", "for", "private", "public", "static", "final",
    ],
    risco: ["synchronized", "wait", "notifyAll", "notify"],
  },
  go: {
    palavrasChave: [
      "func", "package", "import", "return", "if", "else", "for", "range",
      "go", "chan", "select", "defer", "var", "const", "type", "struct",
    ],
    risco: [],
  },
};

const NUNCA = "[^\\s\\S]"; // não casa com nenhum caractere — placeholder pra lista vazia

const escaparHtml = (texto) =>
  texto.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function construirRegex(linguagem) {
  const { palavrasChave, risco } = LINGUAGENS[linguagem];
  const alt = (lista) => (lista.length ? lista.join("|") : NUNCA);

  return new RegExp(
    `(?<com>//.*)` +
    `|(?<str>"(?:[^"\\\\]|\\\\.)*")` +
    `|(?<num>\\b\\d+\\b)` +
    `|(?<risco>\\b(?:${alt(risco)})\\b)` +
    `|(?<kw>\\b(?:${alt(palavrasChave)})\\b)`,
    "g"
  );
}

export function realcarLinha(linha, linguagem) {
  const regex = construirRegex(linguagem);
  let saida = "";
  let ultimo = 0;

  for (const m of linha.matchAll(regex)) {
    saida += escaparHtml(linha.slice(ultimo, m.index));
    const classe = m.groups.com ? "com"
      : m.groups.str ? "str"
      : m.groups.num ? "num"
      : m.groups.risco ? "risco"
      : "kw";
    saida += `<span class="${classe}">${escaparHtml(m[0])}</span>`;
    ultimo = m.index + m[0].length;
  }

  saida += escaparHtml(linha.slice(ultimo));
  return saida;
}

export function realcarBloco(codigo, linguagem) {
  return codigo.split("\n").map((linha) => realcarLinha(linha, linguagem)).join("\n");
}

/* Conta as ocorrências de "risco" no bloco — o número que a cena mostra
   como custo de sincronização por linguagem. Não é benchmark nenhum, é
   uma contagem literal do que está escrito no próprio bloco exibido. */
export function contarRisco(codigo, linguagem) {
  const { risco } = LINGUAGENS[linguagem];
  if (!risco.length) return 0;
  const regex = new RegExp(`\\b(?:${risco.join("|")})\\b`, "g");
  return (codigo.match(regex) ?? []).length;
}
