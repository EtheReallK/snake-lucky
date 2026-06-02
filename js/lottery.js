/* ===== 盲盒抽奖逻辑 ===== */
const Lottery = (() => {
  let shuffledPrizes = [];
  let selectedPrize = null;
  let onResult = null;

  function prepare(callback) {
    onResult = callback;
    selectedPrize = null;

    const data = Storage.get();
    const wonIndices = new Set(data.lotteryResults.map(r => r.prizeIndex));
    const isLastRound = data.gamesPlayed === MAX_GAMES; // 第4次（increment后已是MAX_GAMES）

    let layout;

    if (isLastRound) {
      // ── 第4次：检查保底 ──
      const aWon = POOL_A.some(id => wonIndices.has(id));
      const bWon = POOL_B.some(id => wonIndices.has(id));

      if (!aWon || !bWon) {
        // 需要保底，重新生成布局
        const missedPool = !aWon ? POOL_A : POOL_B;
        layout = buildGuaranteedLayout(wonIndices, missedPool);
      } else {
        // A、B 都已有，正常布局
        layout = buildNormalLayout(wonIndices);
      }
      Storage.saveLayout(layout);
    } else {
      // ── 非最后一次：复用已有布局或新生成 ──
      if (data.lotteryLayout && data.lotteryLayout.length === 9) {
        layout = data.lotteryLayout;
      } else {
        layout = buildNormalLayout(wonIndices);
        Storage.saveLayout(layout);
      }
    }

    shuffledPrizes = layout;
    renderBoxes(wonIndices);
  }

  /* 普通布局：Fisher-Yates 洗牌，已抽中的保持原位 */
  function buildNormalLayout(wonIndices) {
    return shufflePrizes();
  }

  /* 保底布局：已抽中的奖品原位保留，其余格子全填 missedPool（可重复）*/
  function buildGuaranteedLayout(wonIndices, missedPool) {
    const data = Storage.get();
    const prevLayout = data.lotteryLayout;

    // 先确定已抽中奖品要占哪些格子
    // 有上一次布局：按原位放已抽中的奖品
    // 没有布局：把已抽中的奖品随机分配到前几格
    const layout = new Array(9).fill(null);

    if (prevLayout && prevLayout.length === 9) {
      // 已有布局：已抽中的格子保持原位
      for (let i = 0; i < 9; i++) {
        if (wonIndices.has(prevLayout[i])) {
          layout[i] = prevLayout[i];
        }
      }
    } else {
      // 没有布局：把已抽中的奖品依次放到前几个格子
      let pos = 0;
      for (const idx of wonIndices) {
        if (pos < 9) layout[pos++] = idx;
      }
    }

    // 剩余空格全填 missedPool（可重复）
    for (let i = 0; i < 9; i++) {
      if (layout[i] === null) {
        layout[i] = missedPool[Math.floor(Math.random() * missedPool.length)];
      }
    }
    return layout;
  }

  function renderBoxes(wonIndices) {
    const grid = document.querySelector('.boxes-grid');
    grid.innerHTML = '';

    shuffledPrizes.forEach((prizeIdx, boxPos) => {
      const alreadyWon = wonIndices.has(prizeIdx);

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

      if (alreadyWon) {
        drawPrizeThumbnail(thumbCanvas, prizeIdx);
        setTimeout(() => {
          item.classList.add('flipped', 'dimmed');
        }, boxPos * 60);
      } else {
        front.addEventListener('mouseenter', () => {
          if (!item.classList.contains('dimmed')) Audio8bit.hover();
        });
        item.addEventListener('click', () => selectBox(item, prizeIdx, thumbCanvas));
      }
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
      const cb = onResult;
      onResult = null; // 清除，防止重复触发
      if (cb) cb(prizeIdx);
    }, 900);
  }

  return { prepare };
})();
