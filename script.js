// script.js

// DOM elements
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const successScreen = document.getElementById('success-screen');
const scoreDisplay = document.getElementById('score');
const finalScore = document.getElementById('final-score');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const levelDisplay = document.getElementById('level');
const timerDisplay = document.getElementById('timer-display');
const timerSpan = document.getElementById('timer');

let score = 0;
let level = 1;
let selectedAnimal = '';
let animalIcon;
let animalX = canvas.width / 2 - 25;
const animalSpeed = 8;
let gameInterval;
let timerInterval;
let foods = [];
canvas.width = 900;
canvas.height = 700;

const foodImages = {
  grass: 'img/grass.png',
  meat: 'img/meat.png',
  seeds: 'img/seeds.png',
  worm: 'img/worm.png',
};

const animalFood = {
  cow: { preferred: 'grass', nonPreferred: ['seeds', 'meat', 'worm'] },
  lion: { preferred: 'meat', nonPreferred: ['grass', 'seeds', 'worm'] },
  chicken: { preferred: ['seeds', 'worm'], nonPreferred: ['meat', 'grass'] },
};

const animalBackgrounds = {
  cow: 'img/CowBG.jpg',
  lion: 'img/LionBG.jpg',
  chicken: 'img/ChickenBG.jpg',
};

// Load food images
Object.keys(foodImages).forEach(type => {
  const img = new Image();
  img.src = foodImages[type];
});

// Audio files
const backgroundMusic = new Audio('music/monkey.mp3');
const startGameSound = new Audio('music/startgame.mp3');
const inGameMusic = new Audio('music/ingame.mp3');
const touchEffectSound = new Audio('music/toucheffect.mp3');
const gameOverSound = new Audio('music/gameover.mp3');
const levelCompleteSound = new Audio('music/complete.mp3');

// Background music setup
backgroundMusic.loop = true;
inGameMusic.loop = true;
backgroundMusic.play();

// Animal selection handler
document.querySelectorAll('.animal-button').forEach(button => {
  button.addEventListener('click', (e) => {
    selectedAnimal = e.target.dataset.animal;
    animalIcon = new Image();

    if (selectedAnimal === 'cow') {
      animalIcon.src = 'img/cow.png';
    } else if (selectedAnimal === 'chicken') {
      animalIcon.src = 'img/chicken.png';
    } else if (selectedAnimal === 'lion') {
      animalIcon.src = 'img/lion.png';
    }

    const backgroundPath = animalBackgrounds[selectedAnimal];
    gameScreen.style.backgroundImage = `url(${backgroundPath})`;
    gameScreen.style.backgroundSize = 'cover';

    // Transition to game start
    backgroundMusic.pause();
    startGameSound.play();
    startScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    startGame();
  });
});

class Food {
  constructor(type) {
    this.type = type;
    this.x = Math.random() * (canvas.width - 60);
    this.y = 0;
    this.speed = (Math.random() * 1 + 0.5) * Math.pow(2, level - 1);
    this.image = new Image();
    this.image.src = foodImages[type];
  }

  draw() {
    ctx.drawImage(this.image, this.x, this.y, 60, 60);
  }

  update() {
    this.y += this.speed;
    this.draw();
  }
}

function drawAnimal() {
  ctx.drawImage(animalIcon, animalX, canvas.height - 90, 100, 70);
}

function startGame() {
  score = 0;
  level = 1;
  scoreDisplay.innerText = ` ${score}`;
  levelDisplay.innerText = ` ${level}`;
  foods = [];
  timerDisplay.classList.add('hidden');

  inGameMusic.play();

  gameInterval = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const foodChance = Math.random() < (level >= 3 ? 0.5 : 0.85);
    const foodType = foodChance
      ? getPreferredFood(selectedAnimal)
      : getRandomFoodType(selectedAnimal);

    if (foods.length < 5) foods.push(new Food(foodType));

    foods.forEach((food, index) => {
      food.update();
      if (food.y > canvas.height) foods.splice(index, 1);

      if (
        food.y + 60 > canvas.height - 90 &&
        food.x + 60 > animalX &&
        food.x < animalX + 100
      ) {
        if (isPreferredFood(selectedAnimal, food.type)) {
          score++;
          scoreDisplay.innerText = score;
          foods.splice(index, 1);
          touchEffectSound.play();

          if (score % 10 === 0) {
            levelUp();
          }
        } else {
          gameOver();
        }
      }
    });

    drawAnimal();
  }, 30);
}

