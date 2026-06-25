/* ═══════════════════════════════════════════════════
   IMPULSE — Preloader + Scroll Reveal + Cursor Trail
   (Glassmorphism Redesign — no heartbeat shimmer)
   ═══════════════════════════════════════════════════ */

// ── Preloader ────────────────────────────────────────
(function initPreloader() {
  const overlay  = document.getElementById('preloader');
  const titleEl  = document.getElementById('preloader-title');
  const subEl    = document.getElementById('preloader-sub');
  const progBar  = document.getElementById('preloader-bar');
  const progWrap = document.querySelector('.preloader-progress');
  const zapFlash = document.getElementById('zapFlash');

  let progress = 0, textRevealed = false;
  setTimeout(() => { if (progWrap) progWrap.classList.add('revealed'); }, 200);

  function revealText() {
    if (textRevealed) return;
    textRevealed = true;
    if (zapFlash) {
      zapFlash.classList.add('active');
      setTimeout(() => {
        zapFlash.classList.remove('active');
        titleEl.classList.add('revealed');
        subEl.classList.add('revealed');
      }, 80);
    } else {
      titleEl.classList.add('revealed');
      subEl.classList.add('revealed');
    }
  }

  const interval = setInterval(() => {
    progress += Math.random() * 9 + 4;
    if (progress > 100) progress = 100;
    progBar.style.width = progress + '%';
    if (progress >= 55) revealText();
    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        overlay.style.opacity = '0';
        setTimeout(() => {
          overlay.style.display = 'none';
          document.body.classList.remove('preloading');
          initScrollReveal();
          initSectionEffects();
        }, 700);
      }, 1400);
    }
  }, 80);
})();

