/* ===== 奖品池配置 ===== */

// 池标识：'fixed' | 'A' | 'B'
const PRIZES = [
  // ── 固定奖品（index 0）──
  {
    id: 0, pool: 'fixed',
    name: '无条件配合yy大王拍胶片',
    desc: '你不管，你就配合，很重要！',
    color: '#4488ff',
    draw: drawFirework,
  },
  // ── A 池（index 1-4，给yy的）──
  {
    id: 1, pool: 'A',
    name: '给yy大王亲手做一顿饭',
    desc: '一荤一素一汤一主食',
    color: '#ff44aa',
    draw: drawMeal,
  },
  {
    id: 2, pool: 'A',
    name: '半夜出门请yy大王吃小龙虾',
    desc: '半夜和小龙虾都不是必选',
    color: '#ff6644',
    draw: drawDinner,
  },
  {
    id: 3, pool: 'A',
    name: '脾气和耐心无条件变好一周卡',
    desc: '嗯嗯嗯！',
    color: '#44ff88',
    draw: drawApology,
  },
  {
    id: 4, pool: 'A',
    name: '给yy大王准备一个大惊喜',
    desc: '要这———么大的惊喜',
    color: '#ffdd44',
    draw: drawCake,
  },
  // ── B 池（index 5-8，给ls的）──
  {
    id: 5, pool: 'B',
    name: 'yy大王的一顿饭',
    desc: '亲手做的，餐标待定',
    color: '#ffaa44',
    draw: drawMeal,
  },
  {
    id: 6, pool: 'B',
    name: 'yy大王的一个故事',
    desc: '有进展的时候同步你',
    color: '#ff88cc',
    draw: drawDecisionCard,
  },
  {
    id: 7, pool: 'B',
    name: 'yy大王读一本书',
    desc: '页数希望控制在200页以内',
    color: '#aaeeff',
    draw: drawIceCream,
  },
  {
    id: 8, pool: 'B',
    name: 'yy大王的一句求求你',
    desc: '呵呵',
    color: '#aa44ff',
    draw: drawBusWindow,
  },
];

// 按池分组，方便保底逻辑使用
const POOL_A = PRIZES.filter(p => p.pool === 'A').map(p => p.id); // [1,2,3,4]
const POOL_B = PRIZES.filter(p => p.pool === 'B').map(p => p.id); // [5,6,7,8]

