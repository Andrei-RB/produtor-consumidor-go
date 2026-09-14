export class BufferSimulation {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        
        this.container.innerHTML = '';
        this.container.style.position = 'relative';
        this.container.style.display = 'flex';
        this.container.style.flexDirection = 'column';
        
        this.canvas = document.createElement('canvas');
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.display = 'block';
        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        this.N = 8;
        this.buffer = new Array(this.N).fill(null);
        this.sendx = 0;
        this.recvx = 0;
        this.count = 0;
        this.itemCounter = 1;
        
        this.prodSpeed = 1000;
        this.consSpeed = 1500;
        
        this.prodTimer = null;
        this.consTimer = null;
        this.isRunning = false;
        
        this.colors = {
            bg: '#111116',
            cyan: '#00ADD8',
            cyanGlow: 'rgba(0, 173, 216, 0.3)',
            red: '#E03E52',
            textPrimary: '#F2F2F2',
            textSecondary: '#A0A0A5',
            slotEmpty: 'rgba(255,255,255,0.05)',
            slotFull: 'rgba(0, 173, 216, 0.2)'
        };
        
        this.resize();
        window.addEventListener('resize', this.debounce(() => this.resize(), 200));
        
        this.buildControls();
        
        this.render = this.render.bind(this);
        requestAnimationFrame(this.render);
        this.start();
    }
    
    debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
    
    resize() {
        const rect = this.container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        this.width = rect.width;
        this.height = rect.height;
    }
    
    buildControls() {
        const controls = document.createElement('div');
        controls.style.position = 'absolute';
        controls.style.bottom = '10px';
        controls.style.left = '0';
        controls.style.width = '100%';
        controls.style.display = 'flex';
        controls.style.justifyContent = 'center';
        controls.style.gap = '15px';
        controls.style.fontFamily = 'var(--font-mono)';
        controls.style.fontSize = '10px';
        controls.style.color = 'var(--text-secondary)';
        
        const createSlider = (label, min, max, val, onChange) => {
            const wrapper = document.createElement('div');
            wrapper.style.display = 'flex';
            wrapper.style.flexDirection = 'column';
            wrapper.style.alignItems = 'center';
            
            const lbl = document.createElement('span');
            lbl.innerText = label;
            lbl.style.marginBottom = '5px';
            
            const input = document.createElement('input');
            input.type = 'range';
            input.min = min;
            input.max = max;
            input.value = val;
            input.style.accentColor = 'var(--go-cyan)';
            input.style.width = '80px';
            
            input.addEventListener('input', (e) => onChange(e.target.value));
            
            wrapper.appendChild(lbl);
            wrapper.appendChild(input);
            return wrapper;
        };
        
        controls.appendChild(createSlider('Produtor', 200, 2000, 1000, v => { this.prodSpeed = 2200 - v; this.resetTimers(); }));
        controls.appendChild(createSlider('Consumidor', 200, 2000, 1500, v => { this.consSpeed = 2200 - v; this.resetTimers(); }));
        
        this.container.appendChild(controls);
    }
    
    start() {
        if(this.isRunning) return;
        this.isRunning = true;
        this.resetTimers();
    }
    
    stop() {
        this.isRunning = false;
        clearTimeout(this.prodTimer);
        clearTimeout(this.consTimer);
    }
    
    resetTimers() {
        if(!this.isRunning) return;
        clearTimeout(this.prodTimer);
        clearTimeout(this.consTimer);
        this.produceLoop();
        this.consumeLoop();
    }
    
    produceLoop() {
        if(this.count < this.N) {
            this.buffer[this.sendx] = this.itemCounter++;
            this.sendx = (this.sendx + 1) % this.N;
            this.count++;
        }
        this.prodTimer = setTimeout(() => this.produceLoop(), this.prodSpeed);
    }
    
    consumeLoop() {
        if(this.count > 0) {
            this.buffer[this.recvx] = null;
            this.recvx = (this.recvx + 1) % this.N;
            this.count--;
        }
        this.consTimer = setTimeout(() => this.consumeLoop(), this.consSpeed);
    }
    
    render() {
        if(!this.ctx) return;
        
        const cx = this.width / 2;
        const cy = this.height / 2 - 20;
        const radius = Math.min(cx, cy) * 0.5;
        
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw ring
        for(let i=0; i<this.N; i++) {
            const angle = (i / this.N) * Math.PI * 2 - Math.PI / 2;
            const x = cx + Math.cos(angle) * radius;
            const y = cy + Math.sin(angle) * radius;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, 16, 0, Math.PI * 2);
            
            if(this.buffer[i] !== null) {
                this.ctx.fillStyle = this.colors.slotFull;
                this.ctx.fill();
                this.ctx.strokeStyle = this.colors.cyan;
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                
                this.ctx.fillStyle = this.colors.cyan;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.font = '12px "JetBrains Mono"';
                this.ctx.fillText(this.buffer[i], x, y);
            } else {
                this.ctx.fillStyle = this.colors.slotEmpty;
                this.ctx.fill();
                this.ctx.strokeStyle = this.colors.textSecondary;
                this.ctx.lineWidth = 1;
                this.ctx.stroke();
            }
            
            // Draw pointers
            if(i === this.sendx) {
                this.drawPointer(x, y, angle, 'sendx', this.count === this.N ? this.colors.red : this.colors.textPrimary);
            }
            if(i === this.recvx) {
                this.drawPointer(x, y, angle, 'recvx', this.count === 0 ? this.colors.textSecondary : this.colors.cyan);
            }
        }
        
        // Status text
        this.ctx.textAlign = 'center';
        this.ctx.font = '12px "JetBrains Mono"';
        if(this.count === this.N) {
            this.ctx.fillStyle = this.colors.red;
            this.ctx.fillText('gopark (Cheio)', cx, cy);
        } else if (this.count === 0) {
            this.ctx.fillStyle = this.colors.textSecondary;
            this.ctx.fillText('gopark (Vazio)', cx, cy);
        } else {
            this.ctx.fillStyle = this.colors.cyan;
            this.ctx.fillText(`len: ${this.count}/${this.N}`, cx, cy);
        }
        
        requestAnimationFrame(this.render);
    }
    
    drawPointer(x, y, angle, label, color) {
        const px = x + Math.cos(angle) * 30;
        const py = y + Math.sin(angle) * 30;
        
        this.ctx.fillStyle = color;
        this.ctx.font = '10px "JetBrains Mono"';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(label, px, py);
    }
}

