/* ===== 状态机 & 页面路由 ===== */
const MAX_GAMES = 3;
const UNLOCK_SCORE = 61;

let state = {
  currentPage: 'start',
  gameIndex: 0,      // 当前是第几局（0-based）
  currentScore: 0,
  currentUnlocked: false,
};

/* ===== 页面切换 ===== */
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  state.currentPage = id;
}

/* ===== 工具 ===== */
function formatScore(n) { return String(n).padStart(4, '0'); }

function updateChanceDots(container, gamesPlayed) {
  const dots = container.querySelectorAll('.chance-dot');
  dots.forEach((d, i) => {
    d.classList.toggle('used', i < gamesPlayed);
  });
}

/* ===== 开始页 ===== */
function initStartPage() {
  const data = Storage.get();
  const gamesLeft = MAX_GAMES - data.gamesPlayed;

  document.getElementById('start-best').textContent = 'BEST: ' + formatScore(data.bestScore);
  updateChanceDots(document.getElementById('start-chances'), data.gamesPlayed);

  const btn = document.getElementById('btn-start');
  if (data.gamesPlayed >= MAX_GAMES) {
    btn.textContent = '查看结果';
    btn.onclick = () => { Audio8bit.click(); showReviewPage(); };
  } else {
    btn.textContent = '开始游戏';
    btn.onclick = () => { Audio8bit.click(); startGame(); };
  }
}

/* ===== 游戏页 ===== */
function startGame() {
  const data = Storage.get();
  state.gameIndex = data.gamesPlayed; // 0-based，还没increment
  state.currentScore = 0;
  state.currentUnlocked = false;

  // 更新UI
  updateChanceDots(document.getElementById('game-chances'), data.gamesPlayed);
  updateProgressBar(0);

  showPage('game');
  resetPauseBtn();
  Renderer.stopParticles();

  // 延迟两帧再启动，确保页面布局已完成、canvas 尺寸正确
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      Game.resizeCanvas();
      Game.start(data.bestScore);
    });
  });
}

function updateProgressBar(score) {
  const TARGET = 61;
  const pct = Math.min(score / TARGET * 100, 100);
  const fill = document.getElementById('progress-bar-fill');
  const glow = document.getElementById('progress-bar-glow');
  const label = document.getElementById('progress-label');
  const scoreEl = document.getElementById('progress-score');
  if (!fill) return;

  fill.style.width = pct + '%';
  glow.style.width = pct + '%';
  scoreEl.textContent = score + ' / ' + TARGET;

  if (score >= TARGET) {
    fill.classList.add('full');
    glow.classList.add('full');
    label.textContent = '🎉 盲盒已解锁！';
    label.className = 'progress-label unlocked';
  } else {
    fill.classList.remove('full');
    glow.classList.remove('full');
    label.textContent = '还差 ' + (TARGET - score) + ' 分解锁盲盒 🎁';
    label.className = 'progress-label';
  }
}

function onScoreUpdate(score) {
  state.currentScore = score;
  updateProgressBar(score);
}

function onUnlock61() {
  state.currentUnlocked = true;
  updateProgressBar(61);
}

function onDie(score, unlocked) {
  // 记录本局
  Storage.incrementGames();
  Storage.updateBest(score);
  showDeadPage(score, unlocked);
}

/* ===== 结束页 ===== */
function showDeadPage(score, unlocked) {
  const data = Storage.get();
  document.getElementById('dead-score').textContent = formatScore(score);
  document.getElementById('dead-best').textContent = formatScore(data.bestScore);

  const title = document.getElementById('dead-title');
  const encourage = document.getElementById('dead-encourage');
  const btnLottery = document.getElementById('btn-lottery');
  const btnRetry = document.getElementById('btn-retry');

  const gamesLeft = MAX_GAMES - data.gamesPlayed;

  if (unlocked) {
    title.className = 'dead-title win';
    title.textContent = '🎉 YOU WIN!';
    encourage.className = 'dead-encourage win-tip';
    encourage.textContent = '✨ 恭喜解锁盲盒抽奖！快来开盲盒！';
    btnLottery.style.display = '';
    btnLottery.onclick = () => {
      Audio8bit.click();
      Storage.recordLottery(state.gameIndex, score, -1); // -1 占位，开盒后更新
      showLotteryPage(score);
    };
  } else {
    title.className = 'dead-title lose';
    title.textContent = 'GAME OVER';
    btnLottery.style.display = 'none';
    const gap = UNLOCK_SCORE - score;
    if (gap > 0 && gamesLeft > 0) {
      encourage.className = 'dead-encourage';
      encourage.textContent = `🎁 再差 ${gap} 分就能开盲盒！`;
    } else if (gamesLeft === 0) {
      encourage.className = 'dead-encourage';
      encourage.textContent = '游戏机会已用完，查看你的抽奖结果吧 🎊';
    } else {
      encourage.className = 'dead-encourage';
      encourage.textContent = '';
    }
  }

  // 再玩一次 / 查看结果
  if (gamesLeft > 0) {
    btnRetry.textContent = '再玩一次';
    btnRetry.onclick = () => { Audio8bit.click(); startGame(); };
  } else {
    btnRetry.textContent = '查看全部结果';
    btnRetry.onclick = () => { Audio8bit.click(); showReviewPage(); };
  }

  // 爆炸粒子（仅胜利）
  if (unlocked) {
    setTimeout(() => {
      const colors = ['#ffd700', '#ff6600', '#00ffff', '#ff44aa', '#44ff88'];
      const cx = window.innerWidth / 2, cy = window.innerHeight / 3;
      Renderer.burst(cx, cy, colors, 120);
    }, 200);
  }

  showPage('dead');
}

