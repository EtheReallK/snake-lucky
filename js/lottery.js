/* ===== 盲盒抽奖逻辑 ===== */
const Lottery = (() => {
  let shuffledPrizes = []; // 当前9格布局（奖品索引数组）
  let selectedPrize = null;
  let onResult = null;

  function prepare(callback) {
    onResult = callback;
    selectedPrize = null;

    const data = Storage.get();
    const wonIndices = new Set(data.lotteryResults.map(r => r.prizeIndex));

    // 若已有持久化布局则复用，否则重新洗牌并保存
    if (data.lotteryLayout && data.lotteryLayout.length === 9) {
      shuffledPrizes = data.lotteryLayout;
    } else {
      shuffledPrizes = shufflePrizes();
      Storage.saveLayout(shuffledPrizes);
    }

    renderBoxes(wonIndices);
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
        // 已抽中：直接翻开显示，不可点击
        drawPrizeThumbnail(thumbCanvas, prizeIdx);
        // 用 setTimeout 0 让 DOM 先渲染再加 flipped，触发动画
        setTimeout(() => {
          item.classList.add('flipped');
          item.classList.add('dimmed');
        }, boxPos * 60); // 错开时间，逐个翻开更好看
      } else {
        // 未抽中：正常可点击
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

    // 其余未抽中的盒子变暗
    setTimeout(() => {
      document.querySelectorAll('.box-item').forEach(el => {
        if (el !== item) el.classList.add('dimmed');
      });
    }, 300);

    // 跳转结果页，同时清除布局缓存（下次重新洗牌）
    setTimeout(() => {
      Storage.clearLayout();
      if (onResult) onResult(prizeIdx);
    }, 900);
  }

  return { prepare };
})();
