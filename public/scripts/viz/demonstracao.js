/* Demonstração prática (cena 17).

   Três programas completos e reais — não fragmentos — cada um compila e
   roda de verdade nas próprias ferramentas gratuitas que o link abre.
   Verificados antes de entrar na página, não só escritos e assumidos
   corretos:

   Go — enviado ao endpoint público de compilação do go.dev
   (https://go.dev/_/compile) e ao de compartilhamento
   (https://go.dev/_/share), o mesmo que o botão "Run"/"Share" do
   Playground usa. Saída conferida, permalink real gerado e resolvido
   antes de aparecer aqui embaixo.

   C e Java — carregados no embed real do OneCompiler
   (onecompiler.com/embed/c e /java) pelo mesmo mecanismo de
   postMessage que este módulo usa (populateCode), com o botão "Run"
   do próprio editor. Saída conferida nos dois.

   Go não tem embed oficial equivalente ao do OneCompiler — só o botão
   Share, que grava um permalink público. Por isso aqui é link real
   para um permalink real, não um iframe: nada inventado pra parecer
   mais integrado do que é. */

import { realcarBloco } from "../lib/realce.js";

const GO_PLAYGROUND_URL = "https://go.dev/play/p/NlOcxvBiCv4";

const FONTES = {
  go: {
    nome: "Go",
    arquivo: "main.go",
    observar: "Altere capacidadeBuffer, numConsumidores ou os tempos em time.Sleep e rode de novo.",
    codigo: `package main

import (
	"fmt"
	"sync"
	"time"
)

const (
	capacidadeBuffer  = 3
	numConsumidores   = 2
	itensParaProduzir = 8
	tempoProducao     = 150 * time.Millisecond
	tempoConsumo      = 300 * time.Millisecond
)

func produtor(canal chan<- int, wg *sync.WaitGroup) {
	defer wg.Done()
	for i := 1; i <= itensParaProduzir; i++ {
		time.Sleep(tempoProducao)
		canal <- i
		fmt.Printf("produtor enviou %d\\n", i)
	}
	close(canal)
}

func consumidor(id int, canal <-chan int, wg *sync.WaitGroup) {
	defer wg.Done()
	for item := range canal {
		time.Sleep(tempoConsumo)
		fmt.Printf("consumidor %d processou %d\\n", id, item)
	}
}

func main() {
	canal := make(chan int, capacidadeBuffer)

	var wgProdutor sync.WaitGroup
	var wgConsumidores sync.WaitGroup

	wgProdutor.Add(1)
	go produtor(canal, &wgProdutor)

	for i := 1; i <= numConsumidores; i++ {
		wgConsumidores.Add(1)
		go consumidor(i, canal, &wgConsumidores)
	}

	wgProdutor.Wait()
	wgConsumidores.Wait()
	fmt.Println("concluido")
}`,
  },

  c: {
    nome: "C",
    arquivo: "main.c",
    observar: "Altere CAPACIDADE, NUM_CONSUMIDORES ou os tempos em usleep e carregue o editor de novo.",
    codigo: `#include <pthread.h>
#include <stdio.h>
#include <unistd.h>

#define CAPACIDADE 3
#define NUM_CONSUMIDORES 2
#define ITENS_PARA_PRODUZIR 8

int buffer[CAPACIDADE];
int inicio = 0, fim = 0, ocupacao = 0;
int encerrado = 0;

pthread_mutex_t mutex = PTHREAD_MUTEX_INITIALIZER;
pthread_cond_t cond_vazio = PTHREAD_COND_INITIALIZER;
pthread_cond_t cond_cheio = PTHREAD_COND_INITIALIZER;

void *produtor(void *arg) {
    for (int i = 1; i <= ITENS_PARA_PRODUZIR; i++) {
        usleep(150000);
        pthread_mutex_lock(&mutex);
        while (ocupacao == CAPACIDADE)
            pthread_cond_wait(&cond_cheio, &mutex);
        buffer[fim] = i;
        fim = (fim + 1) % CAPACIDADE;
        ocupacao++;
        printf("produtor enviou %d\\n", i);
        pthread_cond_signal(&cond_vazio);
        pthread_mutex_unlock(&mutex);
    }
    pthread_mutex_lock(&mutex);
    encerrado = 1;
    pthread_cond_broadcast(&cond_vazio);
    pthread_mutex_unlock(&mutex);
    return NULL;
}

void *consumidor(void *arg) {
    long id = (long)arg;
    while (1) {
        pthread_mutex_lock(&mutex);
        while (ocupacao == 0 && !encerrado)
            pthread_cond_wait(&cond_vazio, &mutex);
        if (ocupacao == 0 && encerrado) {
            pthread_mutex_unlock(&mutex);
            break;
        }
        int item = buffer[inicio];
        inicio = (inicio + 1) % CAPACIDADE;
        ocupacao--;
        pthread_cond_signal(&cond_cheio);
        pthread_mutex_unlock(&mutex);
        usleep(300000);
        printf("consumidor %ld processou %d\\n", id, item);
    }
    return NULL;
}

int main() {
    pthread_t t_produtor;
    pthread_t t_consumidores[NUM_CONSUMIDORES];

    pthread_create(&t_produtor, NULL, produtor, NULL);
    for (long i = 1; i <= NUM_CONSUMIDORES; i++)
        pthread_create(&t_consumidores[i - 1], NULL, consumidor, (void *)i);

    pthread_join(t_produtor, NULL);
    for (int i = 0; i < NUM_CONSUMIDORES; i++)
        pthread_join(t_consumidores[i], NULL);

    printf("concluido\\n");
    return 0;
}`,
  },

  java: {
    nome: "Java",
    arquivo: "Main.java",
    observar: "Altere CAPACIDADE, NUM_CONSUMIDORES ou os tempos em Thread.sleep e carregue o editor de novo.",
    codigo: `import java.util.LinkedList;
import java.util.Queue;

public class Main {
    static final int CAPACIDADE = 3;
    static final int NUM_CONSUMIDORES = 2;
    static final int ITENS_PARA_PRODUZIR = 8;

    static final Queue<Integer> buffer = new LinkedList<>();
    static boolean encerrado = false;

    public static void main(String[] args) throws InterruptedException {
        Thread produtor = new Thread(Main::produzir);
        Thread[] consumidores = new Thread[NUM_CONSUMIDORES];

        produtor.start();
        for (int i = 0; i < NUM_CONSUMIDORES; i++) {
            int id = i + 1;
            consumidores[i] = new Thread(() -> consumir(id));
            consumidores[i].start();
        }

        produtor.join();
        for (Thread c : consumidores) c.join();
        System.out.println("concluido");
    }

    static void produzir() {
        try {
            for (int i = 1; i <= ITENS_PARA_PRODUZIR; i++) {
                Thread.sleep(150);
                synchronized (buffer) {
                    while (buffer.size() == CAPACIDADE) {
                        buffer.wait();
                    }
                    buffer.add(i);
                    System.out.println("produtor enviou " + i);
                    buffer.notifyAll();
                }
            }
            synchronized (buffer) {
                encerrado = true;
                buffer.notifyAll();
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    static void consumir(int id) {
        try {
            while (true) {
                int item;
                synchronized (buffer) {
                    while (buffer.isEmpty() && !encerrado) {
                        buffer.wait();
                    }
                    if (buffer.isEmpty() && encerrado) {
                        return;
                    }
                    item = buffer.poll();
                    buffer.notifyAll();
                }
                Thread.sleep(300);
                System.out.println("consumidor " + id + " processou " + item);
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}`,
  },
};

