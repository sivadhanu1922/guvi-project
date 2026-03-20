// Custom cursor
(function () {
  const dot  = document.createElement('div');
  const ring = document.createElement('div');
  dot.className  = 'cursor-dot';
  ring.className = 'cursor-ring';
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  let mx = 0, my = 0, rx = 0, ry = 0;
  let hovering = false;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    // dot follows instantly using left/top (no transform lag)
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  // ring follows with smooth lag
  (function animRing() {
    rx += (mx - rx) * 0.15;
    ry += (my - ry) * 0.15;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animRing);
  })();

  // hover effects
  document.querySelectorAll('a, button, input, select, textarea, .p-nav-item').forEach(el => {
    el.addEventListener('mouseenter', () => {
      hovering = true;
      dot.style.width  = '12px';
      dot.style.height = '12px';
      dot.style.marginLeft = '-6px';
      dot.style.marginTop  = '-6px';
      ring.style.width  = '48px';
      ring.style.height = '48px';
      ring.style.marginLeft = '-24px';
      ring.style.marginTop  = '-24px';
      ring.style.borderColor = 'rgba(0,212,255,0.9)';
      ring.style.background  = 'rgba(0,212,255,0.05)';
    });
    el.addEventListener('mouseleave', () => {
      hovering = false;
      dot.style.width  = '7px';
      dot.style.height = '7px';
      dot.style.marginLeft = '-3.5px';
      dot.style.marginTop  = '-3.5px';
      ring.style.width  = '34px';
      ring.style.height = '34px';
      ring.style.marginLeft = '-17px';
      ring.style.marginTop  = '-17px';
      ring.style.borderColor = 'rgba(0,212,255,0.45)';
      ring.style.background  = 'transparent';
    });
  });

  // hide when mouse leaves window
  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
  });
})();

// Particle canvas
(function () {
  const canvas = document.createElement('canvas');
  canvas.id = 'particleCanvas';
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');

  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function Particle() {
    this.x = Math.random() * W;
    this.y = Math.random() * H;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.3;
    this.r  = Math.random() * 1.2 + 0.3;
    this.a  = Math.random() * 0.5 + 0.1;
  }
  Particle.prototype.update = function () {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0) this.x = W;
    if (this.x > W) this.x = 0;
    if (this.y < 0) this.y = H;
    if (this.y > H) this.y = 0;
  };

  for (let i = 0; i < 90; i++) particles.push(new Particle());

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.update();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,212,255,${p.a})`;
      ctx.fill();
    });

    // connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0,212,255,${0.06 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
})();