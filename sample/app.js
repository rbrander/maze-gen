'use strict';
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const CELL_SIZE = 30; // pixels
const NUM_X_CELLS = Math.floor(canvas.width / CELL_SIZE);
const NUM_Y_CELLS = Math.floor(canvas.height / CELL_SIZE);
const CELL_MOVE_DELAY = 0; // ms before moving current
const CELLS =
  new Array(NUM_X_CELLS)
    .fill(new Array(NUM_Y_CELLS).fill())
    .map((rowCells, x) => rowCells.map((_, y) => new Cell(x, y)));

const drawCells = () => {
  CELLS.forEach((rowCells, x) =>
    rowCells.forEach((cell, y) => {
      // fill the cell
      const isCurrentCell = ((x === current.x) && (y === current.y));
      ctx.fillStyle = isCurrentCell ? 'orange' : (cell.hasVisited() ? '#00C' : '#555');
      ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

      // draw walls
      ctx.lineWidth = 1;
      CELL_WALLS.forEach(wall => {
        if (cell.hasWall(wall)) {
          const startX = x * CELL_SIZE + (wall === CELL_WALL_EAST ? CELL_SIZE : 0);
          const startY = y * CELL_SIZE + (wall === CELL_WALL_SOUTH ? CELL_SIZE : 0);
          const endX = x * CELL_SIZE + (wall === CELL_WALL_WEST ? 0 : CELL_SIZE);
          const endY = y * CELL_SIZE + (wall !== CELL_WALL_NORTH ? CELL_SIZE : 0);
          ctx.strokeStyle = 'white';
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.stroke();
        }
      });
    })
  );
};

const draw = (time) => {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawCells();
};

const findNextCell = () => {
  // Using current, find the next neighbor that hasn't been visited, or undefined if nothing left
  let next = undefined;

  // find all the neighbors
  const walls = current.getWalls()
    // Filter out the walls that are out of bounds
    .filter(wall => wall !== CELL_WALL_NORTH || current.y > 0)
    .filter(wall => wall !== CELL_WALL_EAST || current.x < NUM_X_CELLS)
    .filter(wall => wall !== CELL_WALL_SOUTH || current.y < NUM_Y_CELLS)
    .filter(wall => wall !== CELL_WALL_WEST || current.x > 0)
    .filter(wall => {
      // check if the neighbor has been visited
      let isInBounds;
      switch (wall) {
        case CELL_WALL_NORTH:
          isInBounds = current.y > 0;
          return isInBounds && CELLS[current.x][current.y - 1].hasVisited() === false;
        case CELL_WALL_EAST:
          isInBounds = current.x < NUM_X_CELLS - 1;
          return isInBounds && CELLS[current.x + 1][current.y].hasVisited() === false;
        case CELL_WALL_SOUTH:
          isInBounds = current.y < NUM_Y_CELLS - 1;
          return isInBounds && CELLS[current.x][current.y + 1].hasVisited() === false;
        case CELL_WALL_WEST:
          isInBounds = current.x > 0;
          return isInBounds && CELLS[current.x - 1][current.y].hasVisited() === false;
      }
    });

  if (walls.length > 0) {
    // pick a random wall
    const randomWall = walls[~~(Math.random() * walls.length)];
    let nextX, nextY;
    switch (randomWall) {
      case CELL_WALL_NORTH:
        nextX = current.x;
        nextY = current.y - 1;
        break;
      case CELL_WALL_EAST:
        nextX = current.x + 1;
        nextY = current.y;
        break;
      case CELL_WALL_SOUTH:
        nextX = current.x;
        nextY = current.y + 1;
        break;
      case CELL_WALL_WEST:
        nextX = current.x - 1;
        nextY = current.y;
        break;
      default:
        throw new Error(`Unknown wall: ${randomWall}`);
    }
    next = CELLS[nextX][nextY];
  }
  console.groupEnd();
  return next;
};

/*
Recursive backtracker (https://en.wikipedia.org/wiki/Maze_generation_algorithm#Recursive_backtracker)

1. Make the initial cell the current cell and mark it as visited
2. While there are unvisited cells
  1. If the current cell has any neighbours which have not been visited
    1. Choose randomly one of the unvisited neighbours
    2. Push the current cell to the stack
    3. Remove the wall between the current cell and the chosen cell
    4. Make the chosen cell the current cell and mark it as visited
  2. Else if stack is not empty
    1. Pop a cell from the stack
    2. Make it the current cell
*/

const removeWall = (current, next) => {
  if (!current || !next) return;
  if (current.x === next.x) {
    // this is a change in Y direction
    if (current.y > next.y) {
      // remove current.north and next.south
      current.removeWall(CELL_WALL_NORTH);
      next.removeWall(CELL_WALL_SOUTH);
    } else {
      // remove current.south and next.north
      current.removeWall(CELL_WALL_SOUTH);
      next.removeWall(CELL_WALL_NORTH);
    }
  } else {
    // this is a change in the X direction
    if (current.x > next.x) {
      // remove current.west and next.east
      current.removeWall(CELL_WALL_WEST);
      next.removeWall(CELL_WALL_EAST);
    } else {
      // remove current.east and next.west
      current.removeWall(CELL_WALL_EAST);
      next.removeWall(CELL_WALL_WEST);
    }
  }
};

let current = CELLS[0][0];
current.visited();
let timeLastMoved = 0;
const pathStack = []; // A breadcrumb trail of cells we've visited
const update = (time) => {
  if (time - timeLastMoved > CELL_MOVE_DELAY) {
    timeLastMoved = time;
    // 1. Choose randomly one of the unvisited neighbours
    const next = findNextCell();
    if (next !== undefined) {
      // 2. Push the current cell to the stack
      pathStack.push(current);
      // 3. Remove the wall between the current cell and the chosen cell
      removeWall(current, next);
      // 4. Make the chosen cell the current cell and mark it as visited
      current = next;
      current.visited();
    } else if (pathStack.length > 0) {
      // 1. Pop a cell from the stack
      const cell = pathStack.pop();
      // 2. Make it the current cell
      current = cell;
    }
  }
};

const loop = (currentTime) => {
  update(currentTime);
  draw(currentTime);
  requestAnimationFrame(loop);
};
loop(0);
