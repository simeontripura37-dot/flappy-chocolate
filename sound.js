const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// State Engine Variables
let isPaused = false;
let gameState = 'START'; // START, PLAYING, GAMEOVER
let score = 0;
let highScore = localStorage.getItem('flappy_high_score') || 0;

// Dynamic Adaptive Sizing
function resizeCanvas() {
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Image Asset Preloading Configurations
const birdImg = new Image();
birdImg.src = 'bird.png'; // Your friend's 64x64 face asset

const pipeImg = new Image();
pipeImg.src = 'pipe.png'; // Green Obstacle asset column texture

const chocImg = new Image();
chocImg.src = 'chocolate.png'; // Target collection chocolate objective asset

// Physics Constants and Coordinate Structs
const gravity = 0.25;
const flapStrength = -5.5;

const bird = {
  x: 50,
  y: canvas.height / 2,
  width: 44,
  height: 44,
  velocity: 0
};

let pipes = [];
const pipeWidth = 65;
const pipeGap = 150;
const pipeSpeed = 2;
let frameCounter = 0;

// Game State Resets
function resetGame() {
  bird.y = canvas.height / 3;
  bird.velocity = 0;
  pipes = [];
  score = 0;
  frameCounter = 0;
}

// Generate Obstacles & Treats
function spawnPipePair() {
  const minHeight = 50;
  const maxHeight = canvas.height - pipeGap - minHeight - 100;
  const topPipeHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
  
  pipes.push({
    x: canvas.width,
    topHeight: topPipeHeight,
    bottomY: topPipeHeight + pipeGap,
    passed: false,
    hasChocolate: Math.random() > 0.4, // 60% chance to hold chocolate objective token
    chocY: topPipeHeight + (pipeGap / 2),
    chocCollected: false
  });
}

// Main Frame Render Loop Process
function gameLoop() {
  if (isPaused) {
    requestAnimationFrame(gameLoop);
    return;
  }

  // Clear Background View Frame canvas context
  ctx.fillStyle = '#70c5ce';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw Ground base foundation accent block
  ctx.fillStyle = '#d4a373';
  ctx.fillRect(0, canvas.height - 80, canvas.width, 80);
  ctx.fillStyle = '#4aac23';
  ctx.fillRect(0, canvas.height - 90, canvas.width, 10);

  if (gameState === 'START') {
    // Render Entry Message Graphic Overview
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.strokeText('FLAPPY CHOCOLATE', canvas.width / 2, canvas.height / 3);
    ctx.fillText('FLAPPY CHOCOLATE', canvas.width / 2, canvas.height / 3);
    
    ctx.font = '16px Arial';
    ctx.strokeText('TAP SCREEN TO FLAP & START', canvas.width / 2, canvas.height / 2);
    ctx.fillText('TAP SCREEN TO FLAP & START', canvas.width / 2, canvas.height / 2);
      ctx.font = 'italic bold 14px Arial';
    ctx.fillStyle = '#fcb103'; // Gives it a cool golden chocolate color!
    ctx.fillText('MADE BY YOUR Simeon Tripura', canvas.width / 2, (canvas.height / 2) + 40);
    
    // Draw resting bird sprite preview center stage
    ctx.drawImage(birdImg, canvas.width / 2 - 22, canvas.height / 2.5, 44, 44);

  } else if (gameState === 'PLAYING') {
    frameCounter++;
    if (frameCounter % 120 === 0) {
      spawnPipePair();
    }

    // Process Bird Object Physics Calculations
    bird.velocity += gravity;
    bird.y += bird.velocity;

    // Ceiling / Ground bounds logic checks
    if (bird.y < 0) bird.y = 0;
    if (bird.y + bird.height >= canvas.height - 90) {
      triggerGameOver();
    }

    // Draw active user entity sprite payload
    ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    // Iterative Obstacle Manipulation array loop calculations
    for (let i = pipes.length - 1; i >= 0; i--) {
      let p = pipes[i];
      p.x -= pipeSpeed;

      // Draw Top Pipe Structure Segment Column
      ctx.drawImage(pipeImg, p.x, 0, pipeWidth, p.topHeight);
      
      // Draw Bottom Pipe Structure Segment Column
      ctx.drawImage(pipeImg, p.x, p.bottomY, pipeWidth, canvas.height - p.bottomY - 90);

      // Render Chocolate items if uncollected inside gaps
      if (p.hasChocolate && !p.chocCollected) {
        ctx.drawImage(chocImg, p.x + (pipeWidth / 2) - 15, p.chocY - 15, 30, 30);
        
        // Item collection detection checks
        if (bird.x + bird.width > p.x + (pipeWidth / 2) - 15 &&
            bird.x < p.x + (pipeWidth / 2) + 15 &&
            bird.y + bird.height > p.chocY - 15 &&
            bird.y < p.chocY + 15) {
          p.chocCollected = true;
          score += 2; // Bonus points target acquisition logic execution
        }
      }

      // Hitbox Obstacle Failure Evaluation checks
      if (bird.x + bird.width - 4 > p.x && bird.x + 4 < p.x + pipeWidth) {
        if (bird.y + 4 < p.topHeight || bird.y + bird.height - 4 > p.bottomY) {
          triggerGameOver();
        }
      }

      // Incremental normal passing score verification points
      if (!p.passed && p.x + pipeWidth < bird.x) {
        p.passed = true;
        score++;
      }

      // Cull dead offscreen pipe element segments clean
      if (p.x + pipeWidth < 0) {
        pipes.splice(i, 1);
      }
    }

    // Active score layout HUD rendering tracking
    renderScoreboardHUD();

  } else if (gameState === 'GAMEOVER') {
    // Redraw static layout instances for failure state capture visual presentation
    for (let p of pipes) {
      ctx.drawImage(pipeImg, p.x, 0, pipeWidth, p.topHeight);
      ctx.drawImage(pipeImg, p.x, p.bottomY, pipeWidth, canvas.height - p.bottomY - 90);
      if (p.hasChocolate && !p.chocCollected) {
        ctx.drawImage(chocImg, p.x + (pipeWidth / 2) - 15, p.chocY - 15, 30, 30);
      }
    }
    ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    // Render Menu Overlay details interface text configurations
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 5;
    ctx.strokeText('GAME OVER', canvas.width / 2, canvas.height / 3);
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 3);

    ctx.font = '18px Arial';
    ctx.strokeText(`SCORE: ${score} | BEST: ${highScore}`, canvas.width / 2, canvas.height / 2.3);
    ctx.fillText(`SCORE: ${score} | BEST: ${highScore}`, canvas.width / 2, canvas.height / 2.3);

    ctx.font = 'bold 14px Arial';
    ctx.strokeText('TAP TO PLAY AGAIN', canvas.width / 2, canvas.height / 1.8);
    ctx.fillText('TAP TO PLAY AGAIN', canvas.width / 2, canvas.height / 1.8);
  }

  requestAnimationFrame(gameLoop);
}

