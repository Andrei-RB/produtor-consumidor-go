export function initMotion() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('GSAP or ScrollTrigger not loaded yet.');
        return;
    }

    gsap.registerPlugin(ScrollTrigger);
    console.log('Motion system initialized.');
    
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Global Progress Bar
    const progressBar = document.createElement('div');
    progressBar.style.position = 'fixed';
    progressBar.style.top = '0';
    progressBar.style.left = '0';
    progressBar.style.height = '2px';
    progressBar.style.background = 'var(--go-cyan)';
    progressBar.style.width = '0%';
    progressBar.style.zIndex = '9999';
    progressBar.style.transformOrigin = 'left';
    progressBar.style.willChange = 'transform';
    document.body.appendChild(progressBar);

    if (!prefersReducedMotion) {
        gsap.to(progressBar, {
            width: '100%',
            ease: 'none',
            scrollTrigger: {
                trigger: document.body,
                start: 'top top',
                end: 'bottom bottom',
                scrub: true
            }
        });
        
        // Pinning the quote
        const quoteSection = document.querySelector('.pike-quote');
        if (quoteSection) {
            ScrollTrigger.create({
                trigger: quoteSection,
                start: "center center",
                end: "+=300",
                pin: true,
                pinSpacing: true
            });
        }
    }

    // Fade in up animation for editorial headers, bento cards, hazard cards, and syntax cards
    const elementsToAnimate = gsap.utils.toArray('.editorial-header, .bento-card, .hazard-card, .syntax-card');
    
    elementsToAnimate.forEach((el) => {
        if (prefersReducedMotion) {
            gsap.set(el, { opacity: 1, y: 0 });
        } else {
            gsap.from(el, {
                scrollTrigger: {
                    trigger: el,
                    start: "top 82%",
                },
                y: 40,
                opacity: 0,
                duration: 0.8,
                ease: "power3.out"
            });
        }
    });
}
