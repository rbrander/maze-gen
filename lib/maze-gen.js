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
    removeWall: (wallToRemove) => { this.walls = this.walls.filter(wall !== wallToRemove); },
    hasWall: (wall) => this.walls.includes(wall)
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
  const maze = new Array(numXCells).fill()
    .map((columnOfCells, x) =>
      new Array(numYCells).fill()
        .map((rowOfCells, y) => new Cell(x, y)));

  // 1. Make the initial cell the current cell and mark it as visited
  let current = maze[0][0];
  current.visited = true;

  // 2. While there are unvisited cells
  const hasCellsToExplore = () => maze.reduce(
    (hasUnvisitedCell, cellColumn) => hasUnvisitedCell || cellColumn.reduce(
      (hasUnvisitedCellInCol, cell) => hasUnvisitedCellInCol || cell.visited === false
    , hasUnvisitedCell)
  , false);

  const hasNeighboursToExplore = () => {
    // using current, check the `maze` to see if there are any unvisited neighbours
    return false;
  };
  // while (hasCellsToExplore()) {
    // 2.1. If the current cell has any neighbours which have not been visited
    if (hasNeighboursToExplore()) {
      //   2.1.1. Choose randomly one of the unvisited neighbours
      //   2.1.2. Push the current cell to the stack
      //   2.1.3. Remove the wall between the current cell and the chosen cell
      //   2.1.4. Make the chosen cell the current cell and mark it as visited
    } else { // 2.2. Else if stack is not empty
      //   2.2.1. Pop a cell from the stack
      //   2.2.2. Make it the current cell
    }
  // }

  return maze;
}

exports.generateMaze = generateMaze;