function renderScoreboardHUD() {
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'center';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 5;
  ctx.strokeText(score, canvas.width / 2, 50);
  ctx.fillText(score, canvas.width / 2, 50);
}

function triggerGameOver() {
  gameState = 'GAMEOVER';
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('flappy_high_score', highScore);
  }
}

// User Action Tap Execution Management Event Listeners
function handleUserAction() {
  if (isPaused) return;

  if (gameState === 'START') {
    resetGame();
    gameState = 'PLAYING';
    bird.velocity = flapStrength;
  } else if (gameState === 'PLAYING') {
    bird.velocity = flapStrength;
  } else if (gameState === 'GAMEOVER') {
    resetGame();
    gameState = 'PLAYING';
  }
}

// Global Canvas input capture events registration
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  handleUserAction();
}, { passive: false });

canvas.addEventListener('mousedown', (e) => {
  handleUserAction();
});

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    handleUserAction();
  }
});

// UI Hardware Action Click Listeners
const pauseBtn = document.getElementById('pause-btn');
const homeBtn = document.getElementById('home-btn');

pauseBtn.addEventListener('touchstart', (e) => e.stopPropagation());
pauseBtn.addEventListener('mousedown', (e) => e.stopPropagation());
pauseBtn.addEventListener('click', (e) => {
  e.stopPropagation(); // Prevents jump command action cascade propagation
  
  if (gameState !== 'PLAYING') return; // Cannot pause on splash screen assemblies
  
  isPaused = !isPaused;
  if (isPaused) {
    pauseBtn.innerText = "Resume";
    pauseBtn.style.background = "#4aac23";
    pauseBtn.style.boxShadow = "0 4px 0 #327a18";
  } else {
    pauseBtn.innerText = "Pause";
    pauseBtn.style.background = "#e86100";
    pauseBtn.style.boxShadow = "0 4px 0 #b04900";
  }
});

homeBtn.addEventListener('touchstart', (e) => e.stopPropagation());
homeBtn.addEventListener('mousedown', (e) => e.stopPropagation());
homeBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  window.location.reload(); // Simple instantiation method structure reload sequence to clean reset state machine completely
});

// Initialize Application Engine Setup Execution
gameLoop();
