const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let frame = 0;
let state = "stage"; // stage, boss, clear

// ===== 入力 =====
const keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// ===== プレイヤー =====
const player = {
  x: 200,
  y: 420,
  r: 3,
  speed: 4,
  slowSpeed: 2,
  bombs: 3,
  bombMax: 3,
  bombCharge: 0,
  alive: true
};

let playerShots = [];
let enemyShots = [];

// ===== 敵 =====
let enemies = [];

// ===== ボス =====
const boss = {
  x: 200,
  y: 100,
  hp: 3000,
  phase: 0,
  timer: 0
};

// ===== ユーティリティ =====
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

// ===== ショット =====
function shoot() {
  if (frame % 5 !== 0) return;

  if (keys["z"]) {
    // 低速：集中ショット
    playerShots.push({ x: player.x, y: player.y, vx: 0, vy: -6 });
  } else {
    // 通常：拡散
    [-1, 1].forEach(d => {
      playerShots.push({ x: player.x, y: player.y, vx: d, vy: -6 });
    });
  }
}

// ===== ボム =====
function useBomb() {
  if (player.bombs <= 0) return;
  player.bombs--;
  enemyShots = [];
}

// ===== 敵生成 =====
function spawnEnemy(type) {
  enemies.push({
    x: Math.random() * 360 + 20,
    y: -20,
    hp: type === 0 ? 10 : 30,
    type,
    timer: 0
  });
}

// ===== 更新 =====
function update() {
  frame++;

  // プレイヤー移動
  let sp = keys["z"] ? player.slowSpeed : player.speed;
  if (keys["ArrowLeft"]) player.x -= sp;
  if (keys["ArrowRight"]) player.x += sp;
  if (keys["ArrowUp"]) player.y -= sp;
  if (keys["ArrowDown"]) player.y += sp;

  player.x = Math.max(0, Math.min(400, player.x));
  player.y = Math.max(0, Math.min(480, player.y));

  // ショット
  if (keys["x"]) shoot();

  // ボム
  if (keys["c"] && frame % 20 === 0) useBomb();

  // ボム回復（20秒で1）
  if (frame % (60 * 20) === 0 && player.bombs < player.bombMax) {
    player.bombs++;
  }

  // ===== 道中 =====
  if (state === "stage") {
    if (frame % 120 === 0) spawnEnemy(frame % 240 === 0 ? 1 : 0);
    if (frame > 60 * 120) {
      state = "boss";
      enemies = [];
      enemyShots = [];
      frame = 0;
    }
  }

  // ===== ボス =====
  if (state === "boss") {
    boss.timer++;

    if (boss.phase < 5 && boss.timer > 600) {
      boss.phase++;
      boss.timer = 0;
    }

    // 発狂
    if (boss.phase === 5 && boss.timer % 10 === 0) {
      for (let i = 0; i < 36; i++) {
        const a = i * Math.PI / 18;
        enemyShots.push({
          x: boss.x,
          y: boss.y,
          vx: Math.cos(a) * 3,
          vy: Math.sin(a) * 3,
          r: 5
        });
      }
    }
  }

  // ===== 敵更新 =====
  enemies.forEach(e => {
    e.y += 1;
    e.timer++;

    if (e.timer % 60 === 0) {
      enemyShots.push({
        x: e.x,
        y: e.y,
        vx: 0,
        vy: 3,
        r: 6
      });
    }
  });

  // ===== 弾更新 =====
  [...playerShots, ...enemyShots].forEach(b => {
    b.x += b.vx;
    b.y += b.vy;
  });

  // ===== 当たり判定 =====
  enemies.forEach(e => {
    playerShots.forEach(s => {
      if (dist(e, s) < 10) e.hp--;
    });
  });

  enemies = enemies.filter(e => e.hp > 0);

  enemyShots.forEach(b => {
    if (dist(player, b) < player.r + b.r) player.alive = false;
  });
}

// ===== 描画 =====
function draw() {
  ctx.clearRect(0, 0, 400, 480);

  // プレイヤー
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
  ctx.fill();

  // 弾
  ctx.fillStyle = "cyan";
  playerShots.forEach(b => ctx.fillRect(b.x - 2, b.y - 6, 4, 8));

  ctx.fillStyle = "red";
  enemyShots.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // 敵
  ctx.fillStyle = "orange";
  enemies.forEach(e => {
    ctx.beginPath();
    ctx.arc(e.x, e.y, 10, 0, Math.PI * 2);
    ctx.fill();
  });

  // ボス
  if (state === "boss") {
    ctx.fillStyle = "purple";
    ctx.beginPath();
    ctx.arc(boss.x, boss.y, 20, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "white";
  ctx.fillText(`Bomb: ${player.bombs}`, 10, 20);
}

// ===== ループ =====
function loop() {
  if (player.alive) {
    update();
    draw();
    requestAnimationFrame(loop);
  } else {
    ctx.fillText("GAME OVER", 160, 240);
  }
}

loop();
