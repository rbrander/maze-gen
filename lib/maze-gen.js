// maze-gen.js

////////////////////////////////////////////////////////////////////////////////
// Cell model

const CELL_WALL_NORTH = 'north';
const CELL_WALL_EAST = 'east';
const CELL_WALL_SOUTH = 'south';
const CELL_WALL_WEST = 'west';
const CELL_WALLS = [CELL_WALL_NORTH, CELL_WALL_EAST, CELL_WALL_SOUTH, CELL_WALL_WEST];

// NOTE: this must be an ES5 function (as opposed to an arrow function)
// because it is used as a constructor, and needs its own `this`
function Cell(x, y) {
  const newCell = {
    x, y,
    visited: false,
    walls: [CELL_WALL_NORTH, CELL_WALL_EAST, CELL_WALL_SOUTH, CELL_WALL_WEST],
    neighbours: {},
    removeWall: (wallToRemove) => { this.walls = this.walls.filter(wall => wall !== wallToRemove); }
  };
  return Object.assign(this, newCell);
}

////////////////////////////////////////////////////////////////////////////////

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
function generateMaze(numXCells, numYCells) {
  const maze =
    new Array(numXCells).fill().map((columnOfCells, x) =>
      new Array(numYCells).fill().map((rowOfCells, y) =>
        new Cell(x, y)));

  // Add neighbouring cells to each cell (for quick future reference)
  const isInBounds = (x, y) => (x >= 0 && y >= 0 && x < numXCells && y < numYCells);
  for (let x = 0; x < numXCells; x++) {
    for (let y = 0; y < numYCells; y++) {
      if (isInBounds(x, y - 1)) {
        maze[x][y].neighbours[CELL_WALL_NORTH] = { x, y: y -1 };
      }
      if (isInBounds(x, y + 1)) {
        maze[x][y].neighbours[CELL_WALL_SOUTH] = { x, y: y + 1 };
      }
      if (isInBounds(x - 1, y)) {
        maze[x][y].neighbours[CELL_WALL_WEST] = { x: x - 1, y };
      }
      if (isInBounds(x + 1, y)) {
        maze[x][y].neighbours[CELL_WALL_EAST] = { x: x + 1, y };
      }
    }
  }

  // 1. Make the initial cell the current cell and mark it as visited
  let current = maze[0][0];
  current.visited = true;

  // 2. While there are unvisited cells
  const hasCellsToExplore = () => maze.reduce(
    (hasUnvisitedCell, cellColumn) => hasUnvisitedCell || cellColumn.reduce(
      (hasUnvisitedCellInCol, cell) => hasUnvisitedCellInCol || cell.visited === false
    , hasUnvisitedCell)
  , false);

  // using current, check the `maze` to see if there are any unvisited neighbours
  const hasNeighboursToExplore = () => {
    const neighbourSides = Object.keys(current.neighbours);
    return neighbourSides.reduce((result, side) => {
      const { x, y } = current.neighbours[side];
      return result || !maze[x][y].visited
    }, false);
    /*
    return Object.keys(current.neighbours)
      .reduce((result, key) => result || !current.neighbours[key].visited, false)
    */
  }

  const removeWalls = (cellA, cellB) => {
    // Find the common wall by comparing relative positions
    const xDiff = cellA.x - cellB.x;
    const yDiff = cellA.y - cellB.y;
    if (xDiff > 0) {
      // cellA's west side vs cellB's east side
      cellA.removeWall(CELL_WALL_WEST);
      cellB.removeWall(CELL_WALL_EAST);
    } else if (xDiff < 0) {
      // cellA's east side vs cellB's west side
      cellA.removeWall(CELL_WALL_EAST);
      cellB.removeWall(CELL_WALL_WEST);
    } else if (yDiff > 0) {
      // cellA's north side vs cellB's south side
      cellA.removeWall(CELL_WALL_NORTH);
      cellB.removeWall(CELL_WALL_SOUTH);
    } else if (yDiff < 0) {
      // cellA's south side vs cellB's north side
      cellA.removeWall(CELL_WALL_SOUTH);
      cellB.removeWall(CELL_WALL_NORTH);
    }
  };

  const pathStack = [];
  while (hasCellsToExplore()) {
    // 2.1. If the current cell has any neighbours which have not been visited
    if (hasNeighboursToExplore()) {
      //   2.1.1. Choose randomly one of the unvisited neighbours
      const neighbourSides = Object.keys(current.neighbours);
      const unvisitedNeighbourSides = neighbourSides.filter(side => {
        const { x, y } = current.neighbours[side];
        return !maze[x][y].visited;
      });
      const randomNeighbourSide = unvisitedNeighbourSides[~~(unvisitedNeighbourSides.length * Math.random())];
      const { x, y } = current.neighbours[randomNeighbourSide];
      const randomNeighbour = maze[x][y];
      //   2.1.2. Push the current cell to the stack
      pathStack.push(current);
      //   2.1.3. Remove the wall between the current cell and the chosen cell
      removeWalls(current, randomNeighbour);
      //   2.1.4. Make the chosen cell the current cell and mark it as visited
      current = randomNeighbour;
      current.visited = true;
    } else if (pathStack.length > 0) { // 2.2. Else if stack is not empty
      //   2.2.1. Pop a cell from the stack
      const previousCell = pathStack.pop();
      //   2.2.2. Make it the current cell
      current = previousCell;
    } else {
      console.log('done');
      break;
    }
  }

  // Replace neighbours with an array of the walls facing neighbours
  // This is because cell references will cause an self-referencing loop
  for (let x = 0; x < numXCells; x++) {
    for (let y = 0; y < numYCells; y++) {
      maze[x][y] = Object.assign({}, {
        x: maze[x][y].x,
        y: maze[x][y].y,
        walls: maze[x][y].walls
      });
    }
  }

  return maze;
}

exports.generateMaze = generateMaze;
