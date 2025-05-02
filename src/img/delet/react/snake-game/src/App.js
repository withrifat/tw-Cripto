import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_FOOD = { x: 15, y: 15 };
const DIRECTIONS = {
  ArrowUp: 'UP',
  ArrowDown: 'DOWN',
  ArrowLeft: 'LEFT',
  ArrowRight: 'RIGHT'
};

function App() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState(INITIAL_FOOD);
  const [direction, setDirection] = useState('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
    
    // Ensure food doesn't spawn on snake
    if (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
      return generateFood();
    }
    return newFood;
  }, [snake]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(INITIAL_FOOD);
    setDirection('RIGHT');
    setGameOver(false);
    setScore(0);
    setGameStarted(true);
    setIsPaused(false);
  };

  const checkCollision = (head) => {
    // Wall collision
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) return true;
    // Self collision
    return snake.some(segment => segment.x === head.x && segment.y === head.y);
  };

  const moveSnake = useCallback(() => {
    if (gameOver || !gameStarted || isPaused) return;

    setSnake(prevSnake => {
      const newSnake = [...prevSnake];
      const head = { ...newSnake[0] };

      switch (direction) {
        case 'UP': head.y -= 1; break;
        case 'DOWN': head.y += 1; break;
        case 'LEFT': head.x -= 1; break;
        case 'RIGHT': head.x += 1; break;
      }

      if (checkCollision(head)) {
        setGameOver(true);
        return prevSnake;
      }

      newSnake.unshift(head);

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(s => s + 1);
        setFood(generateFood());
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gameOver, gameStarted, isPaused, generateFood]);

  // Game loop
  useEffect(() => {
    const gameInterval = setInterval(moveSnake, 150);
    return () => clearInterval(gameInterval);
  }, [moveSnake]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      const newDirection = DIRECTIONS[e.key];
      if (!newDirection) return;

      // Prevent reverse direction
      const oppositeDirections = {
        UP: 'DOWN',
        DOWN: 'UP',
        LEFT: 'RIGHT',
        RIGHT: 'LEFT'
      };
      if (newDirection !== oppositeDirections[direction]) {
        setDirection(newDirection);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction]);

  return (
    <div className="game-container">
      <h1 className="title">React Snake Game</h1>
      <div className="score-board">Score: {score}</div>
      
      <div className="grid">
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
          const x = index % GRID_SIZE;
          const y = Math.floor(index / GRID_SIZE);
          const isSnake = snake.some(segment => segment.x === x && segment.y === y);
          const isFood = food.x === x && food.y === y;
          const isHead = snake[0]?.x === x && snake[0]?.y === y;

          return (
            <div
              key={index}
              className={`cell ${isSnake ? 'snake' : ''} ${isFood ? 'food' : ''} ${isHead ? 'head' : ''}`}
              style={{
                width: `calc(100% / ${GRID_SIZE})`,
                paddingBottom: `calc(100% / ${GRID_SIZE})`
              }}
            />
          );
        })}
      </div>

      {!gameStarted ? (
        <div className="controls">
          <button className="control-btn start" onClick={resetGame}>
            Start Game
          </button>
        </div>
      ) : (
        <div className="controls">
          <button className="control-btn" onClick={() => setIsPaused(!isPaused)}>
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button className="control-btn" onClick={resetGame}>
            Restart
          </button>
        </div>
      )}

      {gameOver && (
        <div className="game-over">
          <h2>Game Over!</h2>
          <p>Final Score: {score}</p>
        </div>
      )}
    </div>
  );
}

export default App;