// Code Laboratory Interactions
export function initCodeLaboratory() {
    const tabContainer = document.querySelector('.language-tabs');
    if (!tabContainer) return;

    // Accessibility: make buttons focusable
    tabContainer.querySelectorAll('.tab-btn').forEach(btn => btn.setAttribute('tabindex', '0'));

    const handleInteraction = (e) => {
        const btn = e.target.closest('.tab-btn');
        if (!btn) return;

        // Support keyboard interaction (Enter or Space)
        if (e.type === 'keydown' && (e.key !== 'Enter' && e.key !== ' ')) return;
        if (e.type === 'keydown') e.preventDefault(); // prevent page scroll on space

        // Reset all buttons
        tabContainer.querySelectorAll('.tab-btn').forEach(t => {
            t.classList.remove('active');
            t.setAttribute('aria-selected', 'false');
        });

        // Activate clicked button
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        // Hide all panels
        const lab = btn.closest('.code-laboratory');
        lab.querySelectorAll('.syntax-card').forEach(panel => {
            panel.classList.remove('active');
            panel.setAttribute('hidden', '');
        });

        // Show target panel
        const targetId = btn.getAttribute('data-target');
        const targetPanel = document.getElementById(targetId);
        if (targetPanel) {
            targetPanel.classList.add('active');
            targetPanel.removeAttribute('hidden');
            
            // Hook for future animation triggering
            triggerCodeAnimation(targetPanel);
        }
    };

    // Event delegation for tab switching
    tabContainer.addEventListener('click', handleInteraction);
    tabContainer.addEventListener('keydown', handleInteraction);
}

function triggerCodeAnimation(panel) {
    // Callback preparatório para a Fase 4
    // Aqui injetaremos GSAP para animar blocos de código
    console.log(`Code panel ${panel.id} activated. Ready for GSAP animation.`);
}
