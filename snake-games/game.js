document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');
    const startButton = document.getElementById('start-btn');
    const scoreElement = document.getElementById('score');
    
    // Game constants
    const gridSize = 20;
    const tileCount = canvas.width / gridSize;
    
    // Game variables
    let snake = [];
    let food = {};
    let direction = '';
    let nextDirection = '';
    let gameSpeed = 150;
    let gameInterval;
    let score = 0;
    let gameRunning = false;
    
    // Initialize game
    function initGame() {
        snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];
        
        generateFood();
        direction = 'right';
        nextDirection = 'right';
        score = 0;
        scoreElement.textContent = score;
        gameRunning = true;
        
        if (gameInterval) clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, gameSpeed);
        
        startButton.textContent = 'Restart Game';
    }
    
    // Generate food at random position
    function generateFood() {
        food = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
        
        // Make sure food doesn't appear on snake
        for (let cell of snake) {
            if (cell.x === food.x && cell.y === food.y) {
                generateFood();
                break;
            }
        }
    }
    
    // Game loop
    function gameLoop() {
        if (!gameRunning) return;
        
        moveSnake();
        checkCollision();
        draw();
    }
    
    // Move snake based on direction
    function moveSnake() {
        direction = nextDirection;
        
        // Create new head based on direction
        const head = { ...snake[0] };
        
        switch (direction) {
            case 'up':
                head.y -= 1;
                break;
            case 'down':
                head.y += 1;
                break;
            case 'left':
                head.x -= 1;
                break;
            case 'right':
                head.x += 1;
                break;
        }
        
        // Add new head to beginning of snake array
        snake.unshift(head);
        
        // Check if snake ate food
        if (head.x === food.x && head.y === food.y) {
            // Increase score
            score += 10;
            scoreElement.textContent = score;
            
            // Generate new food
            generateFood();
            
            // Increase speed every 50 points
            if (score % 50 === 0 && gameSpeed > 70) {
                gameSpeed -= 10;
                clearInterval(gameInterval);
                gameInterval = setInterval(gameLoop, gameSpeed);
            }
        } else {
            // Remove tail if snake didn't eat food
            snake.pop();
        }
    }
    
    // Check for collisions
    function checkCollision() {
        const head = snake[0];
        
        // Check wall collision
        if (
            head.x < 0 ||
            head.x >= tileCount ||
            head.y < 0 ||
            head.y >= tileCount
        ) {
            gameOver();
            return;
        }
        
        // Check self collision (starting from 4th segment)
        for (let i = 4; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                gameOver();
                return;
            }
        }
    }
    
    // Draw everything on canvas
    function draw() {
        // Clear canvas
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw snake
        snake.forEach((cell, index) => {
            // Head
            if (index === 0) {
                ctx.fillStyle = '#4CAF50';
            } 
            // Body
            else {
                ctx.fillStyle = '#8BC34A';
            }
            
            ctx.fillRect(
                cell.x * gridSize,
                cell.y * gridSize,
                gridSize - 1,
                gridSize - 1
            );
        });
        
        // Draw food
        ctx.fillStyle = '#FF5252';
        ctx.fillRect(
            food.x * gridSize,
            food.y * gridSize,
            gridSize - 1,
            gridSize - 1
        );
        
        // Draw grid (optional)
        /*
        ctx.strokeStyle = '#333';
        for (let i = 0; i < tileCount; i++) {
            // Vertical lines
            ctx.beginPath();
            ctx.moveTo(i * gridSize, 0);
            ctx.lineTo(i * gridSize, canvas.height);
            ctx.stroke();
            
            // Horizontal lines
            ctx.beginPath();
            ctx.moveTo(0, i * gridSize);
            ctx.lineTo(canvas.width, i * gridSize);
            ctx.stroke();
        }
        */
    }
    
    // Game over function
    function gameOver() {
        gameRunning = false;
        clearInterval(gameInterval);
        
        // Display game over message
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = '30px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 15);
        
        ctx.font = '20px Arial';
        ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 15);
        
        startButton.textContent = 'Play Again';
    }
    
    // Event listeners
    startButton.addEventListener('click', initGame);
    
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'ArrowUp':
                if (direction !== 'down') nextDirection = 'up';
                break;
            case 'ArrowDown':
                if (direction !== 'up') nextDirection = 'down';
                break;
            case 'ArrowLeft':
                if (direction !== 'right') nextDirection = 'left';
                break;
            case 'ArrowRight':
                if (direction !== 'left') nextDirection = 'right';
                break;
        }
    });
    
    // Mobile controls
    document.getElementById('up').addEventListener('click', () => {
        if (direction !== 'down') nextDirection = 'up';
    });
    
    document.getElementById('down').addEventListener('click', () => {
        if (direction !== 'up') nextDirection = 'down';
    });
    
    document.getElementById('left').addEventListener('click', () => {
        if (direction !== 'right') nextDirection = 'left';
    });
    
    document.getElementById('right').addEventListener('click', () => {
        if (direction !== 'left') nextDirection = 'right';
    });
    
    // Initial draw
    draw();
});