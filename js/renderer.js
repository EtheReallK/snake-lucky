/* ===== Canvas 渲染引擎 ===== */
const Renderer = (() => {
  const GRID_COLOR   = '#1a1a2e';
  const BG_COLOR     = '#0a0a0f';
  const SNAKE_HEAD   = '#00ffff';
  const SNAKE_BODY   = '#00cccc';
  const FOOD_COLOR   = '#ff6600';

  function drawFrame(canvas, snake, food, score, best, cols, rows) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const cs = W / cols; // cell size

    // 背景
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, W, H);

    // 网格
    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= cols; x++) {
      ctx.beginPath(); ctx.moveTo(x * cs, 0); ctx.lineTo(x * cs, H); ctx.stroke();
    }
    for (let y = 0; y <= rows; y++) {
      ctx.beginPath(); ctx.moveTo(0, y * cs); ctx.lineTo(W, y * cs); ctx.stroke();
    }

    // 食物
    if (food) {
      const fx = food.x * cs + cs / 2;
      const fy = food.y * cs + cs / 2;
      const fr = cs * 0.38;
      ctx.save();
      ctx.shadowColor = FOOD_COLOR;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(fx, fy, fr, 0, Math.PI * 2);
      ctx.fillStyle = FOOD_COLOR;
      ctx.fill();
      // 高光
      ctx.beginPath();
      ctx.arc(fx - fr * 0.3, fy - fr * 0.3, fr * 0.25, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,200,100,0.6)';
      ctx.shadowBlur = 0;
      ctx.fill();
      ctx.restore();
    }

    // 蛇
    snake.forEach((seg, i) => {
      const sx = seg.x * cs + cs / 2;
      const sy = seg.y * cs + cs / 2;
      const alpha = Math.max(0.15, 1 - i * 0.06);
      const r = i === 0 ? cs * 0.44 : cs * 0.36 * (0.8 + 0.2 * alpha);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.shadowColor = SNAKE_HEAD;
      ctx.shadowBlur = i === 0 ? 14 : 6;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fillStyle = i === 0 ? SNAKE_HEAD : SNAKE_BODY;
      ctx.fill();

      // 蛇头：眼睛
      if (i === 0) {
        ctx.shadowBlur = 0;
        ctx.fillStyle = BG_COLOR;
        ctx.beginPath(); ctx.arc(sx + r * 0.35, sy - r * 0.25, r * 0.18, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(sx - r * 0.35, sy - r * 0.25, r * 0.18, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = SNAKE_HEAD;
        ctx.beginPath(); ctx.arc(sx + r * 0.35, sy - r * 0.25, r * 0.08, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(sx - r * 0.35, sy - r * 0.25, r * 0.08, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    });
  }

  /* ===== 暂停遮罩 ===== */
  function showPauseOverlay(canvas) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    // 半透明蒙层
    ctx.save();
    ctx.fillStyle = 'rgba(10,10,15,0.72)';
    ctx.fillRect(0, 0, W, H);
    // PAUSED 文字
    ctx.font = `bold ${W * 0.1}px 'Courier New', monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#00ffff';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 18;
    ctx.fillText('PAUSED', W / 2, H / 2 - W * 0.06);
    // 提示文字
    ctx.font = `${W * 0.05}px 'Courier New', monospace`;
    ctx.fillStyle = '#007777';
    ctx.shadowBlur = 0;
    ctx.fillText('点击 ⏸ 继续游戏', W / 2, H / 2 + W * 0.06);
    ctx.restore();
  }

  function hidePauseOverlay(canvas) {
    // 直接重新绘制一帧即可覆盖遮罩（由 game.js tick 自动触发）
    // 这里只是占位，保持接口对称
  }

  /* ===== 粒子系统 ===== */
  let particles = [];
  let particleCanvas, particleCtx, particleAnimId;

  function initParticles(canvas) {
    particleCanvas = canvas;
    particleCtx = canvas.getContext('2d');
  }

  function burst(x, y, colors, count = 80) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: 2 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
        decay: 0.015 + Math.random() * 0.02,
      });
    }
    if (!particleAnimId) animateParticles();
  }

  function animateParticles() {
    if (!particleCanvas) return;
    particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15; // 重力
      p.life -= p.decay;
      particleCtx.save();
      particleCtx.globalAlpha = Math.max(0, p.life);
      particleCtx.fillStyle = p.color;
      particleCtx.shadowColor = p.color;
      particleCtx.shadowBlur = 4;
      particleCtx.beginPath();
      particleCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      particleCtx.fill();
      particleCtx.restore();
    });
    if (particles.length > 0) {
      particleAnimId = requestAnimationFrame(animateParticles);
    } else {
      particleAnimId = null;
      particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
    }
  }

  function stopParticles() {
    if (particleAnimId) { cancelAnimationFrame(particleAnimId); particleAnimId = null; }
    particles = [];
    if (particleCtx) particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
  }

  return { drawFrame, showPauseOverlay, hidePauseOverlay, initParticles, burst, stopParticles };
})();
