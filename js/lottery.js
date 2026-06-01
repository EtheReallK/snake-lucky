/* ===== 盲盒抽奖逻辑 ===== */
const Lottery = (() => {
  let shuffledPrizes = []; // 当前局洗牌后的奖品索引列表
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

      // 前面（问号）
      const inner = document.createElement('div');
      inner.className = 'box-inner';

      const front = document.createElement('div');
      front.className = 'box-front';
      front.innerHTML = `<span class="box-question">?</span><span class="box-star">✦ ✦ ✦</span>`;

      // 背面（缩略图）
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

      // 悬停音效
      front.addEventListener('mouseenter', () => {
        if (!item.classList.contains('dimmed')) Audio8bit.hover();
      });

      // 点击选择
      item.addEventListener('click', () => selectBox(item, prizeIdx, thumbCanvas));
    });
  }

  function selectBox(item, prizeIdx, thumbCanvas) {
    if (selectedPrize !== null) return; // 已选过
    if (item.classList.contains('dimmed')) return;

    selectedPrize = prizeIdx;
    Audio8bit.flipOpen();

    // 绘制缩略图到背面
    drawPrizeThumbnail(thumbCanvas, prizeIdx);

    // 翻转动画
    item.classList.add('flipped');

    // 其余盒子变暗
    setTimeout(() => {
      document.querySelectorAll('.box-item').forEach(el => {
        if (el !== item) el.classList.add('dimmed');
      });
    }, 300);

    // 动画结束后跳转
    setTimeout(() => {
      if (onResult) onResult(prizeIdx);
    }, 900);
  }

  return { prepare };
})();
