/* O vídeo de abertura é obrigatório. Políticas de autoplay variam por
   navegador e por configuração da máquina, e podem recusar em silêncio —
   o que deixaria o hero como um pôster estático na apresentação. */

export function garantirVideoDeAbertura() {
  const video = document.querySelector(".cena-video");
  const tocar = () => video.play().catch(() => {});

  tocar();

  // Se a política recusou, a primeira interação do visitante libera.
  const naPrimeiraInteracao = () => {
    tocar();
    document.removeEventListener("pointerdown", naPrimeiraInteracao);
    document.removeEventListener("keydown", naPrimeiraInteracao);
  };

  document.addEventListener("pointerdown", naPrimeiraInteracao);
  document.addEventListener("keydown", naPrimeiraInteracao);
}
