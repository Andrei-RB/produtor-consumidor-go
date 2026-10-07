# Avaliação A2 - Paradigmas de Linguagens de Programação

**Grupo 01**

## 👥 Integrantes (3 a 5 alunos)
- Andrei Rodrigues de Barros (33468982)
- Gabriel Silva Medeiros (32825706)
- Márcia Paula de Sousa (35835133)

## Definição do Tema
- **Paradigma:** Concorrente
- **Linguagem:** Go
- **Código do Tema:** C1
- **Descrição do Desafio:** Produtor-consumidor. Implementar o problema clássico do produtor-consumidor com goroutines (unidades de execução leves) e channels (comunicação entre elas), em vez de threads e locks explícitos. O foco é o modelo de concorrência de Go, *"compartilhar memória comunicando"* em vez de *"comunicar compartilhando memória"*, comparado com threads e mutex em C e Java.

## Execução do Código

> ⚠️ **Aviso:** O código deve rodar exclusivamente em ambiente online, sem necessidade de instalação local.

- **Ambiente Online Utilizado:** Go Playground (go.dev/play)
- **Permalink:** https://go.dev/play/p/NlOcxvBiCv4
- **Site do seminário:** https://prodconsumer.web.app (a cena 17, "Execute e mude os parâmetros", traz o mesmo programa e o botão "Abrir no Go Playground")

### Instruções de Teste (Entrada e Saída)
1. Abra o permalink acima. Não é preciso login nem instalação.
2. Clique em **Run**. A saída aparece no painel abaixo do código.
3. O programa não lê nada do teclado (stdin). A entrada são as constantes no topo de `main.go`. Para testar outros cenários, altere os valores, clique em **Run** de novo e observe a mudança na saída. Exemplos:
   - `capacidadeBuffer = 1`: o produtor bloqueia logo depois de cada envio, à espera de espaço no canal.
   - `numConsumidores = 1`: um único consumidor processa os 8 itens, em ordem.
   - `tempoConsumo` menor que `tempoProducao`: os consumidores passam a esperar pelo produtor (canal vazio).

**Entrada de Exemplo:**
```text
const (
	capacidadeBuffer  = 3                       // espaços no canal (buffer)
	numConsumidores   = 2                       // goroutines consumidoras
	itensParaProduzir = 8                       // itens enviados pelo produtor
	tempoProducao     = 150 * time.Millisecond  // tempo para produzir um item
	tempoConsumo      = 300 * time.Millisecond  // tempo para processar um item
)
```

**Saída Esperada:**
```text
produtor enviou 1
produtor enviou 2
consumidor 2 processou 1
produtor enviou 3
consumidor 1 processou 2
produtor enviou 4
produtor enviou 5
consumidor 2 processou 3
produtor enviou 6
consumidor 1 processou 4
consumidor 2 processou 5
produtor enviou 7
consumidor 1 processou 6
produtor enviou 8
consumidor 2 processou 7
consumidor 1 processou 8
concluido
```

> Como se trata de um programa concorrente, a ordem exata das linhas e qual consumidor (1 ou 2) recebe cada item podem variar de uma execução para outra. Algumas propriedades valem em qualquer execução: cada item de 1 a 8 é enviado uma única vez e processado uma única vez, nenhum item se perde nem se repete, e `concluido` é sempre a última linha.

## Relatório Técnico

### Descrição da Solução