function levelUp() {
  level++;
  levelDisplay.innerText = ` ${level}`;

  if (level === 5) {
    startTimer(30);
  }
}

function getPreferredFood(animal) {
  const preferred = animalFood[animal].preferred;
  return Array.isArray(preferred) ? preferred[Math.floor(Math.random() * preferred.length)] : preferred;
}

function getRandomFoodType(preferredAnimal) {
  const nonPreferred = animalFood[preferredAnimal].nonPreferred;
  return nonPreferred[Math.floor(Math.random() * nonPreferred.length)];
}

function isPreferredFood(animal, foodType) {
  const preferred = animalFood[animal].preferred;
  return Array.isArray(preferred) ? preferred.includes(foodType) : preferred === foodType;
}

function gameOver() {
  clearInterval(gameInterval);
  clearInterval(timerInterval);
  finalScore.innerText = score;
  gameScreen.classList.add('hidden');
  gameOverScreen.classList.remove('hidden');
  inGameMusic.pause();
  gameOverSound.play();
}

function startTimer(seconds) {
  timerDisplay.classList.remove('hidden');
  timerSpan.innerText = seconds;

  timerInterval = setInterval(() => {
    seconds--;
    timerSpan.innerText = seconds;

    if (seconds <= 0) {
      clearInterval(timerInterval);
      showSuccessScreen();
    }
  }, 1000);
}

function showSuccessScreen() {
  gameScreen.classList.add('hidden');
  successScreen.classList.remove('hidden');
  inGameMusic.pause();
  levelCompleteSound.play();
}

document.getElementById('restart-button').addEventListener('click', () => {
  gameOverScreen.classList.add('hidden');
  startScreen.classList.remove('hidden');
  backgroundMusic.play();
});

document.getElementById('play-again-button').addEventListener('click', () => {
  successScreen.classList.add('hidden');
  startScreen.classList.remove('hidden');
  backgroundMusic.play();
});

// Animal movement controls
let moveLeftInterval, moveRightInterval;

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft' && !moveLeftInterval) {
    moveLeftInterval = setInterval(() => {
      if (animalX > 0) animalX -= animalSpeed;
    }, 16);
  }
  if (e.key === 'ArrowRight' && !moveRightInterval) {
    moveRightInterval = setInterval(() => {
      if (animalX < canvas.width - 100) animalX += animalSpeed;
    }, 16);
  }
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft') clearInterval(moveLeftInterval), moveLeftInterval = null;
  if (e.key === 'ArrowRight') clearInterval(moveRightInterval), moveRightInterval = null;
});

document.getElementById('move-left').addEventListener('mousedown', () => {
  moveLeftInterval = setInterval(() => {
    if (animalX > 0) animalX -= animalSpeed;
  }, 16);
});

document.getElementById('move-left').addEventListener('mouseup', () => clearInterval(moveLeftInterval));
document.getElementById('move-right').addEventListener('mousedown', () => {
  moveRightInterval = setInterval(() => {
    if (animalX < canvas.width - 100) animalX += animalSpeed;
  }, 16);
});
document.getElementById('move-right').addEventListener('mouseup', () => clearInterval(moveRightInterval));

// Add mobile touch controls
document.getElementById('move-left').addEventListener('touchstart', () => {
  moveLeftInterval = setInterval(() => {
    if (animalX > 0) animalX -= animalSpeed;
  }, 16);
});

document.getElementById('move-left').addEventListener('touchend', () => {
  clearInterval(moveLeftInterval);
  moveLeftInterval = null;
});

document.getElementById('move-right').addEventListener('touchstart', () => {
  moveRightInterval = setInterval(() => {
    if (animalX < canvas.width - 100) animalX += animalSpeed;
  }, 16);
});

document.getElementById('move-right').addEventListener('touchend', () => {
  clearInterval(moveRightInterval);
  moveRightInterval = null;
});

// Prevent context menu from appearing on long press (for mobile)
document.getElementById('move-left').addEventListener('contextmenu', (e) => e.preventDefault());
document.getElementById('move-right').addEventListener('contextmenu', (e) => e.preventDefault());
