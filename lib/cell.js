// cell.js -- a representation of a single grid cell

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
