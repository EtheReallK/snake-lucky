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
    const isLastRound = data.gamesPlayed === MAX_GAMES - 1; // 即将进行第4次

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

  /* 保底布局：已翻开格子保持原样，未翻开格子全部填充 missedPool 的奖品（可重复）*/
  function buildGuaranteedLayout(wonIndices, missedPool) {
    const layout = [];
    // 先统计上一次布局已翻开的格子（已抽中的奖品位置）
    const data = Storage.get();
    const prevLayout = data.lotteryLayout;

    for (let i = 0; i < 9; i++) {
      const prevPrize = prevLayout ? prevLayout[i] : null;
      if (prevPrize !== null && wonIndices.has(prevPrize)) {
        // 已翻开：保持原奖品
        layout.push(prevPrize);
      } else {
        // 未翻开：随机从 missedPool 中取一个（可重复）
        layout.push(missedPool[Math.floor(Math.random() * missedPool.length)]);
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
      Storage.clearLayout();
      if (onResult) onResult(prizeIdx);
    }, 900);
  }

  return { prepare };
})();
