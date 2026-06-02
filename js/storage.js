/* ===== localStorage 存档管理 ===== */
const STORAGE_KEY = 'snakeLucky_v1';

const Storage = (() => {
  const defaults = {
    gamesPlayed: 0,       // 已玩次数
    bestScore: 0,         // 历史最高分
    lotteryResults: [],   // [{game, score, prizeIndex}]
    lotteryUsed: [false, false, false, false], // 各次是否已抽（4次）
    lotteryLayout: null,  // 当前抽奖的9格布局 [prizeIdx, ...]，跨局持久化
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
    } catch (e) { /* ignore */ }
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

  function saveLayout(layout) {
    const d = load();
    d.lotteryLayout = layout;
    save(d);
  }

  function clearLayout() {
    const d = load();
    d.lotteryLayout = null;
    save(d);
  }

  function reset() {
    save({ ...defaults });
  }

  return { get, incrementGames, updateBest, recordLottery, markLotteryUsed, saveLayout, clearLayout, reset };
})();