/* ===== 随机洗牌（Fisher-Yates，均等概率） ===== */
function shufflePrizes() {
  const arr = PRIZES.map((_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* ===================================================
   Canvas 图标绘制函数（每个奖品一个）
   参数：ctx, cx, cy, size（图标内切圆半径）
   =================================================== */

// 0 - 胶片相机
function drawFirework(ctx, cx, cy, size) {
  const r = size * 0.85;
  ctx.save();

  // 背景圆
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = '#050a14';
  ctx.fill();

  // 相机机身
  const bw = r * 1.5, bh = r * 1.1;
  const bx = cx - bw / 2, by = cy - bh / 2 + r * 0.08;
  roundRect(ctx, bx, by, bw, bh, r * 0.12);
  const bodyGrad = ctx.createLinearGradient(bx, by, bx, by + bh);
  bodyGrad.addColorStop(0, '#2a3a5a');
  bodyGrad.addColorStop(1, '#151e30');
  ctx.fillStyle = bodyGrad;
  ctx.shadowColor = '#4488ff';
  ctx.shadowBlur = 14;
  ctx.fill();
  roundRect(ctx, bx, by, bw, bh, r * 0.12);
  ctx.strokeStyle = '#4488ff';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // 顶部取景器小凸起
  const vw = bw * 0.3, vh = bh * 0.22;
  roundRect(ctx, cx - vw / 2, by - vh, vw, vh, r * 0.06);
  ctx.fillStyle = '#1e2a40';
  ctx.fill();
  roundRect(ctx, cx - vw / 2, by - vh, vw, vh, r * 0.06);
  ctx.strokeStyle = '#4488ff88';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 镜头外圈
  ctx.beginPath();
  ctx.arc(cx - r * 0.1, cy + r * 0.08, r * 0.38, 0, Math.PI * 2);
  ctx.fillStyle = '#0a1020';
  ctx.shadowColor = '#4488ff';
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.strokeStyle = '#6699ff';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // 镜头中圈
  ctx.beginPath();
  ctx.arc(cx - r * 0.1, cy + r * 0.08, r * 0.26, 0, Math.PI * 2);
  ctx.fillStyle = '#050d1a';
  ctx.fill();
  ctx.strokeStyle = '#4477cc';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 镜头内圈（反光）
  const lensGrad = ctx.createRadialGradient(
    cx - r * 0.18, cy, 0,
    cx - r * 0.1, cy + r * 0.08, r * 0.2
  );
  lensGrad.addColorStop(0, '#3355aa88');
  lensGrad.addColorStop(0.5, '#112244');
  lensGrad.addColorStop(1, '#000000');
  ctx.beginPath();
  ctx.arc(cx - r * 0.1, cy + r * 0.08, r * 0.2, 0, Math.PI * 2);
  ctx.fillStyle = lensGrad;
  ctx.fill();

  // 镜头高光
  ctx.beginPath();
  ctx.arc(cx - r * 0.2, cy, r * 0.07, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(150,180,255,0.35)';
  ctx.fill();

  // 快门按钮（右上）
  ctx.beginPath();
  ctx.arc(bx + bw * 0.82, by + bh * 0.28, r * 0.1, 0, Math.PI * 2);
  ctx.fillStyle = '#4488ff';
  ctx.shadowColor = '#4488ff';
  ctx.shadowBlur = 8;
  ctx.fill();
  ctx.shadowBlur = 0;

  // 闪光灯（左上小方块）
  roundRect(ctx, bx + bw * 0.62, by + bh * 0.14, r * 0.22, r * 0.15, r * 0.04);
  ctx.fillStyle = '#ffeeaa';
  ctx.shadowColor = '#ffeeaa';
  ctx.shadowBlur = 6;
  ctx.fill();
  ctx.shadowBlur = 0;

  // 胶片小孔装饰（左右两侧各两个）
  [bx + r * 0.1, bx + bw - r * 0.1].forEach(px => {
    [-0.25, 0.25].forEach(dy => {
      ctx.beginPath();
      ctx.arc(px, cy + r * dy, r * 0.06, 0, Math.PI * 2);
      ctx.fillStyle = '#0a1020';
      ctx.fill();
      ctx.strokeStyle = '#4488ff44';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  });

  ctx.restore();
}

// 1 - 决策卡
function drawDecisionCard(ctx, cx, cy, size) {
  const r = size * 0.85;
  ctx.save();
  // 背景圆
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = '#150a1a';
  ctx.fill();
  // 卡片主体
  const cw = r * 1.1, ch = r * 1.3;
  const cx0 = cx - cw / 2, cy0 = cy - ch / 2;
  roundRect(ctx, cx0, cy0, cw, ch, 6);
  ctx.fillStyle = '#2a0a3a';
  ctx.fill();
  ctx.strokeStyle = '#ff88cc';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#ff88cc';
  ctx.shadowBlur = 8;
  ctx.stroke();
  // 问号
  ctx.font = `bold ${r * 0.8}px sans-serif`;
  ctx.fillStyle = '#ff88cc';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#ff88cc';
  ctx.shadowBlur = 14;
  ctx.fillText('?', cx, cy);
  // 四角星
  drawStar4(ctx, cx0 + 8, cy0 + 8, 5, '#ffaadd');
  drawStar4(ctx, cx0 + cw - 8, cy0 + 8, 5, '#ffaadd');
  ctx.restore();
}

// 2 - 大鸡腿
function drawLeg(ctx, cx, cy, size) {
  const r = size * 0.85;
  ctx.save();

  // 背景圆
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = '#1a0c00';
  ctx.fill();

  // 鸡腿整体往右下方倾斜（旋转 -35度）
  ctx.translate(cx, cy);
  ctx.rotate(-0.6);

  // 鸡腿肉（粗大的椭圆形肉块）
  const meatW = r * 0.52, meatH = r * 0.72;
  const meatX = 0, meatY = -r * 0.1;
  const meatGrad = ctx.createRadialGradient(meatX - meatW * 0.2, meatY - meatH * 0.2, 0, meatX, meatY, meatW);
  meatGrad.addColorStop(0,   '#ffcc88');
  meatGrad.addColorStop(0.4, '#e8882a');
  meatGrad.addColorStop(0.8, '#c05010');
  meatGrad.addColorStop(1,   '#8a2800');
  ctx.beginPath();
  ctx.ellipse(meatX, meatY, meatW, meatH, 0, 0, Math.PI * 2);
  ctx.fillStyle = meatGrad;
  ctx.shadowColor = '#ff8822';
  ctx.shadowBlur = 16;
  ctx.fill();

  // 焦脆纹理（深色弧线模拟烤痕）
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(80,20,0,0.55)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) {
    const oy = meatY - meatH * 0.45 + i * meatH * 0.28;
    const hw = meatW * Math.sqrt(1 - Math.pow((oy - meatY) / meatH, 2)) * 0.85;
    ctx.beginPath();
    ctx.ellipse(meatX, oy, hw, hw * 0.18, 0, 0, Math.PI);
    ctx.stroke();
  }

  // 骨头（细长白色圆柱，从底部伸出）
  const boneX = meatX + meatW * 0.05;
  const boneTop = meatY + meatH * 0.55;
  const boneH = r * 0.55, boneW = r * 0.1;

  // 骨头杆
  const boneGrad = ctx.createLinearGradient(boneX - boneW, boneTop, boneX + boneW, boneTop);
  boneGrad.addColorStop(0,   '#e0e0e0');
  boneGrad.addColorStop(0.5, '#ffffff');
  boneGrad.addColorStop(1,   '#c0c0c0');
  roundRect(ctx, boneX - boneW / 2, boneTop, boneW, boneH, boneW / 2);
  ctx.fillStyle = boneGrad;
  ctx.shadowColor = '#aaaaaa';
  ctx.shadowBlur = 4;
  ctx.fill();

  // 骨头末端圆球
  ctx.beginPath();
  ctx.arc(boneX, boneTop + boneH, boneW * 1.3, 0, Math.PI * 2);
  ctx.fillStyle = '#f0f0f0';
  ctx.shadowColor = '#bbbbbb';
  ctx.shadowBlur = 6;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(boneX, boneTop + boneH * 0.08, boneW * 1.1, 0, Math.PI * 2);
  ctx.fillStyle = '#f8f8f8';
  ctx.fill();

  // 油亮高光
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.ellipse(meatX - meatW * 0.25, meatY - meatH * 0.3, meatW * 0.2, meatH * 0.12, -0.5, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,240,180,0.55)';
  ctx.fill();

  ctx.restore();
}

// 3 - 冰淇淋
function drawIceCream(ctx, cx, cy, size) {
  const r = size * 0.85;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = '#050f14';
  ctx.fill();
  const coneH = r * 0.75, coneW = r * 0.55;
  const top = cy - r * 0.3;
  // 甜筒
  ctx.beginPath();
  ctx.moveTo(cx - coneW / 2, top);
  ctx.lineTo(cx, top + coneH);
  ctx.lineTo(cx + coneW / 2, top);
  ctx.closePath();
  ctx.fillStyle = '#c8882a';
  ctx.fill();
  // 格纹
  ctx.strokeStyle = '#a06010';
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const y = top + (coneH / 4) * i;
    const hw = (coneW / 2) * (1 - i / 4);
    ctx.beginPath(); ctx.moveTo(cx - hw, y); ctx.lineTo(cx + hw, y); ctx.stroke();
  }
  // 冰淇淋球
  const ballR = coneW * 0.7;
  ctx.beginPath();
  ctx.arc(cx, top, ballR, 0, Math.PI * 2);
  const grad = ctx.createRadialGradient(cx - ballR * 0.2, top - ballR * 0.2, 0, cx, top, ballR);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.5, '#aaeeff');
  grad.addColorStop(1, '#44ccee');
  ctx.fillStyle = grad;
  ctx.shadowColor = '#aaeeff';
  ctx.shadowBlur = 14;
  ctx.fill();
  // 巧克力酱
  ctx.beginPath();
  ctx.arc(cx, top + ballR * 0.3, ballR * 0.35, 0, Math.PI * 2);
  ctx.fillStyle = '#5a2800';
  ctx.shadowBlur = 0;
  ctx.fill();
  ctx.restore();
}

// 4 - 公交车
function drawBusWindow(ctx, cx, cy, size) {
  const r = size * 0.85;
  ctx.save();

  // 背景圆
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = '#040d12';
  ctx.fill();

  // 公交车尺寸（横向，居中偏下）
  const bw = r * 1.75, bh = r * 0.9;
  const bx = cx - bw / 2, by = cy - bh / 2 + r * 0.08;

  // 车身主体
  roundRect(ctx, bx, by, bw, bh, r * 0.12);
  const bodyGrad = ctx.createLinearGradient(bx, by, bx, by + bh);
  bodyGrad.addColorStop(0, '#1a6644');
  bodyGrad.addColorStop(0.5, '#0f4a30');
  bodyGrad.addColorStop(1, '#0a3322');
  ctx.fillStyle = bodyGrad;
  ctx.shadowColor = '#44ff88';
  ctx.shadowBlur = 14;
  ctx.fill();

  // 车身描边
  roundRect(ctx, bx, by, bw, bh, r * 0.12);
  ctx.strokeStyle = '#44ff88';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 车顶高出部分（驾驶舱顶）
  roundRect(ctx, bx + bw * 0.05, by - bh * 0.22, bw * 0.9, bh * 0.25, r * 0.08);
  ctx.fillStyle = '#0f4a30';
  ctx.shadowBlur = 0;
  ctx.fill();
  roundRect(ctx, bx + bw * 0.05, by - bh * 0.22, bw * 0.9, bh * 0.25, r * 0.08);
  ctx.strokeStyle = '#44ff8888';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 车窗（3个均匀排列）
  ctx.shadowBlur = 0;
  const winW = bw * 0.22, winH = bh * 0.36;
  const winY = by + bh * 0.1;
  const winPositions = [bx + bw * 0.08, bx + bw * 0.37, bx + bw * 0.66];
  winPositions.forEach((wx, i) => {
    roundRect(ctx, wx, winY, winW, winH, r * 0.05);
    // 窗内天空渐变
    const wg = ctx.createLinearGradient(wx, winY, wx, winY + winH);
    wg.addColorStop(0, '#1a3a5a');
    wg.addColorStop(1, '#0a1a2a');
    ctx.fillStyle = wg;
    ctx.fill();
    // 窗框
    roundRect(ctx, wx, winY, winW, winH, r * 0.05);
    ctx.strokeStyle = i === 1 ? '#00ffff' : '#44aacc'; // 中间窗高亮（靠窗位置）
    ctx.lineWidth = i === 1 ? 2.5 : 1.5;
    ctx.shadowColor = i === 1 ? '#00ffff' : 'transparent';
    ctx.shadowBlur = i === 1 ? 8 : 0;
    ctx.stroke();
    ctx.shadowBlur = 0;
    // 中间窗加一颗星表示「靠窗座位」
    if (i === 1) {
      ctx.fillStyle = '#00ffff';
      ctx.font = `${winH * 0.5}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 6;
      ctx.fillText('★', wx + winW / 2, winY + winH / 2);
      ctx.shadowBlur = 0;
    }
  });

  // 车门（右侧）
  const doorW = bw * 0.14, doorH = bh * 0.58;
  const doorX = bx + bw * 0.82, doorY = by + bh * 0.38;
  roundRect(ctx, doorX, doorY, doorW, doorH, r * 0.04);
  ctx.fillStyle = '#0a2a1a';
  ctx.fill();
  roundRect(ctx, doorX, doorY, doorW, doorH, r * 0.04);
  ctx.strokeStyle = '#44ff8866';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // 门中线
  ctx.beginPath();
  ctx.moveTo(doorX + doorW / 2, doorY + 2);
  ctx.lineTo(doorX + doorW / 2, doorY + doorH - 2);
  ctx.strokeStyle = '#44ff8844';
  ctx.lineWidth = 1;
  ctx.stroke();

  // 车灯（前后各一个）
  // 前灯（左）
  ctx.beginPath();
  ctx.ellipse(bx + r * 0.08, by + bh * 0.72, r * 0.1, r * 0.07, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#ffee88';
  ctx.shadowColor = '#ffee88';
  ctx.shadowBlur = 10;
  ctx.fill();
  // 尾灯（右）
  ctx.beginPath();
  ctx.ellipse(bx + bw - r * 0.08, by + bh * 0.72, r * 0.1, r * 0.07, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#ff4444';
  ctx.shadowColor = '#ff4444';
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.shadowBlur = 0;

  // 车轮（两个）
  const wheelR = r * 0.17;
  const wheelY = by + bh + wheelR * 0.35;
  [bx + bw * 0.2, bx + bw * 0.75].forEach(wx => {
    // 轮胎
    ctx.beginPath();
    ctx.arc(wx, wheelY, wheelR, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1a1a';
    ctx.shadowColor = '#44ff8844';
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.strokeStyle = '#44ff88';
    ctx.lineWidth = 2;
    ctx.stroke();
    // 轮毂
    ctx.beginPath();
    ctx.arc(wx, wheelY, wheelR * 0.45, 0, Math.PI * 2);
    ctx.fillStyle = '#2a2a2a';
    ctx.shadowBlur = 0;
    ctx.fill();
    ctx.strokeStyle = '#888888';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // 轮辐（4根）
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(wx + Math.cos(a) * wheelR * 0.45, wheelY + Math.sin(a) * wheelR * 0.45);
      ctx.lineTo(wx + Math.cos(a) * wheelR * 0.9, wheelY + Math.sin(a) * wheelR * 0.9);
      ctx.strokeStyle = '#666666';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  });

  // 路面线条
  ctx.beginPath();
  ctx.moveTo(bx - r * 0.1, wheelY + wheelR);
  ctx.lineTo(bx + bw + r * 0.1, wheelY + wheelR);
  ctx.strokeStyle = '#44ff8844';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.restore();
}

// 5 - 亲手做饭
function drawMeal(ctx, cx, cy, size) {
  const r = size * 0.85;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = '#120a00';
  ctx.fill();
  // 碗
  ctx.beginPath();
  ctx.ellipse(cx, cy + r * 0.2, r * 0.65, r * 0.25, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#e8d8b0';
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx, cy + r * 0.2, r * 0.65, r * 0.25, 0, Math.PI, 0);
  ctx.fillStyle = '#c8aa70';
  ctx.fill();
  // 碗边
  ctx.beginPath();
  ctx.ellipse(cx, cy + r * 0.2, r * 0.65, r * 0.25, 0, 0, Math.PI * 2);
  ctx.strokeStyle = '#ffaa44';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#ffaa44';
  ctx.shadowBlur = 8;
  ctx.stroke();
  // 食物（面条/饭）
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI + Math.PI;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * r * 0.4, cy + r * 0.15);
    ctx.quadraticCurveTo(
      cx + Math.cos(angle) * r * 0.2, cy - r * 0.05,
      cx + Math.cos(angle + 0.5) * r * 0.35, cy + r * 0.05
    );
    ctx.strokeStyle = '#fff0cc';
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 3;
    ctx.stroke();
  }
  // 爱心
  ctx.font = `${r * 0.35}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#ff4488';
  ctx.shadowBlur = 10;
  ctx.fillText('♥', cx, cy - r * 0.45);
  ctx.restore();
}

// 6 - 无条件道歉（只有「对不起！」对话气泡）
function drawApology(ctx, cx, cy, size) {
  const r = size * 0.85;
  ctx.save();

  // 背景圆
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = '#100010';
  ctx.fill();

  // 气泡主体
  const bw = r * 1.55, bh = r * 0.75;
  const bx = cx - bw / 2, by = cy - r * 0.25 - bh / 2;
  roundRect(ctx, bx, by, bw, bh, r * 0.15);
  ctx.fillStyle = '#2a0033';
  ctx.fill();
  roundRect(ctx, bx, by, bw, bh, r * 0.15);
  ctx.strokeStyle = '#ff44aa';
  ctx.lineWidth = 2.5;
  ctx.shadowColor = '#ff44aa';
  ctx.shadowBlur = 12;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // 气泡尾巴（朝右下）
  const tailX = cx + r * 0.3, tailY = by + bh;
  ctx.beginPath();
  ctx.moveTo(tailX - r * 0.08, tailY);
  ctx.lineTo(tailX + r * 0.22, tailY + r * 0.32);
  ctx.lineTo(tailX + r * 0.14, tailY);
  ctx.fillStyle = '#2a0033';
  ctx.fill();
  ctx.strokeStyle = '#ff44aa';
  ctx.lineWidth = 2.5;
  ctx.shadowColor = '#ff44aa';
  ctx.shadowBlur = 8;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // 文字「对不起！」
  ctx.font = `bold ${r * 0.38}px sans-serif`;
  ctx.fillStyle = '#ff88dd';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#ff44aa';
  ctx.shadowBlur = 10;
  ctx.fillText('对不起！', cx, cy - r * 0.25);
  ctx.shadowBlur = 0;

  // 三个小感叹号装饰（气泡外右下角）
  const marks = ['!', '!', '!'];
  marks.forEach((m, i) => {
    ctx.font = `bold ${r * 0.22}px sans-serif`;
    ctx.fillStyle = `rgba(255,100,180,${0.8 - i * 0.2})`;
    ctx.shadowColor = '#ff44aa';
    ctx.shadowBlur = 4;
    ctx.fillText(m, tailX + r * 0.28 + i * r * 0.2, tailY + r * 0.28 + i * r * 0.14);
  });
  ctx.shadowBlur = 0;

  ctx.restore();
}

// 7 - 蛋糕
function drawCake(ctx, cx, cy, size) {
  const r = size * 0.85;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = '#120800';
  ctx.fill();
  const layers = [
    { y: cy + r * 0.45, w: r * 1.1, h: r * 0.35, color: '#e8c4a0', cream: '#fff0e0' },
    { y: cy + r * 0.1,  w: r * 0.85, h: r * 0.32, color: '#d4a070', cream: '#ffe8cc' },
    { y: cy - r * 0.2, w: r * 0.6,  h: r * 0.28, color: '#c07840', cream: '#ffd8aa' },
  ];
  layers.forEach(l => {
    // 蛋糕体
    roundRect(ctx, cx - l.w / 2, l.y - l.h, l.w, l.h, 4);
    ctx.fillStyle = l.color;
    ctx.fill();
    // 奶油
    ctx.beginPath();
    ctx.ellipse(cx, l.y - l.h, l.w / 2, l.h * 0.22, 0, 0, Math.PI * 2);
    ctx.fillStyle = l.cream;
    ctx.fill();
  });
  // 蜡烛
  const candleX = [cx - r * 0.2, cx, cx + r * 0.2];
  const candleColors = ['#ff4488', '#ffdd44', '#44aaff'];
  candleX.forEach((x, i) => {
    const baseY = layers[2].y - layers[2].h + 2;
    ctx.fillStyle = candleColors[i];
    ctx.shadowColor = candleColors[i];
    ctx.shadowBlur = 6;
    roundRect(ctx, x - 4, baseY - r * 0.25, 8, r * 0.25, 2);
    ctx.fill();
    // 火焰
    ctx.beginPath();
    ctx.ellipse(x, baseY - r * 0.3, 4, 7, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#ffee44';
    ctx.shadowColor = '#ffcc00';
    ctx.shadowBlur = 10;
    ctx.fill();
  });
  ctx.restore();
}

// 8 - 请吃饭
function drawDinner(ctx, cx, cy, size) {
  const r = size * 0.85;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = '#0a0800';
  ctx.fill();
  // 盘子
  ctx.beginPath();
  ctx.ellipse(cx, cy + r * 0.15, r * 0.65, r * 0.2, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#e8e0d0';
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx, cy + r * 0.1, r * 0.5, r * 0.15, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#f8f0e0';
  ctx.fill();
  // 食物
  ctx.beginPath();
  ctx.ellipse(cx, cy + r * 0.05, r * 0.35, r * 0.1, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#c85020';
  ctx.shadowColor = '#ff6633';
  ctx.shadowBlur = 8;
  ctx.fill();
  // 刀叉
  ctx.shadowBlur = 0;
  // 叉子
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.5, cy - r * 0.5);
  ctx.lineTo(cx - r * 0.5, cy + r * 0.4);
  ctx.strokeStyle = '#c0c0c0';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.stroke();
  // 刀
  ctx.beginPath();
  ctx.moveTo(cx + r * 0.5, cy - r * 0.5);
  ctx.lineTo(cx + r * 0.5, cy + r * 0.4);
  ctx.strokeStyle = '#c0c0c0';
  ctx.lineWidth = 3;
  ctx.stroke();
  // 星星装饰
  ctx.font = `${r * 0.25}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#ffdd44';
  ctx.shadowBlur = 8;
  ctx.fillText('⭐', cx - r * 0.3, cy - r * 0.5);
  ctx.fillText('⭐', cx + r * 0.3, cy - r * 0.5);
  ctx.restore();
}

/* ===== 工具函数 ===== */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawStar4(ctx, x, y, r, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 6;
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    const a2 = ((i + 0.5) / 4) * Math.PI * 2;
    ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    ctx.lineTo(x + Math.cos(a2) * r * 0.4, y + Math.sin(a2) * r * 0.4);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawCloud(ctx, cx, cy, r) {
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.shadowBlur = 0;
  [[0, 0, r * 0.5], [-r * 0.5, r * 0.2, r * 0.4], [r * 0.5, r * 0.2, r * 0.4]].forEach(([dx, dy, cr]) => {
    ctx.beginPath();
    ctx.arc(cx + dx, cy + dy, cr, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

/* ===== 在小盲盒背面绘制缩略图标 ===== */
function drawPrizeThumbnail(canvas, prizeIndex) {
  const ctx = canvas.getContext('2d');
  const s = canvas.width;
  ctx.clearRect(0, 0, s, s);
  const prize = PRIZES[prizeIndex];
  prize.draw(ctx, s / 2, s / 2, s * 0.42);
}

/* ===== 在结果页绘制大图标 ===== */
function drawPrizeLarge(canvas, prizeIndex) {
  const ctx = canvas.getContext('2d');
  const s = canvas.width;
  ctx.clearRect(0, 0, s, s);
  // 背景圆（与奖品主色调配）
  const prize = PRIZES[prizeIndex];
  ctx.save();
  ctx.beginPath();
  ctx.arc(s / 2, s / 2, s * 0.46, 0, Math.PI * 2);
  ctx.fillStyle = prize.color + '22';
  ctx.fill();
  ctx.strokeStyle = prize.color;
  ctx.lineWidth = 2;
  ctx.shadowColor = prize.color;
  ctx.shadowBlur = 16;
  ctx.stroke();
  ctx.restore();
  prize.draw(ctx, s / 2, s / 2, s * 0.42);
}
