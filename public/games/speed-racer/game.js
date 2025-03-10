// Game canvas and context
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// UI elements
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const uiLayer = document.getElementById('ui-layer');
const scoreElement = document.getElementById('score');
const timeElement = document.getElementById('time');
const speedElement = document.getElementById('speed');
const finalScoreElement = document.getElementById('final-score');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');

// Game constants
const LANE_WIDTH = 120;
const ROAD_WIDTH = 600;
const ROAD_MARGIN = (canvas.width - ROAD_WIDTH) / 2;
const CAR_WIDTH = 80;
const CAR_HEIGHT = 140;
const OBSTACLE_WIDTH = 80;
const OBSTACLE_HEIGHT = 140;
const MAX_SPEED = 300;
const ACCELERATION = 1;
const FRICTION = 0.97;
const TURNING_SPEED = 5;
const SPAWN_INTERVAL_MIN = 800;
const SPAWN_INTERVAL_MAX = 2000;

// Game state
let gameRunning = false;
let gameTime = 0;
let score = 0;
let speed = 0;
let distance = 0;
let nextObstacleSpawn = 0;
let lastTimestamp = 0;
let gameTimeInterval;

// Player car
const playerCar = {
  x: canvas.width / 2 - CAR_WIDTH / 2,
  y: canvas.height - CAR_HEIGHT - 20,
  width: CAR_WIDTH,
  height: CAR_HEIGHT,
  speed: 0,
  color: 'red'
};

// Obstacles
const obstacles = [];

// Input tracking
const keys = {
  ArrowLeft: false,
  ArrowRight: false,
  ArrowUp: false,
  ArrowDown: false,
  a: false,
  d: false,
  w: false,
  s: false
};

// Handle keyboard input
window.addEventListener('keydown', (e) => {
  if (keys.hasOwnProperty(e.key)) {
    keys[e.key] = true;
  }
});

window.addEventListener('keyup', (e) => {
  if (keys.hasOwnProperty(e.key)) {
    keys[e.key] = false;
  }
});

// Button event listeners
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);

// Game functions
function startGame() {
  // Reset game state
  gameRunning = true;
  gameTime = 0;
  score = 0;
  speed = 0;
  distance = 0;
  obstacles.length = 0;
  
  // Update UI
  startScreen.classList.add('hidden');
  gameOverScreen.classList.add('hidden');
  uiLayer.classList.remove('hidden');
  updateUI();
  
  // Start game timer
  gameTimeInterval = setInterval(() => {
    gameTime++;
    updateUI();
  }, 1000);
  
  // Start game loop
  lastTimestamp = performance.now();
  requestAnimationFrame(gameLoop);
}

function endGame() {
  gameRunning = false;
  clearInterval(gameTimeInterval);
  finalScoreElement.textContent = score;
  gameOverScreen.classList.remove('hidden');
}

function gameLoop(timestamp) {
  // Calculate delta time for smooth animations
  const deltaTime = (timestamp - lastTimestamp) / 1000;
  lastTimestamp = timestamp;
  
  if (gameRunning) {
    updateGame(deltaTime);
    renderGame();
    requestAnimationFrame(gameLoop);
  }
}

function updateGame(deltaTime) {
  // Handle car controls
  if (keys.ArrowLeft || keys.a) {
    playerCar.x -= TURNING_SPEED;
  }
  if (keys.ArrowRight || keys.d) {
    playerCar.x += TURNING_SPEED;
  }
  if (keys.ArrowUp || keys.w) {
    speed += ACCELERATION;
  } else if (keys.ArrowDown || keys.s) {
    speed -= ACCELERATION * 2;
  } else {
    speed *= FRICTION;
  }
  
  // Clamp speed
  speed = Math.max(0, Math.min(MAX_SPEED, speed));
  
  // Update distance and score
  distance += speed * deltaTime;
  score = Math.floor(distance / 10);
  
  // Keep car within road boundaries
  playerCar.x = Math.max(ROAD_MARGIN, Math.min(canvas.width - ROAD_MARGIN - CAR_WIDTH, playerCar.x));
  
  // Spawn obstacles
  nextObstacleSpawn -= deltaTime * 1000;
  if (nextObstacleSpawn <= 0) {
    spawnObstacle();
    nextObstacleSpawn = Math.random() * (SPAWN_INTERVAL_MAX - SPAWN_INTERVAL_MIN) + SPAWN_INTERVAL_MIN;
    nextObstacleSpawn = Math.max(SPAWN_INTERVAL_MIN / 2, nextObstacleSpawn - gameTime * 5); // Increase difficulty over time
  }
  
  // Update obstacles
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obstacle = obstacles[i];
    obstacle.y += (speed / 2 + obstacle.speed) * deltaTime;
    
    // Remove off-screen obstacles
    if (obstacle.y > canvas.height) {
      obstacles.splice(i, 1);
      continue;
    }
    
    // Check collision
    if (checkCollision(playerCar, obstacle)) {
      endGame();
      return;
    }
  }
  
  // Update UI
  updateUI();
}

function spawnObstacle() {
  // Determine which lane to spawn in
  const lanes = Math.floor(ROAD_WIDTH / LANE_WIDTH);
  const lane = Math.floor(Math.random() * lanes);
  const x = ROAD_MARGIN + lane * LANE_WIDTH + (LANE_WIDTH - OBSTACLE_WIDTH) / 2;
  
  // Create obstacle
  obstacles.push({
    x,
    y: -OBSTACLE_HEIGHT,
    width: OBSTACLE_WIDTH,
    height: OBSTACLE_HEIGHT,
    speed: 30 + Math.random() * 50,
    color: getRandomColor()
  });
}

function checkCollision(car, obstacle) {
  return car.x < obstacle.x + obstacle.width &&
         car.x + car.width > obstacle.x &&
         car.y < obstacle.y + obstacle.height &&
         car.y + car.height > obstacle.y;
}

function getRandomColor() {
  const colors = ['blue', 'green', 'purple', 'orange', 'cyan', 'yellow'];
  return colors[Math.floor(Math.random() * colors.length)];
}

function renderGame() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw road
  ctx.fillStyle = '#333';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#888';
  ctx.fillRect(ROAD_MARGIN, 0, ROAD_WIDTH, canvas.height);
  
  // Draw lane markings
  ctx.strokeStyle = 'white';
  ctx.setLineDash([30, 40]);
  ctx.lineWidth = 5;
  
  for (let i = 1; i < ROAD_WIDTH / LANE_WIDTH; i++) {
    const x = ROAD_MARGIN + i * LANE_WIDTH;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  
  // Draw obstacles
  obstacles.forEach(obstacle => {
    ctx.fillStyle = obstacle.color;
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    
    // Draw windows
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(obstacle.x + 10, obstacle.y + 10, obstacle.width - 20, 20);
    ctx.fillRect(obstacle.x + 10, obstacle.y + obstacle.height - 40, obstacle.width - 20, 20);
  });
  
  // Draw player car
  ctx.fillStyle = playerCar.color;
  ctx.fillRect(playerCar.x, playerCar.y, playerCar.width, playerCar.height);
  
  // Draw car details
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(playerCar.x + 10, playerCar.y + 10, playerCar.width - 20, 20);
  ctx.fillRect(playerCar.x + 10, playerCar.y + playerCar.height - 40, playerCar.width - 20, 20);
}

function updateUI() {
  scoreElement.textContent = score;
  timeElement.textContent = gameTime;
  speedElement.textContent = Math.floor(speed);
}

// Initialize game display
renderGame();