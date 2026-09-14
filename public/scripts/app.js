import { initMotion } from './motion.js';
import { BufferSimulation, initCodeLaboratory } from './simulations.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('App initialized: A Filosofia de Concorrência em Go');
    
    initMotion();
    initCodeLaboratory();

    // Lazy load the simulation via IntersectionObserver
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const targetId = entry.target.id;
                console.log(`Initializing simulation for ${targetId}`);
                
                if (targetId === 'buffer-vis-placeholder' || targetId === 'csp-vis-placeholder') {
                    new BufferSimulation(targetId);
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    const placeholders = document.querySelectorAll('.vis-container');
    placeholders.forEach(el => observer.observe(el));
});
