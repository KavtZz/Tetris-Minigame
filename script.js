const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

const grid = 20;
const rows = canvas.height / grid;
const cols = canvas.width / grid;

let score = 0;
const scoreElement = document.getElementById('score');

let highScore = 0;
const highScoreElement = document.createElement('p');
highScoreElement.textContent = `High Score: ${highScore}`;
highScoreElement.style.color = '#fff';
highScoreElement.style.fontSize = '1.5rem';
highScoreElement.style.textAlign = 'center';
document.querySelector('.score-container').appendChild(highScoreElement);

const colors = [
    '#FF5733', '#33FF57', '#3357FF', '#F3FF33', '#FF33F3', '#33FFF3', '#F333FF'
];

const tetrominoes = [
    [[1, 1, 1],
     [0, 1, 0]],

    [[0, 1, 1],
     [1, 1, 0]],

    [[1, 1, 0],
     [0, 1, 1]],

    [[1, 1],
     [1, 1]],

    [[1, 1, 1, 1]],

    [[1, 1, 1],
     [1, 0, 0]],

    [[1, 1, 1],
     [0, 0, 1]]
];

const arena = Array.from({ length: rows }, () => Array(cols).fill(0));

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                context.fillStyle = colors[Math.floor(Math.random() * colors.length)];
                context.fillRect((x + offset.x) * grid, (y + offset.y) * grid, grid, grid);
                context.strokeStyle = '#000';
                context.strokeRect((x + offset.x) * grid, (y + offset.y) * grid, grid, grid);
            }
        });
    });
}

function updateScore() {
    score += 10;
    scoreElement.textContent = score;
}

function updateHighScore() {
    if (score > highScore) {
        highScore = score;
        highScoreElement.textContent = `High Score: ${highScore}`;
    }
}

function checkGameOver() {
    if (arena[0].some(cell => cell !== 0)) {
        alert('Game Over!');
        resetGame();
    }
}

function resetGame() {
    arena.forEach(row => row.fill(0));
    score = 0;
    scoreElement.textContent = score;
    piece = createPiece();
    position = { x: 3, y: 0 };
    dropInterval = 1000;
}

function createPiece() {
    const type = Math.floor(Math.random() * tetrominoes.length);
    return tetrominoes[type];
}

let piece = createPiece();
let position = { x: 3, y: 0 };

let dropInterval = 1000;
let lastTime = 0;

function update(time = 0) {
    const deltaTime = time - lastTime;
    if (deltaTime > dropInterval) {
        dropPiece();
        lastTime = time;
    }
    draw();
    requestAnimationFrame(update);
}

function movePiece(dir) {
    position.x += dir;
    if (position.x < 0 || position.x + piece[0].length > cols) {
        position.x -= dir; // Undo move if out of bounds
    }
}

function rotatePiece() {
    const rotated = piece[0].map((_, index) => piece.map(row => row[index]).reverse());
    if (position.x + rotated[0].length <= cols) {
        piece = rotated;
    }
}

document.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') {
        movePiece(-1);
    } else if (event.key === 'ArrowRight') {
        movePiece(1);
    } else if (event.key === 'ArrowDown') {
        dropPiece();
    } else if (event.key === 'ArrowUp') {
        rotatePiece();
    }
});

function dropPiece() {
    position.y++;
    if (collide()) {
        position.y--;
        merge();
        updateHighScore();
        checkGameOver();
        piece = createPiece();
        position = { x: 3, y: 0 };
        updateScore();
    }
    draw();
}

function collide() {
    return piece.some((row, y) => {
        return row.some((value, x) => {
            if (value) {
                const newY = y + position.y;
                const newX = x + position.x;
                return newY >= rows || arena[newY][newX];
            }
            return false;
        });
    });
}

function merge() {
    piece.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                arena[y + position.y][x + position.x] = value;
            }
        });
    });
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw arena
    arena.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                context.fillStyle = colors[value % colors.length];
                context.fillRect(x * grid, y * grid, grid, grid);
                context.strokeStyle = '#000';
                context.strokeRect(x * grid, y * grid, grid, grid);
            }
        });
    });

    // Draw current piece
    drawMatrix(piece, position);
}

update();
