/* ===== 输入控制：滑动手势 + 键盘 ===== */
const Input = (() => {
  let onDir = null; // 回调 (dx, dy)
  let touchStartX = 0, touchStartY = 0;
  let lastDir = { dx: 1, dy: 0 };
  const MIN_SWIPE = 20; // 最小滑动距离(px)

  const keyMap = {
    ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
    w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0],
    W: [0, -1], S: [0, 1], A: [-1, 0], D: [1, 0],
  };

  function setCallback(fn) { onDir = fn; }

  function emit(dx, dy) {
    // 不允许反向
    if (dx === -lastDir.dx && dy === -lastDir.dy) return;
    if (dx === 0 && dy === 0) return;
    lastDir = { dx, dy };
    if (onDir) onDir(dx, dy);
  }

  function onKeyDown(e) {
    if (e.key === ' ' || e.key === 'Escape') {
      e.preventDefault();
      // 触发暂停按钮点击（保持逻辑统一）
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