/* ===== 盲盒页 ===== */
function showLotteryPage(score) {
  showPage('lottery');
  Lottery.prepare((prizeIdx) => {
    // 记录真实奖品
    const data = Storage.get();
    const lastResult = data.lotteryResults[data.lotteryResults.length - 1];
    if (lastResult) lastResult.prizeIndex = prizeIdx;
    // 直接更新localStorage
    try {
      const raw = JSON.parse(localStorage.getItem('snakeLucky_v1') || '{}');
      if (raw.lotteryResults && raw.lotteryResults.length > 0) {
        raw.lotteryResults[raw.lotteryResults.length - 1].prizeIndex = prizeIdx;
        localStorage.setItem('snakeLucky_v1', JSON.stringify(raw));
      }
    } catch (e) {}
    showResultPage(prizeIdx);
  });
}

/* ===== 结果页 ===== */
function showResultPage(prizeIdx) {
  const prize = PRIZES[prizeIdx];
  document.getElementById('result-prize-name').textContent = prize.name;
  document.getElementById('result-desc').textContent = prize.desc;

  // 绘制大图
  const canvas = document.getElementById('canvas-prize');
  canvas.width = 180;
  canvas.height = 180;
  drawPrizeLarge(canvas, prizeIdx);

  // 粒子
  Audio8bit.win();
  setTimeout(() => {
    const colors = ['#ffd700', '#ff6600', prize.color, '#ffffff', '#ff44aa'];
    Renderer.burst(window.innerWidth / 2, window.innerHeight / 2, colors, 150);
  }, 300);

  // 按钮
  const data = Storage.get();
  const gamesLeft = MAX_GAMES - data.gamesPlayed;
  const btnNext = document.getElementById('btn-result-next');
  if (gamesLeft > 0) {
    btnNext.textContent = '继续游戏';
    btnNext.onclick = () => { Audio8bit.click(); Renderer.stopParticles(); startGame(); };
  } else {
    btnNext.textContent = '查看全部奖品';
    btnNext.onclick = () => { Audio8bit.click(); Renderer.stopParticles(); showReviewPage(); };
  }

  showPage('result');
}

/* ===== 回顾页 ===== */
function showReviewPage() {
  const data = Storage.get();
  const list = document.getElementById('review-list');
  list.innerHTML = '';

  if (data.lotteryResults.length === 0) {
    list.innerHTML = '<div style="color:var(--text-dim);font-size:13px;text-align:center;">还没有抽奖记录</div>';
  } else {
    data.lotteryResults.forEach((r, i) => {
      const prize = PRIZES[r.prizeIndex];
      if (!prize) return;

      const item = document.createElement('div');
      item.className = 'review-item';

      const thumbCanvas = document.createElement('canvas');
      thumbCanvas.width = 36;
      thumbCanvas.height = 36;
      thumbCanvas.className = 'review-item-icon';
      drawPrizeThumbnail(thumbCanvas, r.prizeIndex);

      item.innerHTML = `
        <div class="review-item-num">第${i + 1}次<br><span style="font-size:11px;color:var(--text-dim)">${r.score}分</span></div>
      `;
      item.appendChild(thumbCanvas);
      item.insertAdjacentHTML('beforeend', `<div class="review-item-name">${prize.name}</div>`);
      list.appendChild(item);
    });
  }

  showPage('review');
}

/* ===== 静音按钮 ===== */
function initMuteBtn() {
  const btn = document.getElementById('btn-mute');
  btn.addEventListener('click', () => {
    const muted = Audio8bit.toggleMute();
    btn.textContent = muted ? '🔇' : '🔊';
  });
}

/* ===== 暂停按钮 ===== */
function initPauseBtn() {
  const btn = document.getElementById('btn-pause');
  btn.addEventListener('click', () => {
    if (state.currentPage !== 'game') return;
    Audio8bit.click();
    const nowPaused = Game.togglePause();
    btn.textContent = nowPaused ? '▶' : '⏸';
    btn.style.borderColor = nowPaused ? '#00ffff' : 'var(--text-dim)';
    btn.style.color       = nowPaused ? '#00ffff' : 'var(--text-dim)';
  });
}

/* ===== 游戏开始时重置暂停按钮状态 ===== */
function resetPauseBtn() {
  const btn = document.getElementById('btn-pause');
  btn.textContent = '⏸';
  btn.style.borderColor = 'var(--text-dim)';
  btn.style.color       = 'var(--text-dim)';
}

/* ===== 窗口大小变化 ===== */
window.addEventListener('resize', () => {
  if (state.currentPage === 'game') Game.resizeCanvas();
  const pc = document.getElementById('canvas-particles');
  pc.width = window.innerWidth;
  pc.height = window.innerHeight;
});

/* ===== 初始化 ===== */
document.addEventListener('DOMContentLoaded', () => {
  // 粒子canvas
  const pc = document.getElementById('canvas-particles');
  pc.width = window.innerWidth;
  pc.height = window.innerHeight;
  Renderer.initParticles(pc);

  // 游戏canvas
  Game.init(document.getElementById('canvas-game'), {
    onScoreUpdate,
    onDie,
    onUnlock61,
  });

  initMuteBtn();
  initPauseBtn();
  initStartPage();
  showPage('start');

  // 解锁AudioContext
  document.addEventListener('touchstart', () => Audio8bit.unlock(), { once: true });
  document.addEventListener('click', () => Audio8bit.unlock(), { once: true });
});
