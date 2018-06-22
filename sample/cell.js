// cell.js

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
    _visited: false,
    _walls: {
      [CELL_WALL_NORTH]: true,
      [CELL_WALL_EAST]: true,
      [CELL_WALL_SOUTH]: true,
      [CELL_WALL_WEST]: true
    },
    removeWall: (wall) => { this._walls[wall] = false; },
    hasWall: (wall) => this._walls[wall],
    hasVisited: () => this._visited,
    getWalls: () => Object.keys(this._walls).filter(wall => this._walls[wall]),
    visited: () => this._visited = true
  };
  return Object.assign(this, newCell);
}
