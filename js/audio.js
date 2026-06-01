/* ===== Web Audio API 8-bit 音效合成 ===== */
const Audio8bit = (() => {
  let ctx = null;
  let muted = false;

  function getCtx() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
    }
    return ctx;
  }

  // 解锁 AudioContext（iOS需要用户手势触发）
  function unlock() { getCtx(); }

  /* 基础音调生成 */
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

  /* 下行扫频噪声 */
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

  /* ============ 各场景音效 ============ */

  // 吃食物：清脆叮
  function eat() {
    playTone(880, 'square', 0.08, 0.25);
    playTone(1320, 'square', 0.06, 0.15, 0.05);
  }

  // 达到61分解锁：上升音阶
  function unlock61() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((f, i) => playTone(f, 'square', 0.1, 0.2, i * 0.1));
  }

  // 游戏结束（死亡）：下降音调
  function die() {
    playTone(440, 'sawtooth', 0.1, 0.3);
    playTone(330, 'sawtooth', 0.1, 0.3, 0.1);
    playTone(220, 'sawtooth', 0.15, 0.3, 0.2);
    playNoise(0.15, 0.1);
  }

  // 盲盒悬停：轻微滴
  function hover() {
    playTone(660, 'sine', 0.04, 0.1);
  }

  // 盲盒翻开：翻转期待感
  function flipOpen() {
    const notes = [330, 440, 550, 660];
    notes.forEach((f, i) => playTone(f, 'square', 0.08, 0.18, i * 0.07));
    // 鼓点
    playNoise(0.05, 0.15);
    playNoise(0.05, 0.12);
  }

  // 中奖揭晓：欢快上升
  function win() {
    const melody = [523, 659, 784, 1047, 1319];
    melody.forEach((f, i) => {
      playTone(f, 'square', 0.12, 0.25, i * 0.09);
      playTone(f * 2, 'sine', 0.06, 0.1, i * 0.09 + 0.03);
    });
  }

  // 按钮点击
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
