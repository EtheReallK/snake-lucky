/* ===== 状态机 & 页面路由 ===== */
const MAX_GAMES = 4;

/* ===== 页面切换 ===== */
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
}

/* ===== 工具 ===== */
function updateChanceDots(container, gamesPlayed) {
  const dots = container.querySelectorAll('.chance-dot');
  dots.forEach((d, i) => {
    d.classList.toggle('used', i < gamesPlayed);
  });
}

/* ===== 抽盲盒入口 ===== */
let _lotteryLock = false; // 防重入锁

function startLottery() {
  if (_lotteryLock) return;

  const data = Storage.get();

  // 次数用完
  if (data.gamesPlayed >= MAX_GAMES) {
    showDonePage();
    return;
  }

  _lotteryLock = true;
  const gameIndex = data.gamesPlayed; // 记录当前局序号（0-based）

  // 更新机会圆点
  updateChanceDots(document.getElementById('lottery-chances'), gameIndex);

  Storage.incrementGames();

  showPage('lottery');
  Lottery.prepare((prizeIdx) => {
    _lotteryLock = false; // 抽完解锁
    Storage.recordLottery(gameIndex, 0, prizeIdx);
    showResultPage(prizeIdx);
  });
}

/* ===== 结果页 ===== */
function showResultPage(prizeIdx) {
  const prize = PRIZES[prizeIdx];
  document.getElementById('result-title').textContent = '🎊 恭喜！';
  document.getElementById('result-prize-name').textContent = prize.name;
  document.getElementById('result-desc').textContent = prize.desc;

  const canvas = document.getElementById('canvas-prize');
  canvas.width = 180;
  canvas.height = 180;
  drawPrizeLarge(canvas, prizeIdx);

  Audio8bit.win();
  setTimeout(() => {
    const colors = ['#ffd700', '#ff6600', prize.color, '#ffffff', '#ff44aa'];
    Renderer.burst(window.innerWidth / 2, window.innerHeight / 2, colors, 150);
  }, 300);

  const data = Storage.get();
  const gamesLeft = MAX_GAMES - data.gamesPlayed;
  const hasFixed = data.lotteryResults.some(r => r.prizeIndex === 0);
  const allDone = gamesLeft === 0;
  const triggerSurprise = allDone && !hasFixed;

  const btnNext = document.getElementById('btn-result-next');
  const btnReview = document.getElementById('btn-result-review');
  btnReview.style.display = 'none';
  btnNext.className = 'btn';

  if (gamesLeft > 0) {
    btnNext.textContent = '继续抽奖';
    btnNext.onclick = () => { Audio8bit.click(); Renderer.stopParticles(); startLottery(); };
  } else if (triggerSurprise) {
    btnNext.textContent = '🎊 领取特别惊喜！';
    btnNext.className = 'btn btn-gold';
    btnNext.onclick = () => { Audio8bit.click(); Renderer.stopParticles(); showSurprisePage(); };
    btnReview.style.display = '';
    btnReview.onclick = () => { Audio8bit.click(); Renderer.stopParticles(); showReviewPage(); };
  } else {
    btnNext.textContent = '查看全部奖品';
    btnNext.onclick = () => { Audio8bit.click(); Renderer.stopParticles(); showReviewPage(); };
  }

  showPage('result');
}

/* ===== 惊喜盲盒页 ===== */
function showSurprisePage() {
  const box = document.getElementById('surprise-box');
  const before = document.getElementById('surprise-before');
  const after = document.getElementById('surprise-after');

  box.classList.remove('flipped', 'dimmed');
  before.style.display = 'flex';
  after.style.display = 'none';
  before.querySelectorAll('.lottery-hint').forEach(el => el.style.display = '');

  box.onclick = () => {
    if (box.classList.contains('flipped')) return;
    Audio8bit.flipOpen();

    const thumb = document.getElementById('canvas-surprise-thumb');
    drawPrizeThumbnail(thumb, 0);
    box.classList.add('flipped');

    setTimeout(() => {
      const prize = PRIZES[0];
      document.getElementById('surprise-prize-name').textContent = prize.name;
      document.getElementById('surprise-prize-desc').textContent = prize.desc;
      before.querySelectorAll('.lottery-hint').forEach(el => el.style.display = 'none');
      after.style.display = 'flex';

      document.getElementById('btn-surprise-review').onclick = () => {
        Audio8bit.click();
        Renderer.stopParticles();
        showReviewPage();
      };

      Audio8bit.win();
      setTimeout(() => {
        const colors = ['#4488ff', '#88aaff', '#ffffff', '#aaccff', '#ffd700'];
        Renderer.burst(window.innerWidth / 2, window.innerHeight / 2, colors, 200);
      }, 100);
    }, 700);
  };

  showPage('surprise');
}

