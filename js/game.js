/* ===== 贪吃蛇核心逻辑 ===== */
const Game = (() => {
  const COLS = 20, ROWS = 28;
  let canvas, ctx;
  let snake, dir, nextDir, food, score, best;
  let running = false, paused = false, gameLoop = null;
  let unlocked61 = false;
  let speed = 130; // ms/帧
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
      { x: 9,  y: 14 },
      { x: 8,  y: 14 },
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
    if (!running && !paused) return false; // 游戏未开始，忽略
    if (paused) {
      // 恢复
      paused = false;
      running = true;
      gameLoop = setInterval(tick, speed);
      Renderer.hidePauseOverlay(canvas);
    } else {
      // 暂停
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
    // 穿墙：从另一边出现
    const head = {
      x: ((snake[0].x + dir.dx) % COLS + COLS) % COLS,
      y: ((snake[0].y + dir.dy) % ROWS + ROWS) % ROWS,
    };

    // 碰自身
    if (snake.some(s => s.x === head.x && s.y === head.y)) {
      handleDie(); return;
    }

    snake.unshift(head);

    // 吃食物
    if (head.x === food.x && head.y === food.y) {
      score += 10;
      eatCount++;
      Audio8bit.eat();
      if (onScoreUpdate) onScoreUpdate(score);
      // 每吃5个加速
      if (eatCount % 5 === 0 && speed > 70) {
        setSpeed(Math.max(70, speed - 10));
      }
      // 达到61分：直接结束游戏，触发抽奖
      if (!unlocked61 && score >= 61) {
        unlocked61 = true;
        Audio8bit.unlock61();
        if (onUnlock61) onUnlock61();
        Renderer.drawFrame(canvas, snake, food, score, best, COLS, ROWS);
        handleWin(); return;
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
    if (onDie) onDie(score, false); // 撞死 = 未解锁
  }

  function handleWin() {
    stop();
    Storage.updateBest(score);
    if (onDie) onDie(score, true); // 达到61分 = 解锁
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