function montarPainel(chave) {
  const f = FONTES[chave];
  const realceLinguagem = chave === "go" ? "go" : chave;
  const codigoHtml = realcarBloco(f.codigo, realceLinguagem);

  const acoes = chave === "go"
    ? `<a class="botao" href="${GO_PLAYGROUND_URL}" target="_blank" rel="noopener noreferrer">Abrir no Go Playground</a>`
    : `<button type="button" class="botao" data-acao="carregar-editor">Carregar editor OneCompiler</button>
       <a class="botao botao--discreto" href="https://onecompiler.com/${chave}" target="_blank" rel="noopener noreferrer">Abrir em nova aba</a>`;

  return `
    <div class="demo-painel" id="demo-painel-${chave}" data-lang="${chave}"
         role="tabpanel" aria-labelledby="demo-aba-${chave}" tabindex="0" ${chave === "go" ? "" : "hidden"}>
      <pre class="codigo demo-codigo">${codigoHtml}</pre>
      <p class="demo-observar">${f.observar}</p>
      <div class="demo-acoes">
        <button type="button" class="botao botao--discreto" data-acao="copiar" aria-live="polite">Copiar código</button>
        ${acoes}
      </div>
      <div class="demo-editor" data-ref="editor"></div>
    </div>
  `;
}

export function montarDemonstracao(palco) {
  palco.querySelector(".palco-vazio")?.remove();

  const raiz = document.createElement("div");
  raiz.className = "demo";
  raiz.innerHTML = `
    <div class="demo-abas" role="tablist" aria-label="Linguagem da demonstração">
      ${Object.entries(FONTES).map(([chave, f], i) => `
        <button type="button" class="demo-aba" role="tab" id="demo-aba-${chave}"
                aria-controls="demo-painel-${chave}" aria-selected="${i === 0}"
                tabindex="${i === 0 ? 0 : -1}" data-lang="${chave}">${f.nome}</button>
      `).join("")}
    </div>
    ${Object.keys(FONTES).map(montarPainel).join("")}
  `;
  palco.append(raiz);

  ligarAbas(raiz);
  ligarAcoes(raiz);
}

