const STORAGE_KEY = 'snakeLucky_v1';
const Storage = (() => {
 const defaults = {
 gamesPlayed: 0, 
 bestScore: 0, 
 lotteryResults: [], 
 lotteryUsed: [false, false, false], 
 };
 function load() {
 try {
 const raw = localStorage.getItem(STORAGE_KEY);
 if (!raw) return { ...defaults };
 return { ...defaults, ...JSON.parse(raw) };
 } catch (e) {
 return { ...defaults };
 }
 }
 function save(data) {
 try {
 localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
 } catch (e) { }
 }
 function get() { return load(); }
 function incrementGames() {
 const d = load();
 d.gamesPlayed = Math.min(d.gamesPlayed + 1, 3);
 save(d);
 return d;
 }
 function updateBest(score) {
 const d = load();
 if (score > d.bestScore) {
 d.bestScore = score;
 save(d);
 }
 return d.bestScore;
 }
 function recordLottery(gameIndex, score, prizeIndex) {
 const d = load();
 d.lotteryResults.push({ game: gameIndex, score, prizeIndex });
 if (d.lotteryUsed[gameIndex] !== undefined) {
 d.lotteryUsed[gameIndex] = true;
 }
 save(d);
 }
 function markLotteryUsed(gameIndex) {
 const d = load();
 if (d.lotteryUsed[gameIndex] !== undefined) {
 d.lotteryUsed[gameIndex] = true;
 }
 save(d);
 }
 function reset() {
 save({ ...defaults });
 }
 return { get, incrementGames, updateBest, recordLottery, markLotteryUsed, reset };
})();
const Audio8bit = (() => {
 let ctx = null;
 let muted = false;
 function getCtx() {
 if (!ctx) {
 try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
 }
 return ctx;
 }
 function unlock() { getCtx(); }
 function playTone(freq, type, duration, volume = 0.3, startTime = 0) {
 const ac = getCtx();
 if (!ac || muted) return;
 const t = ac.currentTime + startTime;
 const osc = ac.createOscillator();
 const gain = ac.createGain();
 osc.connect(gain);
 gain.connect(ac.destination);
 osc.type = type;
 osc.frequency.setValueAtTime(freq, t);
 gain.gain.setValueAtTime(volume, t);
 gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
 osc.start(t);
 osc.stop(t + duration + 0.01);
 }
 function playNoise(duration, volume = 0.2) {
 const ac = getCtx();
 if (!ac || muted) return;
 const bufferSize = ac.sampleRate * duration;
 const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
 const data = buffer.getChannelData(0);
 for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
 const source = ac.createBufferSource();
 source.buffer = buffer;
 const gain = ac.createGain();
 gain.gain.setValueAtTime(volume, ac.currentTime);
 gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
 source.connect(gain);
 gain.connect(ac.destination);
 source.start();
 source.stop(ac.currentTime + duration);
 }
 function eat() {
 playTone(880, 'square', 0.08, 0.25);
 playTone(1320, 'square', 0.06, 0.15, 0.05);
 }
 function unlock61() {
 const notes = [523, 659, 784, 1047];
 notes.forEach((f, i) => playTone(f, 'square', 0.1, 0.2, i * 0.1));
 }
 function die() {
 playTone(440, 'sawtooth', 0.1, 0.3);
 playTone(330, 'sawtooth', 0.1, 0.3, 0.1);
 playTone(220, 'sawtooth', 0.15, 0.3, 0.2);
 playNoise(0.15, 0.1);
 }
 function hover() {
 playTone(660, 'sine', 0.04, 0.1);
 }
 function flipOpen() {
 const notes = [330, 440, 550, 660];
 notes.forEach((f, i) => playTone(f, 'square', 0.08, 0.18, i * 0.07));
 playNoise(0.05, 0.15);
 playNoise(0.05, 0.12);
 }
 function win() {
 const melody = [523, 659, 784, 1047, 1319];
 melody.forEach((f, i) => {
 playTone(f, 'square', 0.12, 0.25, i * 0.09);
 playTone(f * 2, 'sine', 0.06, 0.1, i * 0.09 + 0.03);
 });
 }
 function click() {
 playTone(440, 'square', 0.05, 0.15);
 }
 function toggleMute() {
 muted = !muted;
 return muted;
 }
 function isMuted() { return muted; }
 return { unlock, eat, unlock61, die, hover, flipOpen, win, click, toggleMute, isMuted };
})();
const Input = (() => {
 let onDir = null; 
 let touchStartX = 0, touchStartY = 0;
 let lastDir = { dx: 1, dy: 0 };
 const MIN_SWIPE = 20; 
 const keyMap = {
 ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
 w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0],
 W: [0, -1], S: [0, 1], A: [-1, 0], D: [1, 0],
 };
 function setCallback(fn) { onDir = fn; }
 function emit(dx, dy) {
 if (dx === -lastDir.dx && dy === -lastDir.dy) return;
 if (dx === 0 && dy === 0) return;
 lastDir = { dx, dy };
 if (onDir) onDir(dx, dy);
 }
 function onKeyDown(e) {
 if (e.key === ' ' || e.key === 'Escape') {
 e.preventDefault();
 document.getElementById('btn-pause')?.click();
 return;
 }
 const dir = keyMap[e.key];
 if (dir) {
 e.preventDefault();
 emit(dir[0], dir[1]);
 }
 }
 function onTouchStart(e) {
 const t = e.touches[0];
 touchStartX = t.clientX;
 touchStartY = t.clientY;
 }
 function onTouchEnd(e) {
 const t = e.changedTouches[0];
 const dx = t.clientX - touchStartX;
 const dy = t.clientY - touchStartY;
 const absDx = Math.abs(dx), absDy = Math.abs(dy);
 if (Math.max(absDx, absDy) < MIN_SWIPE) return;
 if (absDx > absDy) emit(dx > 0 ? 1 : -1, 0);
 else emit(0, dy > 0 ? 1 : -1);
 }
 function enable() {
 document.addEventListener('keydown', onKeyDown);
 document.addEventListener('touchstart', onTouchStart, { passive: true });
 document.addEventListener('touchend', onTouchEnd, { passive: true });
 }
 function disable() {
 document.removeEventListener('keydown', onKeyDown);
 document.removeEventListener('touchstart', onTouchStart);
 document.removeEventListener('touchend', onTouchEnd);
 }
 function reset() { lastDir = { dx: 1, dy: 0 }; }
 return { setCallback, enable, disable, reset };
})();
const Renderer = (() => {
 const GRID_COLOR = '#1a1a2e';
 const BG_COLOR = '#0a0a0f';
 const SNAKE_HEAD = '#00ffff';
 const SNAKE_BODY = '#00cccc';
 const FOOD_COLOR = '#ff6600';
 function drawFrame(canvas, snake, food, score, best, cols, rows) {
 const ctx = canvas.getContext('2d');
 const W = canvas.width, H = canvas.height;
 const cs = W / cols; 
 ctx.fillStyle = BG_COLOR;
 ctx.fillRect(0, 0, W, H);
 ctx.strokeStyle = GRID_COLOR;
 ctx.lineWidth = 0.5;
 for (let x = 0; x <= cols; x++) {
 ctx.beginPath(); ctx.moveTo(x * cs, 0); ctx.lineTo(x * cs, H); ctx.stroke();
 }
 for (let y = 0; y <= rows; y++) {
 ctx.beginPath(); ctx.moveTo(0, y * cs); ctx.lineTo(W, y * cs); ctx.stroke();
 }
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
 ctx.beginPath();
 ctx.arc(fx - fr * 0.3, fy - fr * 0.3, fr * 0.25, 0, Math.PI * 2);
 ctx.fillStyle = 'rgba(255,200,100,0.6)';
 ctx.shadowBlur = 0;
 ctx.fill();
 ctx.restore();
 }
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
 function showPauseOverlay(canvas) {
 const ctx = canvas.getContext('2d');
 const W = canvas.width, H = canvas.height;
 ctx.save();
 ctx.fillStyle = 'rgba(10,10,15,0.72)';
 ctx.fillRect(0, 0, W, H);
 ctx.font = `bold ${W * 0.1}px 'Courier New', monospace`;
 ctx.textAlign = 'center';
 ctx.textBaseline = 'middle';
 ctx.fillStyle = '#00ffff';
 ctx.shadowColor = '#00ffff';
 ctx.shadowBlur = 18;
 ctx.fillText('PAUSED', W / 2, H / 2 - W * 0.06);
 ctx.font = `${W * 0.05}px 'Courier New', monospace`;
 ctx.fillStyle = '#007777';
 ctx.shadowBlur = 0;
 ctx.fillText('点击 ⏸ 继续游戏', W / 2, H / 2 + W * 0.06);
 ctx.restore();
 }
 function hidePauseOverlay(canvas) {
 }
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
 p.vy += 0.15; 
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
const Game = (() => {
 const COLS = 20, ROWS = 28;
 let canvas, ctx;
 let snake, dir, nextDir, food, score, best;
 let running = false, paused = false, gameLoop = null;
 let unlocked61 = false;
 let speed = 130; 
 let eatCount = 0;
 let onScoreUpdate = null;
 let onDie = null;
 let onUnlock61 = null;
 function init(canvasEl, callbacks = {}) {
 canvas = canvasEl;
 ctx = canvas.getContext('2d');
 onScoreUpdate = callbacks.onScoreUpdate || null;
 onDie = callbacks.onDie || null;
 onUnlock61 = callbacks.onUnlock61 || null;
 resizeCanvas();
 }
 function resizeCanvas() {
 const parent = canvas.parentElement;
 const maxW = Math.min(parent.clientWidth, 390);
 const cellSize = Math.floor(maxW / COLS);
 canvas.width = cellSize * COLS;
 canvas.height = cellSize * ROWS;
 }
 function getCellSize() { return canvas.width / COLS; }
 function start(bestScore) {
 best = bestScore || 0;
 score = 0;
 unlocked61 = false;
 eatCount = 0;
 speed = 130;
 snake = [
 { x: 10, y: 14 },
 { x: 9, y: 14 },
 { x: 8, y: 14 },
 ];
 dir = { dx: 1, dy: 0 };
 nextDir = { dx: 1, dy: 0 };
 spawnFood();
 running = true;
 Input.reset();
 Input.setCallback((dx, dy) => { nextDir = { dx, dy }; });
 Input.enable();
 if (gameLoop) clearInterval(gameLoop);
 gameLoop = setInterval(tick, speed);
 Renderer.drawFrame(canvas, snake, food, score, best, COLS, ROWS);
 }
 function stop() {
 running = false;
 paused = false;
 if (gameLoop) { clearInterval(gameLoop); gameLoop = null; }
 Input.disable();
 }
 function togglePause() {
 if (!running && !paused) return false; 
 if (paused) {
 paused = false;
 running = true;
 gameLoop = setInterval(tick, speed);
 Renderer.hidePauseOverlay(canvas);
 } else {
 paused = true;
 running = false;
 if (gameLoop) { clearInterval(gameLoop); gameLoop = null; }
 Renderer.showPauseOverlay(canvas);
 }
 return paused;
 }
 function isPaused() { return paused; }
 function setSpeed(ms) {
 speed = ms;
 if (gameLoop) {
 clearInterval(gameLoop);
 gameLoop = setInterval(tick, speed);
 }
 }
 function tick() {
 if (!running) return;
 dir = { ...nextDir };
 const head = {
 x: ((snake[0].x + dir.dx) % COLS + COLS) % COLS,
 y: ((snake[0].y + dir.dy) % ROWS + ROWS) % ROWS,
 };
 if (snake.some(s => s.x === head.x && s.y === head.y)) {
 handleDie(); return;
 }
 snake.unshift(head);
 if (head.x === food.x && head.y === food.y) {
 score += 10;
 eatCount++;
 Audio8bit.eat();
 if (onScoreUpdate) onScoreUpdate(score);
 if (eatCount % 5 === 0 && speed > 70) {
 setSpeed(Math.max(70, speed - 10));
 }
 if (!unlocked61 && score >= 61) {
 unlocked61 = true;
 Audio8bit.unlock61();
 if (onUnlock61) onUnlock61();
 }
 spawnFood();
 } else {
 snake.pop();
 }
 Renderer.drawFrame(canvas, snake, food, score, best, COLS, ROWS);
 }
 function handleDie() {
 stop();
 Audio8bit.die();
 Storage.updateBest(score);
 if (onDie) onDie(score, unlocked61);
 }
 function spawnFood() {
 const empty = [];
 for (let x = 0; x < COLS; x++) {
 for (let y = 0; y < ROWS; y++) {
 if (!snake.some(s => s.x === x && s.y === y)) {
 empty.push({ x, y });
 }
 }
 }
 food = empty[Math.floor(Math.random() * empty.length)];
 }
 return { init, start, stop, togglePause, isPaused, resizeCanvas };
})();
const Lottery = (() => {
 let shuffledPrizes = []; 
 let selectedPrize = null;
 let onResult = null;
 function prepare(callback) {
 shuffledPrizes = shufflePrizes();
 selectedPrize = null;
 onResult = callback;
 renderBoxes();
 }
 function renderBoxes() {
 const grid = document.querySelector('.boxes-grid');
 grid.innerHTML = '';
 shuffledPrizes.forEach((prizeIdx, boxPos) => {
 const item = document.createElement('div');
 item.className = 'box-item';
 item.dataset.pos = boxPos;
 item.dataset.prize = prizeIdx;
 const inner = document.createElement('div');
 inner.className = 'box-inner';
 const front = document.createElement('div');
 front.className = 'box-front';
 front.innerHTML = `<span class="box-question">?</span><span class="box-star">✦ ✦ ✦</span>`;
 const back = document.createElement('div');
 back.className = 'box-back';
 const thumbCanvas = document.createElement('canvas');
 thumbCanvas.width = 70;
 thumbCanvas.height = 70;
 back.appendChild(thumbCanvas);
 inner.appendChild(front);
 inner.appendChild(back);
 item.appendChild(inner);
 grid.appendChild(item);
 front.addEventListener('mouseenter', () => {
 if (!item.classList.contains('dimmed')) Audio8bit.hover();
 });
 item.addEventListener('click', () => selectBox(item, prizeIdx, thumbCanvas));
 });
 }
 function selectBox(item, prizeIdx, thumbCanvas) {
 if (selectedPrize !== null) return; 
 if (item.classList.contains('dimmed')) return;
 selectedPrize = prizeIdx;
 Audio8bit.flipOpen();
 drawPrizeThumbnail(thumbCanvas, prizeIdx);
 item.classList.add('flipped');
 setTimeout(() => {
 document.querySelectorAll('.box-item').forEach(el => {
 if (el !== item) el.classList.add('dimmed');
 });
 }, 300);
 setTimeout(() => {
 if (onResult) onResult(prizeIdx);
 }, 900);
 }
 return { prepare };
})();
const MAX_GAMES = 3;
const UNLOCK_SCORE = 61;
let state = {
 currentPage: 'start',
 gameIndex: 0, 
 currentScore: 0,
 currentUnlocked: false,
};
function showPage(id) {
 document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
 document.getElementById('page-' + id).classList.add('active');
 state.currentPage = id;
}
function formatScore(n) { return String(n).padStart(4, '0'); }
function updateChanceDots(container, gamesPlayed) {
 const dots = container.querySelectorAll('.chance-dot');
 dots.forEach((d, i) => {
 d.classList.toggle('used', i < gamesPlayed);
 });
}
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
function startGame() {
 const data = Storage.get();
 state.gameIndex = data.gamesPlayed; 
 state.currentScore = 0;
 state.currentUnlocked = false;
 updateChanceDots(document.getElementById('game-chances'), data.gamesPlayed);
 document.getElementById('game-score').textContent = 'SCORE: ' + formatScore(0);
 document.getElementById('game-best').textContent = 'BEST: ' + formatScore(data.bestScore);
 showPage('game');
 resetPauseBtn();
 Renderer.stopParticles();
 requestAnimationFrame(() => {
 Game.resizeCanvas();
 Game.start(data.bestScore);
 });
}
function onScoreUpdate(score) {
 state.currentScore = score;
 document.getElementById('game-score').textContent = 'SCORE: ' + formatScore(score);
}
function onUnlock61() {
 state.currentUnlocked = true;
 const banner = document.getElementById('unlock-banner');
 banner.classList.remove('show');
 void banner.offsetWidth; 
 banner.classList.add('show');
}
function onDie(score, unlocked) {
 Storage.incrementGames();
 Storage.updateBest(score);
 showDeadPage(score, unlocked);
}
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
 Storage.recordLottery(state.gameIndex, score, -1); 
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
 if (gamesLeft > 0) {
 btnRetry.textContent = '再玩一次';
 btnRetry.onclick = () => { Audio8bit.click(); startGame(); };
 } else {
 btnRetry.textContent = '查看全部结果';
 btnRetry.onclick = () => { Audio8bit.click(); showReviewPage(); };
 }
 if (unlocked) {
 setTimeout(() => {
 const colors = ['#ffd700', '#ff6600', '#00ffff', '#ff44aa', '#44ff88'];
 const cx = window.innerWidth / 2, cy = window.innerHeight / 3;
 Renderer.burst(cx, cy, colors, 120);
 }, 200);
 }
 showPage('dead');
}
function showLotteryPage(score) {
 showPage('lottery');
 Lottery.prepare((prizeIdx) => {
 const data = Storage.get();
 const lastResult = data.lotteryResults[data.lotteryResults.length - 1];
 if (lastResult) lastResult.prizeIndex = prizeIdx;
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
function showResultPage(prizeIdx) {
 const prize = PRIZES[prizeIdx];
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
function initMuteBtn() {
 const btn = document.getElementById('btn-mute');
 btn.addEventListener('click', () => {
 const muted = Audio8bit.toggleMute();
 btn.textContent = muted ? '🔇' : '🔊';
 });
}
function initPauseBtn() {
 const btn = document.getElementById('btn-pause');
 btn.addEventListener('click', () => {
 if (state.currentPage !== 'game') return;
 Audio8bit.click();
 const nowPaused = Game.togglePause();
 btn.textContent = nowPaused ? '▶' : '⏸';
 btn.style.borderColor = nowPaused ? '#00ffff' : 'var(--text-dim)';
 btn.style.color = nowPaused ? '#00ffff' : 'var(--text-dim)';
 });
}
function resetPauseBtn() {
 const btn = document.getElementById('btn-pause');
 btn.textContent = '⏸';
 btn.style.borderColor = 'var(--text-dim)';
 btn.style.color = 'var(--text-dim)';
}
window.addEventListener('resize', () => {
 if (state.currentPage === 'game') Game.resizeCanvas();
 const pc = document.getElementById('canvas-particles');
 pc.width = window.innerWidth;
 pc.height = window.innerHeight;
});
document.addEventListener('DOMContentLoaded', () => {
 const pc = document.getElementById('canvas-particles');
 pc.width = window.innerWidth;
 pc.height = window.innerHeight;
 Renderer.initParticles(pc);
 Game.init(document.getElementById('canvas-game'), {
 onScoreUpdate,
 onDie,
 onUnlock61,
 });
 initMuteBtn();
 initPauseBtn();
 initStartPage();
 showPage('start');
 document.addEventListener('touchstart', () => Audio8bit.unlock(), { once: true });
 document.addEventListener('click', () => Audio8bit.unlock(), { once: true });
});