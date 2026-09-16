/* Preferência de movimento do visitante.

   Qualquer módulo de visualização que inicia um laço automático (setInterval,
   requestAnimationFrame contínuo) deve checar prefersReducedMotion() antes de
   iniciar o laço. Sob a preferência reduzida, a cena deve nascer num quadro
   estático que já ensine o conceito, ou oferecer um controle manual — nunca
   impor o movimento contínuo.

   O CSS já mata `animation` globalmente sob reduced-motion (ver base.css),
   mas isso não alcança laços de JS. Este módulo cobre essa lacuna. */

const consulta = () =>
  typeof window !== "undefined" && "matchMedia" in window
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : null;

export function prefersReducedMotion() {
  return consulta()?.matches ?? false;
}

/* Observa mudanças de preferência em tempo real (o visitante pode alternar
   nas configurações do sistema com a página já aberta). Retorna uma função
   de cancelamento. */
export function aoMudarPreferenciaDeMovimento(callback) {
  const mq = consulta();
  if (!mq) return () => {};
  const ouvir = (e) => callback(e.matches);
  mq.addEventListener("change", ouvir);
  return () => mq.removeEventListener("change", ouvir);
}