// ── Scroll Reveal ─────────────────────────────────────
function initScrollReveal() {
  const revealEls = document.querySelectorAll(
    '.bento-card, .message-card, .glass-row, .hero-actions'
  );
  revealEls.forEach((el, i) => {
    el.classList.add('sr-hidden');
    el.style.transitionDelay = (i % 5) * 0.07 + 's';
  });
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('sr-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.10 });
  revealEls.forEach(el => obs.observe(el));
}

// ── Cursor Spark Trail ────────────────────────────────
(function initCursorTrail() {
  if ('ontouchstart' in window) return;
  const trailCanvas = document.getElementById('cursor-trail');
  if (!trailCanvas) return;
  const tc = trailCanvas.getContext('2d');
  let tw = trailCanvas.width  = window.innerWidth;
  let th = trailCanvas.height = window.innerHeight;
  window.addEventListener('resize', () => {
    tw = trailCanvas.width  = window.innerWidth;
    th = trailCanvas.height = window.innerHeight;
  });
  let dots = [];
  document.addEventListener('mousemove', e => {
    if (Math.random() < 0.3) {
      dots.push({
        x: e.clientX, y: e.clientY,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5 - 0.5,
        life: 18 + Math.random() * 14, maxLife: 32,
        size: 1.2 + Math.random() * 2,
        // Blue/cyan palette for glassmorphism feel
        hue: 190 + Math.random() * 40
      });
    }
  });
  (function trailLoop() {
    requestAnimationFrame(trailLoop);
    tc.clearRect(0, 0, tw, th);
    dots = dots.filter(d => d.life > 0);
    dots.forEach(d => {
      d.x += d.vx; d.y += d.vy; d.vy += 0.04; d.life--;
      const a = d.life / d.maxLife;
      tc.save();
      tc.globalAlpha = a * 0.6;
      tc.fillStyle   = `hsl(${d.hue}, 90%, 70%)`;
      tc.shadowColor = tc.fillStyle;
      tc.shadowBlur  = 5;
      tc.beginPath();
      tc.arc(d.x, d.y, d.size * a, 0, Math.PI * 2);
      tc.fill();
      tc.restore();
    });
  })();
})();

// ── Section Effects ───────────────────────────────────
function initSectionEffects() {
  let gMouseX = window.innerWidth / 2;
  let gMouseY = window.innerHeight / 2;
  window.addEventListener('mousemove', e => { gMouseX = e.clientX; gMouseY = e.clientY; });

  function createSectionCanvas(section) {
    const cv = document.createElement('canvas');
    cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;';
    section.style.position = 'relative';
    section.insertBefore(cv, section.firstChild);
    function resize() { cv.width = section.offsetWidth; cv.height = section.offsetHeight; }
    resize();
    window.addEventListener('resize', resize);
    return cv;
  }

  // Starfield — subtle particles in hero/messages
  function initStarfield(section) {
    const cv  = createSectionCanvas(section);
    const ctx = cv.getContext('2d');
    const GLOW_RADIUS = 120;
    let stars = [];
    function seed() {
      stars = [];
      const count = Math.floor((cv.width * cv.height) / 4000);
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * cv.width,
          y: Math.random() * cv.height,
          r: 0.3 + Math.random() * 0.7,
          baseAlpha: 0.06 + Math.random() * 0.16,
          vx: (Math.random() - 0.5) * 0.05,
          vy: (Math.random() - 0.5) * 0.05,
          // Blue-white for glassmorphism theme
          hue: Math.random() < 0.75 ? 200 + Math.random() * 50 : 38 + Math.random() * 20,
        });
      }
    }
    seed();
    window.addEventListener('resize', seed);
    function loop() {
      requestAnimationFrame(loop);
      ctx.clearRect(0, 0, cv.width, cv.height);
      const rect = section.getBoundingClientRect();
      const lx = gMouseX - rect.left;
      const ly = gMouseY - rect.top;
      stars.forEach(s => {
        s.x += s.vx; s.y += s.vy;
        if (s.x < 0) s.x = cv.width;  if (s.x > cv.width) s.x = 0;
        if (s.y < 0) s.y = cv.height; if (s.y > cv.height) s.y = 0;
        const dx = s.x - lx, dy = s.y - ly;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const prox = dist < GLOW_RADIUS ? 1 - (dist / GLOW_RADIUS) : 0;
        const alpha = s.baseAlpha + prox * 0.45;
        const glow  = prox * 5;
        const radius = s.r + prox * 0.8;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = `hsl(${s.hue}, 70%, 82%)`;
        if (prox > 0.05) { ctx.shadowColor = `hsl(${s.hue}, 90%, 88%)`; ctx.shadowBlur = glow; }
        ctx.beginPath();
        ctx.arc(s.x, s.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }
    loop();
  }

  // Floating gear particles for spirit section
  function initGearParticles(section) {
    const cv  = createSectionCanvas(section);
    const ctx = cv.getContext('2d');
    const COUNT = 16;
    const gears = [];
    function makeGear() {
      return {
        x: Math.random() * cv.width, y: cv.height + 20,
        size: 6 + Math.random() * 14, speed: 0.3 + Math.random() * 0.5,
        rot: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.02,
        alpha: 0.06 + Math.random() * 0.11, teeth: Math.random() < 0.5 ? 6 : 8,
        drift: (Math.random() - 0.5) * 0.3,
      };
    }
    for (let i = 0; i < COUNT; i++) { const g = makeGear(); g.y = Math.random() * cv.height; gears.push(g); }
    function drawGearShape(ctx, teeth, r, toothH) {
      ctx.beginPath();
      const step = (Math.PI * 2) / teeth;
      for (let i = 0; i < teeth; i++) {
        const a = i * step;
        const a1 = a - step * 0.22, a2 = a - step * 0.1, a3 = a + step * 0.1, a4 = a + step * 0.22;
        ctx.lineTo(Math.cos(a1) * r,       Math.sin(a1) * r);
        ctx.lineTo(Math.cos(a2) * (r+toothH), Math.sin(a2) * (r+toothH));
        ctx.lineTo(Math.cos(a3) * (r+toothH), Math.sin(a3) * (r+toothH));
        ctx.lineTo(Math.cos(a4) * r,       Math.sin(a4) * r);
      }
      ctx.closePath();
    }
    function loop() {
      requestAnimationFrame(loop);
      ctx.clearRect(0, 0, cv.width, cv.height);
      gears.forEach(g => {
        g.y -= g.speed; g.x += g.drift; g.rot += g.rotSpeed;
        if (g.y < -30) Object.assign(g, makeGear());
        ctx.save();
        ctx.translate(g.x, g.y); ctx.rotate(g.rot);
        ctx.globalAlpha = g.alpha;
        ctx.strokeStyle = 'rgba(79,158,255,0.8)';
        ctx.lineWidth = 1;
        drawGearShape(ctx, g.teeth, g.size, g.size * 0.28);
        ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, g.size * 0.28, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      });
    }
    loop();
  }

  // Page dust for flipbook section
  function initPageDust(section) {
    const cv  = createSectionCanvas(section);
    const ctx = cv.getContext('2d');
    const motes = [];
    function makeMote() {
      return { x: Math.random()*cv.width, y: Math.random()*cv.height, w: 2+Math.random()*5, h: 1+Math.random()*2.5, rot: Math.random()*Math.PI, rotSpeed: (Math.random()-0.5)*0.008, vx: (Math.random()-0.5)*0.18, vy: -0.15-Math.random()*0.25, alpha: 0.03+Math.random()*0.07 };
    }
    for (let i = 0; i < 28; i++) motes.push(makeMote());
    function loop() {
      requestAnimationFrame(loop);
      ctx.clearRect(0, 0, cv.width, cv.height);
      if (Math.random() < 0.12) motes.push(makeMote());
      for (let i = motes.length-1; i >= 0; i--) {
        const m = motes[i];
        m.x += m.vx; m.y += m.vy; m.rot += m.rotSpeed;
        if (m.y < -10 || m.x < -10 || m.x > cv.width+10) { motes.splice(i, 1); continue; }
        ctx.save(); ctx.translate(m.x, m.y); ctx.rotate(m.rot);
        ctx.globalAlpha = m.alpha;
        ctx.fillStyle = 'rgba(79,158,255,1)';
        ctx.fillRect(-m.w/2, -m.h/2, m.w, m.h);
        ctx.restore();
      }
    }
    loop();
  }

  const heroSection     = document.getElementById('home');
  const messagesSection = document.getElementById('messages');
  const spiritSection   = document.getElementById('spirit');
  const flipbookSection = document.getElementById('flipbook');
  if (heroSection)     initStarfield(heroSection);
  if (messagesSection) initStarfield(messagesSection);
  if (spiritSection)   initGearParticles(spiritSection);
  if (flipbookSection) initPageDust(flipbookSection);
}