/* ===== 次数用完页 ===== */
function showDonePage() {
  Storage.clearLayout(); // 4次全结束，清除布局
  const data = Storage.get();
  const hasFixed = data.lotteryResults.some(r => r.prizeIndex === 0);

  if (!hasFixed) {
    // 未抽中固定奖品 → 惊喜
    showSurprisePage();
    return;
  }

  document.getElementById('btn-done-review').onclick = () => {
    Audio8bit.click();
    showReviewPage();
  };
  showPage('done');
}

/* ===== 回顾页 ===== */
function showReviewPage() {
  const data = Storage.get();
  const wonList    = document.getElementById('review-list-won');
  const missedList = document.getElementById('review-list-missed');
  wonList.innerHTML = '';
  missedList.innerHTML = '';

  const wonIndices = new Set(data.lotteryResults.map(r => r.prizeIndex));
  const hasFixed = wonIndices.has(0);
  const allDone = data.gamesPlayed >= MAX_GAMES;
  const gotSurprise = allDone && !hasFixed;
  if (gotSurprise) wonIndices.add(0);

  if (wonIndices.size === 0) {
    wonList.innerHTML = '<div style="color:var(--text-dim);font-size:13px;text-align:center;">还没有抽奖记录</div>';
  } else {
    data.lotteryResults.forEach((r, i) => {
      const prize = PRIZES[r.prizeIndex];
      if (!prize) return;
      wonList.appendChild(makeReviewItem(prize, r.prizeIndex, `第${i+1}次`, false));
    });
    if (gotSurprise) {
      wonList.appendChild(makeReviewItem(PRIZES[0], 0, '🎊惊喜', true));
    }
  }

  const missed = PRIZES.filter((_, i) => !wonIndices.has(i));
  if (missed.length === 0) {
    missedList.innerHTML = '<div style="color:var(--text-dim);font-size:13px;text-align:center;">全部抽中了！</div>';
  } else {
    missed.forEach(prize => {
      missedList.appendChild(makeReviewItem(prize, prize.id, null, false, true));
    });
  }

  showPage('review');
}

function makeReviewItem(prize, prizeIdx, label, isSurprise, isDimmed = false) {
  const item = document.createElement('div');
  item.className = 'review-item';
  if (isSurprise) { item.style.borderColor = '#4488ff'; item.style.boxShadow = '0 0 8px #4488ff44'; }
  if (isDimmed) item.style.opacity = '0.45';

  const thumbCanvas = document.createElement('canvas');
  thumbCanvas.width = 36; thumbCanvas.height = 36;
  thumbCanvas.className = 'review-item-icon';
  drawPrizeThumbnail(thumbCanvas, prizeIdx);

  const numColor = isSurprise ? '#4488ff' : 'var(--text-dim)';
  const nameColor = isSurprise ? '#88aaff' : (isDimmed ? 'var(--text-dim)' : 'var(--text-white)');

  if (label) {
    item.innerHTML = `<div class="review-item-num" style="color:${numColor}">${label}</div>`;
  } else {
    item.innerHTML = `<div class="review-item-num" style="min-width:36px"></div>`;
  }
  item.appendChild(thumbCanvas);
  item.insertAdjacentHTML('beforeend', `<div class="review-item-name" style="color:${nameColor}">${prize.name}</div>`);
  return item;
}

/* ===== 静音按钮 ===== */
function initMuteBtn() {
  const btn = document.getElementById('btn-mute');
  btn.addEventListener('click', () => {
    const muted = Audio8bit.toggleMute();
    btn.textContent = muted ? '🔇' : '🔊';
  });
}

/* ===== 初始化 ===== */
document.addEventListener('DOMContentLoaded', () => {
  const pc = document.getElementById('canvas-particles');
  pc.width = window.innerWidth;
  pc.height = window.innerHeight;
  Renderer.initParticles(pc);

  window.addEventListener('resize', () => {
    pc.width = window.innerWidth;
    pc.height = window.innerHeight;
  });

  initMuteBtn();

  // 解锁 AudioContext
  document.addEventListener('touchstart', () => Audio8bit.unlock(), { once: true });
  document.addEventListener('click', () => Audio8bit.unlock(), { once: true });

  // 直接进入抽盲盒
  startLottery();
});
