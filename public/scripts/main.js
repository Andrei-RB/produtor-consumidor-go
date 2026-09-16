/* CANAL — ponto de entrada.
   GSAP e ScrollTrigger chegam como globais pelos scripts auto-hospedados. */

import { iniciarProgresso, iniciarIndicadorDeAto } from "./motion/scroll.js";
import { iniciarAbertura } from "./motion/hero.js";
import { iniciarCenas } from "./motion/cenas.js";
import { montarBuffer } from "./viz/buffer.js";
import { montarCorrida } from "./viz/corrida.js";
import { montarImpasse } from "./viz/impasse.js";
import { montarCanal } from "./viz/canal.js";
import { montarHchan } from "./viz/hchan.js";
import { montarCompartilhada, montarPrimitivas } from "./viz/primitivas.js";

gsap.registerPlugin(ScrollTrigger);

const VISUALIZACOES = {
  buffer: montarBuffer,
  corrida: montarCorrida,
  impasse: montarImpasse,
  canal: montarCanal,
  hchan: montarHchan,
  compartilhada: montarCompartilhada,
  primitivas: montarPrimitivas,
};

document.querySelectorAll("[data-viz]").forEach((palco) => {
  VISUALIZACOES[palco.dataset.viz]?.(palco);
});

iniciarAbertura();
iniciarCenas();
iniciarProgresso();
iniciarIndicadorDeAto();

/* Reagir a fontes que terminam de carregar depois do primeiro cálculo:
   a troca de métrica muda a altura das cenas e invalida os gatilhos. */
document.fonts?.ready.then(() => ScrollTrigger.refresh());
