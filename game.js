const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let frame = 0;
let state = "stage"; // stage / boss / clear

// =====================
// 入力
// =====================
const keys = {};
document.addEventListener("keydown", e => {
  keys[e.key] = true;
  e.preventDefault();
});
document.addEventListener("keyup", e => {
  keys[e.key] = false;
});

// =====================
// 自機
// =====================
const player = {
  x: 200,
  y: 400,
  r: 3,
  speed: 4,
  slowSpeed: 2,
  bombs: 3,
  bombMax: 3,
  bombRecoverTimer: 0
};

const playerShots = [];

// =====================
// 敵・弾
// =====================
const enemies = [];
const enemyShots = [];

// =====================
// 道中 Scene
// =====================
const stageScenes = [
  { duration: 1800, spawn: 90, type: 0 },
  { duration: 1800, spawn: 60, type: 1 },
  { duration: 1200, spawn: 45, type: 2 },
  { duration: 1200, spawn: 30, type: 3 }
];

const enemyTypes = [
  { hp: 10, speed: 1, shot: 120 },
  { hp: 20, speed: 1.5, shot: 90 },
  { hp: 40, speed: 0.8, shot: 60 },
  { hp: 60, speed: 0.6, shot: 45 }
];

let currentScene = 0;
let sceneTimer = 0;

// =====================
// ボス
// =====================
const boss = {
  x: 200,
  y: 100,
  r: 20,
  hp: 3000,
  phaseIndex: 0,
  phaseTimer: 0,
  phases: [
    { type: "normal", time: 600 },
    { type: "spell", time: 900 },
    { type: "normal", time: 600 },
    { type: "spell", time: 900 },
    { type: "normal", time: 600 },
    { type: "spell", time: 1200, rage: true }
  ]
};

// =====================
// 処理系
// =====================
function shoot() {
  if (!keys["x"] || frame % 5 !== 0) return;

  if (keys["z"]) {
    playerShots.push({ x: player.x, y: player.y, vx: 0, vy: -8 });
  } else {
    [-2, 2].forEach(vx => {
      playerShots.push({ x: player.x, y: player.y, vx, vy: -8 });
    });
  }
}

function useBomb() {
  if (!keys["c"] || player.bombs <= 0) return;
  player.bombs--;
  enemyShots.length = 0;
}

function spawnEnemy() {
  const scene = stageScenes[currentScene];
  const t = enemyTypes[scene.type];

  enemies.push({
    x: Math.random() * 360 + 20,
    y: -20,
    hp: t.hp,
    speed: t.speed,
    shot: t.shot,
    timer: 0
  });
}

function bossAttack() {
  const p = boss.phases[boss.phaseIndex];
  boss.phaseTimer++;

  if (p.type === "normal" && boss.phaseTimer % 60 === 0) {
    for (let i = 0; i < 12; i++) {
      const a = Math.PI * 2 / 12 * i;
      enemyShots.push({
        x: boss.x,
        y: boss.y,
        vx: Math.cos(a) * 2,
        vy: Math.sin(a) * 2
      });
    }
  }

  if (p.type === "spell" && boss.phaseTimer % 20 === 0) {
    const speed = p.rage ? 4 : 3;
    for (let i = 0; i < 36; i++) {
      const a = Math.PI * 2 / 36 * i;
      enemyShots.push({
        x: boss.x,
        y: boss.y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed
      });
    }
  }

  if (boss.phaseTimer > p.time) {
    boss.phaseIndex++;
    boss.phaseTimer = 0;
    enemyShots.length = 0;

    if (boss.phaseIndex >= boss.phases.length) {
      state = "clear";
    }
  }
}

// =====================
// 更新
// =====================
function update() {
  frame++;

  // 自機移動
  let sp = keys["z"] ? player.slowSpeed : player.speed;
  if (keys["ArrowLeft"]) player.x -= sp;
  if (keys["ArrowRight"]) player.x += sp;
  if (keys["ArrowUp"]) player.y -= sp;
  if (keys["ArrowDown"]) player.y += sp;

  shoot();
  useBomb();

  // ボム回復
  player.bombRecoverTimer++;
  if (player.bombRecoverTimer > 1800 && player.bombs < player.bombMax) {
    player.bombs++;
    player.bombRecoverTimer = 0;
  }

  // 道中
  if (state === "stage") {
    sceneTimer++;
    if (sceneTimer % stageScenes[currentScene].spawn === 0) {
      spawnEnemy();
    }
    if (sceneTimer > stageScenes[currentScene].duration) {
      sceneTimer = 0;
      currentScene++;
      if (currentScene >= stageScenes.length) {
        state = "boss";
        enemies.length = 0;
        enemyShots.length = 0;
      }
    }
  }

  if (state === "boss") bossAttack();

  // 敵更新
  enemies.forEach(e => {
    e.y += e.speed;
    e.timer++;
    if (e.timer % e.shot === 0) {
      enemyShots.push({
        x: e.x,
        y: e.y,
        vx: 0,
        vy: 3
      });
    }
  });

  // 弾移動
  [...playerShots, ...enemyShots].forEach(b => {
    b.x += b.vx;
    b.y += b.vy;
  });
}

// =====================
// 描画
// =====================
function draw() {
  ctx.clearRect(0, 0, 400, 480);

  // 自機
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
  ctx.fill();

  // 敵
  ctx.fillStyle = "red";
  enemies.forEach(e => {
    ctx.beginPath();
    ctx.arc(e.x, e.y, 8, 0, Math.PI * 2);
    ctx.fill();
  });

  // ボス
  if (state === "boss") {
    ctx.fillStyle = "purple";
    ctx.beginPath();
    ctx.arc(boss.x, boss.y, boss.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // 弾
  ctx.fillStyle = "cyan";
  playerShots.forEach(b => ctx.fillRect(b.x - 2, b.y - 6, 4, 8));

  ctx.fillStyle = "yellow";
  enemyShots.forEach(b => ctx.fillRect(b.x - 2, b.y - 2, 4, 4));
}

// =====================
// ループ
// =====================
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