function ligarAbas(raiz) {
  const abas = [...raiz.querySelectorAll('[role="tab"]')];
  const paineis = [...raiz.querySelectorAll('[role="tabpanel"]')];

  const selecionar = (aba, focar = true) => {
    abas.forEach((a) => {
      const ativa = a === aba;
      a.setAttribute("aria-selected", String(ativa));
      a.tabIndex = ativa ? 0 : -1;
    });
    paineis.forEach((p) => { p.hidden = p.dataset.lang !== aba.dataset.lang; });
    if (focar) aba.focus();
  };

  abas.forEach((aba, i) => {
    aba.addEventListener("click", () => selecionar(aba, false));
    aba.addEventListener("keydown", (e) => {
      // preventDefault nas quatro: sem isto, o navegador também rola a
      // página nessas teclas (Home/End rolam pro topo/fim do documento
      // por padrão), competindo com a troca de aba.
      if (e.key === "ArrowRight") { e.preventDefault(); selecionar(abas[(i + 1) % abas.length]); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); selecionar(abas[(i - 1 + abas.length) % abas.length]); }
      else if (e.key === "Home") { e.preventDefault(); selecionar(abas[0]); }
      else if (e.key === "End") { e.preventDefault(); selecionar(abas[abas.length - 1]); }
    });
  });
}

const ARQUIVOS = { c: "main.c", java: "Main.java" };
const ORIGEM_ONECOMPILER = "https://onecompiler.com";
const TEMPO_LIMITE_EDITOR_MS = 9000;

function ligarAcoes(raiz) {
  raiz.addEventListener("click", async (e) => {
    const copiar = e.target.closest('[data-acao="copiar"]');
    if (copiar) {
      // Rótulo original gravado uma única vez, nunca lido de volta do
      // textContent atual — clique duplo antes do primeiro revert não
      // corrompe mais o rótulo (o segundo clique não podia mais capturar
      // "Copiado" como se fosse o original).
      if (!copiar.dataset.rotuloOriginal) copiar.dataset.rotuloOriginal = copiar.textContent;
      clearTimeout(Number(copiar.dataset.timeoutCopia));

      const codigo = copiar.closest(".demo-painel").querySelector(".demo-codigo").textContent;
      try {
        await navigator.clipboard.writeText(codigo);
        copiar.textContent = "Copiado";
      } catch {
        copiar.textContent = "Selecione e copie manualmente";
      }
      const id = setTimeout(() => { copiar.textContent = copiar.dataset.rotuloOriginal; }, 1800);
      copiar.dataset.timeoutCopia = String(id);
      return;
    }

    const carregar = e.target.closest('[data-acao="carregar-editor"]');
    if (carregar) {
      const painel = carregar.closest(".demo-painel");
      const lang = painel.dataset.lang;
      const destino = painel.querySelector('[data-ref="editor"]');
      const codigo = painel.querySelector(".demo-codigo").textContent;

      destino.innerHTML = ""; // limpa uma tentativa anterior malsucedida
      carregar.disabled = true;
      carregar.textContent = "Carregando editor…";

      const iframe = document.createElement("iframe");
      iframe.className = "demo-iframe";
      iframe.src = `${ORIGEM_ONECOMPILER}/embed/${lang}?listenToEvents=true&theme=dark`;
      iframe.title = `Editor OneCompiler — ${FONTES[lang].nome}`;
      // Sem loading="lazy": o carregamento já é sob demanda (só entra no
      // DOM neste clique). Combinar os dois atrasa o carregamento real
      // ao heurístico do navegador, que pode nunca disparar aqui dentro.

      let resolvido = false;

      // Bloqueador de anúncios, firewall de escola, DNS fora do ar: o
      // evento load pode nunca disparar. Sem isto o botão ficava preso em
      // "Carregando editor…" para sempre, sem saída a não ser o link
      // separado de nova aba.
      const tempoEsgotado = setTimeout(() => {
        if (resolvido) return;
        resolvido = true;
        iframe.remove();
        carregar.disabled = false;
        carregar.textContent = "Não carregou — tentar de novo";
      }, TEMPO_LIMITE_EDITOR_MS);

      iframe.addEventListener("load", () => {
        if (resolvido) return;
        // O app dentro do iframe precisa de um instante pra montar e
        // começar a escutar postMessage — sem isto o populateCode chega
        // cedo demais e é descartado.
        setTimeout(() => {
          if (resolvido) return;
          resolvido = true;
          clearTimeout(tempoEsgotado);
          iframe.contentWindow.postMessage({
            eventType: "populateCode",
            language: lang,
            files: [{ name: ARQUIVOS[lang], content: codigo }],
          }, ORIGEM_ONECOMPILER);
          carregar.remove();
        }, 1200);
      });

      destino.append(iframe);
    }
  });
}