O projeto tem duas partes: o **programa em Go** que resolve o problema e um **site interativo** (https://prodconsumer.web.app) que serve de material de apoio para o seminário.

#### O programa em Go (`main.go`, no permalink)

O buffer limitado do problema clássico é o próprio **canal com buffer** do Go:

```go
canal := make(chan int, capacidadeBuffer)
```

- **`produtor(canal chan<- int, wg *sync.WaitGroup)`**: uma goroutine que produz os itens de 1 a `itensParaProduzir`, simula o trabalho com `time.Sleep(tempoProducao)` e envia cada item com `canal <- i`. Se o buffer estiver cheio, o envio **bloqueia sozinho** até algum consumidor liberar espaço. Ao terminar, chama `close(canal)` para avisar que não haverá mais itens.
- **`consumidor(id int, canal <-chan int, wg *sync.WaitGroup)`**: várias goroutines (`numConsumidores`) leem do mesmo canal com `for item := range canal`. Se o canal estiver vazio, a leitura **bloqueia** até chegar um item. O laço termina sozinho quando o canal é fechado e esvaziado.
- **`main()`**: cria o canal, dispara a goroutine produtora e as consumidoras com `go`, e espera todas terminarem com dois `sync.WaitGroup` (`wgProdutor` e `wgConsumidores`) antes de imprimir `concluido`.

As duas condições críticas do problema, **buffer cheio** (o produtor precisa esperar) e **buffer vazio** (o consumidor precisa esperar), não aparecem no código como `if`, `while` ou variável de condição. Elas fazem parte da semântica de envio e recebimento do canal. As direções `chan<- int` (só envio) e `<-chan int` (só recebimento) fazem o compilador impedir que o consumidor envie ou que o produtor leia.

Para comparação, o grupo escreveu o mesmo problema em **C** (pthreads, `pthread_mutex_t` e duas `pthread_cond_t`, `cond_cheio` e `cond_vazio`, sobre um buffer circular) e em **Java** (`synchronized`, `wait()` e `notifyAll()` sobre uma `LinkedList`). Os dois estão no site, na cena 17, e rodam no OneCompiler embutido na página.

#### O site do seminário

Uma página única no formato *scrollytelling*: a explicação avança conforme o visitante rola a página e cada cena tem uma visualização animada ou interativa. São 20 cenas, divididas em uma abertura e cinco atos:

| Ato | Cenas | Conteúdo | Visualizações (`public/scripts/viz/`) |
|-----|-------|----------|---------------------------------------|
| Abertura | 00–01 | Apresentação do problema: "Um produz. O outro consome. Nunca no mesmo ritmo." | vídeo de abertura (`motion/hero.js`) |
| I. O problema | 02–04 | Os três papéis (produtor, consumidor, buffer), ritmos diferentes e as duas condições críticas | `buffer.js`: simulação interativa com controles de velocidade |
| II. A fragilidade | 05–09 | Memória compartilhada, condição de corrida, semáforos/mutex/variáveis de condição, impasse (deadlock) causado por duas linhas trocadas e a solução tradicional escrita à mão | `primitivas.js`, `corrida.js`, `impasse.js`, `codigo.js` |
| III. A ruptura | 10–15 | Modelo CSP, o lema de Rob Pike, goroutines (pilha inicial de 2 KB, escalonador GMP), canal com buffer (a mesma simulação do Ato I, agora "impossível de quebrar"), rendezvous do canal sem buffer, ciclo de vida do canal (`close`, `range` e direções) | `canal.js`, `escalonador.js`, `buffer.js`, `ciclo-vida.js` |
| IV. A máquina | 16 | O que o runtime faz por você: a estrutura interna `hchan` (buffer circular, filas de espera `sendq`/`recvq`, lock interno) | `hchan.js` |
| V. A prova | 17–20 | Demonstração prática em Go, C e Java, comparação lado a lado, síntese final e fontes | `demonstracao.js`, `codigo.js`, `sintese.js` |

**Arquitetura do site:**
- **HTML, CSS e JavaScript puros** com ES Modules, sem framework e sem etapa de build. O ponto de entrada é `public/scripts/main.js`, que liga cada `<figure data-viz="...">` do `index.html` à função de montagem da visualização correspondente.
- **GSAP + ScrollTrigger** (hospedados no próprio repositório, em `public/vendor/gsap/`) para as animações ligadas à rolagem.
- `public/scripts/motion/`: cortina de abertura, vídeo do hero, cursor customizado, barra de progresso e indicador do ato atual.
- `public/scripts/lib/`: realce de sintaxe próprio para Go, C e Java (`realce.js`) e animação de números (`animar-numero.js`).
- `public/styles/`: sistema de design em camadas (`tokens.css`, `base.css`, `layout.css`, `components.css`, `viz.css`, `motion.css`).
- **Hospedagem:** Firebase Hosting (`firebase.json`), com cabeçalhos de segurança, cache configurado e página 404 própria.
- **Acessibilidade:** navegação por teclado nas abas e nos blocos de código, nomes acessíveis e estados que não dependem apenas de cor (por exemplo, a célula "lida" do buffer usa listras diagonais).

**Estrutura do repositório:**
```text
.
├── Docs/                     # pesquisa e relatórios de apoio (PDF/DOCX)
├── public/                   # site publicado
│   ├── index.html            # as 20 cenas
│   ├── 404.html
│   ├── assets/               # imagens, ícones e vídeo
│   ├── scripts/
│   │   ├── main.js           # ponto de entrada
│   │   ├── viz/              # uma visualização por conceito
│   │   ├── motion/           # animações de rolagem e abertura
│   │   └── lib/              # realce de sintaxe e utilitários
│   ├── styles/               # tokens e camadas de CSS
│   └── vendor/gsap/          # GSAP + ScrollTrigger
├── firebase.json
└── README.md
```

### Análise Comparativa

### 1. Sintaxe

Em Go a solução é **mais curta e mais declarativa**: o programador escreve *o que* precisa ser comunicado, e não *como* proteger a memória. Contando as linhas não vazias dos três programas da demonstração, que fazem exatamente a mesma coisa:

| Linguagem | Linhas | Mecanismos que o programador manipula |
|-----------|-------:|---------------------------------------|
| Go | 43 | `chan`, `go`, `close`, `range`, `sync.WaitGroup` |
| C | 63 | buffer circular, índices `inicio`/`fim`, `ocupacao`, `pthread_mutex_t`, duas `pthread_cond_t`, flag `encerrado` |
| Java | 64 | `LinkedList`, `synchronized`, `wait()`, `notifyAll()`, flag `encerrado`, `InterruptedException` |

O envio de um item ilustra bem a diferença. Em **Go**:
```go
canal <- i
```
Em **C**, a mesma operação exige trancar, testar a condição em laço, escrever no buffer, atualizar índices, sinalizar e destrancar:
```c
pthread_mutex_lock(&mutex);
while (ocupacao == CAPACIDADE)
    pthread_cond_wait(&cond_cheio, &mutex);
buffer[fim] = i;
fim = (fim + 1) % CAPACIDADE;
ocupacao++;
pthread_cond_signal(&cond_vazio);
pthread_mutex_unlock(&mutex);
```
Em **Java**, o mesmo padrão com `synchronized (buffer) { while (buffer.size() == CAPACIDADE) buffer.wait(); ... buffer.notifyAll(); }`.

No consumidor, `for item := range canal` substitui todo o protocolo de término que C e Java precisam montar à mão (a flag `encerrado`, o `broadcast`/`notifyAll` final e o teste `ocupacao == 0 && encerrado`). Criar uma unidade concorrente também é mais simples: `go produtor(canal, &wg)` contra `pthread_create(&t, NULL, produtor, NULL)` ou `new Thread(Main::produzir).start()`.

### 2. Semântica

- **Comunicação por canais (CSP):** Go segue o modelo *Communicating Sequential Processes* de Hoare. As goroutines não compartilham o buffer diretamente: elas **transferem a posse** de cada item pelo canal. Em C e Java, as threads compartilham a mesma variável `buffer`, e a correção depende da disciplina do programador em sempre usar o lock.
- **Semântica de bloqueio:** num canal com buffer, o envio bloqueia quando o buffer está cheio e o recebimento bloqueia quando ele está vazio. Num canal **sem buffer** (`make(chan int)`), cada envio só termina quando há um receptor pronto (*rendezvous*), o que sincroniza as duas goroutines. Em C/Java esse comportamento precisa ser reconstruído com `while` + `wait`. Esquecer o `while` (trocá-lo por `if`) ou inverter a ordem de dois locks gera os bugs mostrados nas cenas 06 e 08 (condição de corrida e impasse).
- **Tipos:** Go é estática e fortemente tipado, como C e Java, mas o canal é um tipo de primeira classe e tem **direção** no próprio tipo: `chan<- int` só envia e `<-chan int` só recebe. Um consumidor que tentasse enviar seria um **erro de compilação**. Em C/Java nada impede uma thread consumidora de escrever no buffer.
- **Ciclo de vida:** `close(canal)` é uma operação da linguagem. Depois dela, o `range` drena os itens restantes e termina; enviar para um canal fechado causa `panic`, um erro explícito em vez de corrupção silenciosa.
- **Escopo e avaliação:** o escopo é léxico, com blocos e closures, como em Java. A avaliação é **estrita** (*eager*), como em C e Java. A diferença está no *modelo de memória*: o Go Memory Model garante que um envio no canal *acontece antes* (*happens-before*) do recebimento correspondente, então quem recebe o item enxerga tudo o que o produtor escreveu antes de enviá-lo, sem precisar de `volatile` ou de barreiras de memória manuais.
- **Detecção de impasse:** se todas as goroutines ficarem bloqueadas, o runtime do Go aborta com `fatal error: all goroutines are asleep - deadlock!`. Em C, um deadlock simplesmente congela o programa.

### 3. Gerenciamento de Memória

- **Go:** coleta de lixo automática (coletor concorrente *mark-and-sweep* tricolor, desenhado para pausas curtas) e **análise de escape** feita pelo compilador, que decide se cada valor fica na pilha ou no heap. Os itens enviados pelo canal são **copiados** para o buffer interno do canal (a estrutura `hchan` do runtime, explicada na cena 16), então produtor e consumidor nunca apontam para a mesma posição de memória ao mesmo tempo.
- **Goroutines x threads:** uma goroutine começa com uma pilha de **2 KB** (`stackMin = 2048` em `runtime/stack.go`), que cresce e encolhe sob demanda, e é escalonada pelo runtime no espaço de usuário (modelo **GMP**: goroutines G distribuídas sobre threads M do sistema operacional por meio de processadores lógicos P). Uma thread do sistema, usada por C (pthreads) e pelo Java tradicional, reserva uma pilha da ordem de megabytes e é escalonada pelo kernel. Por isso é viável criar milhares de goroutines consumidoras, mas não milhares de threads.
- **C:** gerenciamento manual. O buffer é um vetor global estático, e qualquer estrutura dinâmica exigiria `malloc`/`free` feitos à mão. Também é responsabilidade do programador inicializar e destruir mutex e variáveis de condição e evitar acessos fora dos limites do buffer circular.
- **Java:** a JVM gerencia o heap com coleta de lixo, como em Go. Mas cada `Integer` da `LinkedList` é um objeto alocado no heap (com *autoboxing*), cada `Thread` tradicional corresponde a uma thread do sistema operacional e a visibilidade entre threads depende do *Java Memory Model* (`synchronized`/`volatile`). Em Go, o canal transporta valores `int` diretamente, sem empacotamento.

### 4. Trade-offs

**Vantagens do modelo de Go para este desafio:**
- A exclusão mútua deixa de ser uma disciplina do programador e passa a ser uma **propriedade da estrutura**: não existe sequência de chamadas `canal <- x` / `<-canal` que deixe o buffer inconsistente.
- Menos código e menos pontos de falha: não há como esquecer um `unlock`, trocar `while` por `if` ou inverter a ordem de dois locks.
- Escala melhor: goroutines são baratas, e o número de consumidores vira uma constante no código.
- O término é limpo, com `close` + `range`, e o compilador garante a direção do canal.

**Desvantagens e limites:**
- O canal **não elimina** todos os problemas de concorrência: ainda é possível causar deadlock (por exemplo, nunca chamar `close`, ou esquecer `wg.Done()`) e vazar goroutines que ficam bloqueadas para sempre.
- O canal esconde um **lock interno** (o `hchan` tem um mutex próprio). Para estado compartilhado simples, como um contador, um `sync.Mutex` ou `sync/atomic` pode ser mais rápido do que passar mensagens.
- Há menos controle fino do que em C: o escalonamento e a coleta de lixo ficam a cargo do runtime, o que pode ser um problema em sistemas de tempo real ou com memória muito restrita.
- O paradigma **imperativo com threads** (C) dá controle total sobre memória e escalonamento, ao custo de exigir sincronização manual e propensa a erros. O paradigma **orientado a objetos** (Java) organiza o estado em objetos e oferece `synchronized`, mas continua baseado em memória compartilhada (embora bibliotecas como `java.util.concurrent.BlockingQueue` aproximem o modelo de Go).

### Resumo da Análise Comparativa

*   **Sintaxe:** em Go o buffer, o bloqueio e o término são expressos com `make(chan T, N)`, `canal <- x`, `range canal` e `close`, em 43 linhas, contra cerca de 63–64 em C e Java, que precisam de mutex, variáveis de condição, flags e laços `while` escritos à mão.
*   **Semântica:** comunicação por canais (CSP) em vez de memória compartilhada. O bloqueio em "cheio" e "vazio" faz parte da semântica do canal, a direção do canal é verificada pelo compilador e o envio *acontece antes* do recebimento. O escopo é léxico e a avaliação é estrita, como em C e Java.
*   **Gerenciamento de Memória:** coleta de lixo automática e concorrente, com análise de escape, e goroutines com pilha inicial de 2 KB escalonadas pelo runtime (GMP). C exige gerenciamento manual e usa threads do SO com pilhas de megabytes. Java tem GC na JVM, mas usa objetos no heap (*boxing*) e threads do SO.
*   **Trade-offs:** Go oferece um código menor, mais seguro e escalável para o produtor-consumidor, mas ainda permite deadlocks e vazamento de goroutines, esconde um lock interno no canal e dá menos controle de baixo nível do que C.

## Log de Uso de Inteligência Artificial (IA)

*   **O que foi pedido à IA:** (1) Construção do site do seminário: estrutura das cenas, HTML/CSS/JavaScript, animações com GSAP/ScrollTrigger, as visualizações interativas (incluindo a demonstração com os programas em Go, C e Java da cena 17), o sistema de design e a configuração do Firebase Hosting. (2) Apoio à pesquisa e aos relatórios teóricos da pasta `Docs/`: concorrência em Go, modelo CSP, goroutines, canais, escalonador GMP e comparação com threads/mutex em C e Java. (3) Revisão e correção de bugs: comportamento do navegador no celular, acessibilidade (foco por teclado e nomes acessíveis), quebras de texto e desempenho (compressão do vídeo de abertura).
*   **Qual IA foi utilizada:** Anthropic Claude Code, com os modelos Claude Sonnet 5 e Claude Opus 5 (registrados como coautores nos commits do repositório); OpenAI ChatGPT; Google Gemini.
*   **O que foi aproveitado:** o código do site (páginas, estilos, scripts de animação e visualizações), sugestões de organização da narrativa em atos e cenas, explicações sobre o funcionamento interno dos canais (`hchan`) e do escalonador do Go, e as correções de bugs e acessibilidade aplicadas nos commits de `fix:`.
*   **O que foi reescrito/entendido pelo grupo:** o grupo definiu o roteiro do seminário e a divisão em atos, e revisou e ajustou o código gerado em várias iterações (os commits do histórico registram essas revisões, como a reconstrução da página 404 e os ajustes no lema e no cabeçalho). Os programas em Go, C e Java foram executados e testados nos ambientes online (Go Playground e OneCompiler), alterando os parâmetros para observar o efeito do tamanho do buffer e da quantidade de consumidores. As afirmações técnicas foram conferidas em fontes primárias, como a documentação oficial do Go (go.dev/ref/mem, go.dev/blog/codelab-share), o código-fonte do runtime (`runtime/stack.go`, `runtime/chan.go`) e o livro *Sistemas Operacionais Modernos* (Tanenbaum e Bos). Com isso o grupo entendeu por que o canal com buffer resolve as condições de "buffer cheio" e "buffer vazio" sem locks explícitos, e em quais situações ainda é possível causar deadlock.
