const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let frame = 0;
let state = "stage"; // stage -> boss -> clear

// ===== プレイヤー =====
const player = {
  x: 200,
  y: 400,
  r: 4,
  speed: 4,
  alive: true
};

const keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// ===== 弾 =====
let bullets = [];

// ===== ボス =====
const boss = {
  x: 200,
  y: 100,
  hp: 300,
  phase: 0
};

// ===== ユーティリティ =====
function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// ===== 弾幕生成 =====
function radialShot(cx, cy, speed, count) {
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 / count) * i;
    bullets.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: 6
    });
  }
}

// ===== 更新 =====
function update() {
  frame++;

  // プレイヤー操作
  if (keys["ArrowLeft"]) player.x -= player.speed;
  if (keys["ArrowRight"]) player.x += player.speed;
  if (keys["ArrowUp"]) player.y -= player.speed;
  if (keys["ArrowDown"]) player.y += player.speed;

  // 画面外防止
  player.x = Math.max(0, Math.min(canvas.width, player.x));
  player.y = Math.max(0, Math.min(canvas.height, player.y));

  // 状態別処理
  if (state === "stage") {
    if (frame % 60 === 0) {
      radialShot(Math.random() * 400, 0, 2, 12);
    }
    if (frame > 600) {
      state = "boss";
      bullets = [];
      frame = 0;
    }
  }

  if (state === "boss") {
    if (frame % 40 === 0) {
      radialShot(boss.x, boss.y, 2 + boss.phase, 24);
    }
    if (frame % 180 === 0) boss.phase++;

    if (boss.phase > 3) state = "clear";
  }

  // 弾更新
  bullets.forEach(b => {
    b.x += b.vx;
    b.y += b.vy;

    if (player.alive && dist(player, b) < player.r + b.r) {
      player.alive = false;
    }
  });

  bullets = bullets.filter(
    b => b.x > -20 && b.x < 420 && b.y > -20 && b.y < 500
  );
}

// ===== 描画 =====
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // プレイヤー
  if (player.alive) {
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // 弾
  ctx.fillStyle = "red";
  bullets.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // ボス
  if (state === "boss") {
    ctx.fillStyle = "purple";
    ctx.beginPath();
    ctx.arc(boss.x, boss.y, 20, 0, Math.PI * 2);
    ctx.fill();
  }

  // テキスト
  ctx.fillStyle = "white";
  ctx.font = "16px sans-serif";

  if (!player.alive) {
    ctx.fillText("GAME OVER", 150, 240);
  }
  if (state === "clear") {
    ctx.fillText("CLEAR!", 170, 240);
  }
}

// ===== ループ =====
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
