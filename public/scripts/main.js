/* CANAL — ponto de entrada.
   GSAP e ScrollTrigger chegam como globais pelos scripts auto-hospedados. */

import { iniciarProgresso, iniciarIndicadorDeAto } from "./motion/scroll.js";
import { garantirVideoDeAbertura } from "./motion/hero.js";

gsap.registerPlugin(ScrollTrigger);

garantirVideoDeAbertura();
iniciarProgresso();
iniciarIndicadorDeAto();

/* Reagir a fontes que terminam de carregar depois do primeiro cálculo:
   a troca de métrica muda a altura das cenas e invalida os gatilhos. */
document.fonts?.ready.then(() => ScrollTrigger.refresh());
