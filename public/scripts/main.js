/* CANAL — ponto de entrada.
   GSAP e ScrollTrigger chegam como globais pelos scripts auto-hospedados. */

import { iniciarProgresso, iniciarIndicadorDeAto } from "./motion/scroll.js";
import { iniciarAbertura } from "./motion/hero.js";
import { iniciarCenas } from "./motion/cenas.js";

gsap.registerPlugin(ScrollTrigger);

iniciarAbertura();
iniciarCenas();
iniciarProgresso();
iniciarIndicadorDeAto();

/* Reagir a fontes que terminam de carregar depois do primeiro cálculo:
   a troca de métrica muda a altura das cenas e invalida os gatilhos. */
document.fonts?.ready.then(() => ScrollTrigger.refresh());
