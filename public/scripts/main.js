/* CANAL — ponto de entrada.
   GSAP e ScrollTrigger chegam como globais pelos scripts auto-hospedados. */

import { iniciarProgresso, iniciarIndicadorDeAto } from "./motion/scroll.js";
import { iniciarAbertura } from "./motion/hero.js";
import { iniciarCenas } from "./motion/cenas.js";
import { montarBuffer } from "./viz/buffer.js";

gsap.registerPlugin(ScrollTrigger);

document.querySelectorAll('[data-viz="buffer"]').forEach(montarBuffer);

iniciarAbertura();
iniciarCenas();
iniciarProgresso();
iniciarIndicadorDeAto();

/* Reagir a fontes que terminam de carregar depois do primeiro cálculo:
   a troca de métrica muda a altura das cenas e invalida os gatilhos. */
document.fonts?.ready.then(() => ScrollTrigger.refresh());
