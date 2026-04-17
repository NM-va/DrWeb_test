/**
 * Анимация фона баннера:
 *   - Паттерн цифр рисуется ОДИН РАЗ на matrixCanvas (статично)
 *   - Пульс меняет opacity matrixCanvas через style — вспышки яркости
 *   - Три вращающихся сферы свечения анимируются на glowCanvas
 */

const MatrixGlow = {
  init({ matrixCanvas, glowCanvas, patternSrc = '' } = {}) {
    if (!(matrixCanvas instanceof HTMLCanvasElement)) return;

    const hasGlow = glowCanvas instanceof HTMLCanvasElement;
    const mct = matrixCanvas.getContext('2d');

    // ─────────────────────────────────────────────────────────
    // ПУЛЬС — имитация кардиограммы:
    // резкий пик (молния) → мягче → затухание → пауза → повтор
    // ─────────────────────────────────────────────────────────
    const PULSE = {
      T_RISE:  80,   
      T_HOLD:  120,  
      T_FALL:  200,  
      T_SOFT:  600,  
      T_DECAY: 1400, 
      T_PAUSE: 3200, 

      BASE:  0.35,
      PEAK1: 1.0,    
      PEAK2: 0.65,

      get(t) {
        const cycle = this.T_RISE + this.T_HOLD + this.T_FALL
                    + this.T_SOFT + this.T_DECAY + this.T_PAUSE;
        const ph = t % cycle;

        const p1 = this.T_RISE;
        const p2 = p1 + this.T_HOLD;
        const p3 = p2 + this.T_FALL;
        const p4 = p3 + this.T_SOFT;
        const p5 = p4 + this.T_DECAY;

        if (ph < p1) {
          const p = ph / this.T_RISE;
          return this.BASE + (this.PEAK1 - this.BASE) * (p * p);
        } else if (ph < p2) {
          return this.PEAK1;
        } else if (ph < p3) {
          const p = (ph - p2) / this.T_FALL;
          return this.PEAK1 + (this.PEAK2 - this.PEAK1) * p;
        } else if (ph < p4) {
          const p = (ph - p3) / this.T_SOFT;
          return this.PEAK2 * (1 - 0.15 * Math.sin(Math.PI * p));
        } else if (ph < p5) {
          const p = (ph - p4) / this.T_DECAY;
          const val = this.PEAK2 + (this.BASE - this.PEAK2) * (p * p);
          return Math.max(this.BASE, val);
        } else {
          return this.BASE;
        }
      },
    };

    // ─────────────────────────────────────────────────────────
    // ПАТТЕРН — загружаем img, рисуем один раз на matrixCanvas
    // opacity canvas меняется пульсом (не перерисовываем!)
    // ─────────────────────────────────────────────────────────
    const PATTERN_OPACITY_MIN = 0.1;
    const PATTERN_OPACITY_MAX = 0.45;

    let mW, mH;

    function initMatrix() {
      const section = matrixCanvas.closest('.banner-section')
        ?? matrixCanvas.parentElement?.parentElement;
      mW = matrixCanvas.width  = (section?.offsetWidth  || 0) || window.innerWidth;
      mH = matrixCanvas.height = (section?.offsetHeight || 0) || window.innerHeight;
    }

    let patternImgCache = null;

    function renderPattern() {
      if (!patternImgCache || !patternImgCache.complete) return;
      const img = patternImgCache;
      mct.clearRect(0, 0, mW, mH);
      
      const scale = Math.max(mW / img.naturalWidth, mH / img.naturalHeight) / 1.8;
      const dw = img.naturalWidth  * scale;
      const dh = img.naturalHeight * scale;
      
      const dx = (mW - dw) / 2;
      const dy = (mH - dh) / 2 - (mH * 0.12);
      
      mct.drawImage(img, dx, dy, dw, dh);
    }

    function drawPattern() {
      if (!patternSrc) return;
      if (patternImgCache && patternImgCache.complete) {
        renderPattern();
        return;
      }
      const img = new Image();
      img.onload = () => {
        patternImgCache = img;
        renderPattern();
      };
      img.onerror = () => {
        console.warn('[MatrixGlow] pattern not loaded:', patternSrc);
      };
      img.src = patternSrc;
    }

    matrixCanvas.style.opacity = PATTERN_OPACITY_MIN.toFixed(3);

    function updatePatternOpacity(pulse) {
      const opacity = PATTERN_OPACITY_MIN
        + (PATTERN_OPACITY_MAX - PATTERN_OPACITY_MIN) * pulse;
      matrixCanvas.style.opacity = opacity.toFixed(3);
    }

    // ─────────────────────────────────────────────────────────
    // СВЕЧЕНИЕ — три сферы на эллиптической орбите
    // ─────────────────────────────────────────────────────────
    const gct = hasGlow ? glowCanvas.getContext('2d') : null;

    const SPHERES = [
      { phase: 0 },
      { phase: (2 * Math.PI) / 3 },
      { phase: (4 * Math.PI) / 3 },
    ];

    const ORBIT_RX  = 0.13;
    const ORBIT_RY  = 0.04;
    const ORBIT_CX  = 0.50;
    const ORBIT_CY  = 0.32;        
    const SPEED     = 0.0004;
    const RADIUS_MAX = 0.242;
    const RADIUS_MIN = 0.154;
    const ALPHA_MAX  = 0.95;        
    const ALPHA_MIN  = 0.40;        

    let gW, gH, angle = 0;

    function initGlow() {
      const section = glowCanvas.closest('.banner-section')
        ?? glowCanvas.parentElement?.parentElement;
      gW = glowCanvas.width  = (section?.offsetWidth  || 0) || window.innerWidth;
      gH = glowCanvas.height = (section?.offsetHeight || 0) || window.innerHeight;
    }

    function drawGlow(dt, now) {
      angle += SPEED * dt;

      const pulse = PULSE.get(now);
      const glowIntensity = 0.85 + pulse * 0.5;

      updatePatternOpacity(pulse);

      gct.clearRect(0, 0, gW, gH);

      const cx    = gW * ORBIT_CX;
      const cy    = gH * ORBIT_CY;
      const rx    = gW * ORBIT_RX;
      const ry    = gH * ORBIT_RY;
      const rBase = Math.min(gW, gH);

      const sphereData = SPHERES.map((s) => {
        const a = angle + s.phase;
        const x = cx + Math.cos(a) * rx;
        const y = cy + Math.sin(a) * ry;
        const z = Math.cos(a);
        const t = (z + 1) / 2;
        const r = rBase * (RADIUS_MIN + (RADIUS_MAX - RADIUS_MIN) * t);
        const al = Math.max(0.35, Math.min(0.98,
          (ALPHA_MIN + (ALPHA_MAX - ALPHA_MIN) * t) * glowIntensity,
        ));
        return { x, y, r, al, z };
      });

      sphereData.sort((a, b) => a.z - b.z);

      sphereData.forEach(({ x, y, r, al }) => {
        const grad = gct.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0,    `rgba(95,217,0,${(al * 0.98).toFixed(3)})`);
        grad.addColorStop(0.30, `rgba(95,217,0,${(al * 0.80).toFixed(3)})`);
        grad.addColorStop(0.65, `rgba(95,217,0,${(al * 0.55).toFixed(3)})`);
        grad.addColorStop(1,    'rgba(95,217,0,0)');
        gct.fillStyle = grad;
        gct.beginPath();
        gct.arc(x, y, r, 0, Math.PI * 2);
        gct.fill();
      });
    }

    // ─────────────────────────────────────────────────────────
    // ГЛАВНЫЙ ЦИКЛ
    // ─────────────────────────────────────────────────────────
    let prevTime = 0;

    function tick(now) {
      requestAnimationFrame(tick);
      const dt = now - prevTime;
      prevTime = now;
      if (hasGlow) drawGlow(Math.min(dt, 100), now);
    }

    // ─────────────────────────────────────────────────────────
    // РЕСАЙЗ
    // ─────────────────────────────────────────────────────────
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        initMatrix();
        drawPattern();
        if (hasGlow) initGlow();
      }, 150);
    });

    // ─────────────────────────────────────────────────────────
    // СТАРТ
    // ─────────────────────────────────────────────────────────
    initMatrix();
    drawPattern();
    if (hasGlow) initGlow();
    requestAnimationFrame(tick);
  },
};

export default MatrixGlow;