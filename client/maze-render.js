  // maze-render.js

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const TRAVELLER_DELAY = 20;
const CELL_WALL_NORTH = 'north';
const CELL_WALL_EAST = 'east';
const CELL_WALL_SOUTH = 'south';
const CELL_WALL_WEST = 'west';
const CELL_WALLS = [CELL_WALL_NORTH, CELL_WALL_EAST, CELL_WALL_SOUTH, CELL_WALL_WEST];

const getOppositeWall = (wall) => {
  switch (wall) {
    case CELL_WALL_NORTH: return CELL_WALL_SOUTH;
    case CELL_WALL_SOUTH: return CELL_WALL_NORTH;
    case CELL_WALL_WEST: return CELL_WALL_EAST;
    case CELL_WALL_EAST: return CELL_WALL_WEST;
    default: return wall;
  }
};


const state = {
  numXCells: 0,
  numYCells: 0,
  mazeData: [[]],
  cellSize: 0,
  mouse: {
    isDown: false,
    clicked: false,
    x: 0,
    y: 0
  },
  selecting: '',
  isSolving: false,
  solutionPath: [],
  startCell: {
    x: 0,
    y: 0
  },
  endCell: {
    x: undefined,
    y: undefined
  },
  traveller: {
    idx: 0,
    lastMoved: TRAVELLER_DELAY
  }
};


// Uses an A* algorithm for finding the end
function solveMaze() {
  state.isSolving = true;

  const reconstruct_path = (cameFrom, curr) => {
    let current = curr;
    const total_path = [current];
    while (cameFrom[current.x][current.y] !== undefined) {
      current = cameFrom[current.x][current.y];
      total_path.push(current);
    }
    total_path.reverse();
    return total_path;
  };

  const heuristic_cost_estimate = (start, goal) => {
    return Math.abs(goal.x - start.x) + Math.abs(goal.y - start.y);
  };

  const dist_between = (start, end) => {
    return Math.abs(start.x - end.x) + Math.abs(start.y - end.y);
  };

  const AStar = (start, goal) => {
    // The set of nodes already evaluated
    const closedSet = [];

    // The set of currently discovered nodes that are not evaluated yet.
    // Initially, only the start node is known.
    let openSet = [start];

    // For each node, which node it can most efficiently be reached from.
    // If a node can be reached from many nodes, cameFrom will eventually contain the
    // most efficient previous step.
    const cameFrom = new Array(state.numXCells).fill()
      .map(col => new Array(state.numYCells).fill());

    // For each node, the cost of getting from the start node to that node.
    const gScore = new Array(state.numXCells).fill()
      .map(col => new Array(state.numYCells).fill(Infinity));

    // The cost of going from start to start is zero.
    gScore[start.x][start.y] = 0;

    // For each node, the total cost of getting from the start node to the goal
    // by passing by that node. That value is partly known, partly heuristic.
    const fScore = new Array(state.numXCells).fill()
      .map(col => new Array(state.numYCells).fill(Infinity));

    // For the first node, that value is completely heuristic.
    fScore[start.x][start.y] = heuristic_cost_estimate(start, goal);

    while (openSet.length > 0) {
      // Set current to the node in openSet having the lowest fScore
      let current = openSet[0];
      if (openSet.length > 1) {
        for (var i = 1; i < openSet.length; i++) {
          const currCell = openSet[i];
          if (fScore[currCell.x][currCell.y] < fScore[current.x][current.y])
            current = currCell;
        }
      }

      // if current == goal, return the found path
      if (current.x === goal.x && current.y === goal.y) {
        return reconstruct_path(cameFrom, current);
      }

      // Remove the current from the openSet
      let removeIndex;
      for (var i = 0; i < openSet.length && removeIndex === undefined; i++) {
        const cell = openSet[i];
        if (cell.x === current.x && cell.y === current.y)
          removeIndex = i;
      }
      openSet.splice(removeIndex, 1);

      // Add the current to the closedSet
      closedSet.push(current);

      // Get all the neighbours
      const neighbours = [];
      for (var i = 0; i < CELL_WALLS.length; i++) {
        const wall = CELL_WALLS[i];
        const hasWall = current.walls.includes(wall);
        if (!hasWall) {
          switch (wall) {
            case CELL_WALL_NORTH:
              neighbours.push(state.mazeData[current.x][current.y - 1]);
              break;
            case CELL_WALL_EAST:
              neighbours.push(state.mazeData[current.x + 1][current.y]);
              break;
            case CELL_WALL_SOUTH:
              neighbours.push(state.mazeData[current.x][current.y + 1]);
              break;
            case CELL_WALL_WEST:
              neighbours.push(state.mazeData[current.x - 1][current.y]);
              break;
            default:
              return current;
          }
        }
      }

      // for each neighbour of current...
      for (var i = 0; i < neighbours.length; i++) {
        const neighbour = neighbours[i];

        // if neighbor in closedSet, continue (ignore the neighbour which is already evaluated)
        if (closedSet.some(cell => cell.x === neighbour.x && cell.y === neighbour.y))
          continue;

        // The distance from start to a neighbour
        const tentative_gScore = gScore[current.x][current.y] + dist_between(current, neighbour);

        // if neighbour is not in the openSet, we've just discover a new node
        if (openSet.find(cell => cell.x === neighbour.x && cell.y === neighbour.y) === undefined) {
          openSet.push(neighbour);
        } else if (tentative_gScore >= gScore[neighbour.x][neighbour.y]) {
          // This is a worse path
          continue;
        }

        // This path is the best until now. Record it!
        cameFrom[neighbour.x][neighbour.y] = current;
        gScore[neighbour.x][neighbour.y] = tentative_gScore;
        fScore[neighbour.x][neighbour.y] = gScore[neighbour.x][neighbour.y] + heuristic_cost_estimate(neighbour, goal);
      };
    }
  };
  const startAStar = Date.now();
  const result = AStar(
    state.mazeData[state.startCell.x][state.startCell.y],
    state.mazeData[state.endCell.x][state.endCell.y]
  );
  const timeTook = Date.now() - startAStar;
  console.log(`Done, took ${timeTook} ms`);
  state.solutionPath = result;
  state.traveller.idx = 0;
}

const update = (time) => {
  if (state.selecting !== '') {
    if (state.mouse.clicked) {
      state[`${state.selecting}Cell`].x = ~~(state.mouse.x / state.cellSize);
      state[`${state.selecting}Cell`].y = ~~(state.mouse.y / state.cellSize);
      state.selecting = '';
      state.mouse.clicked = false;
      clearAllButtons();
    }
  }

  // Solving
  if (state.isSolving) {
    // Move the traveller if needed
    if (time - state.traveller.lastMoved > TRAVELLER_DELAY) {
      if (state.traveller.idx < state.solutionPath.length)
        state.traveller.idx++;
      state.traveller.lastMoved = time;
    }
  }
};

const draw = (time) => {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.lineWidth = 2;
  ctx.strokeStyle = 'white';
  state.mazeData.forEach((cellColumn, x) => {
    cellColumn.forEach((cell, y) => {
      const mouseIsInCell = (
        (~~(state.mouse.x / state.cellSize) === x) &&
        (~~(state.mouse.y / state.cellSize) === y));
      // highlight the current hovering cell
      if (state.selecting !== '' && mouseIsInCell) {
        ctx.fillStyle = (state.selecting === 'start' ? 'green' : 'red');
        ctx.fillRect(x * state.cellSize + 2, y * state.cellSize + 2, state.cellSize - 4, state.cellSize - 4);
      }
      // fill the selected start cell
      if (state.startCell.x !== undefined && state.startCell.y !== undefined) {
        ctx.fillStyle = 'green';
        ctx.fillRect(state.startCell.x * state.cellSize + 1, state.startCell.y * state.cellSize + 1, state.cellSize - 2, state.cellSize - 2);
      }
      // fill the selected end cell
      if (state.endCell.x !== undefined && state.endCell.y !== undefined) {
        ctx.fillStyle = 'red';
        ctx.fillRect(state.endCell.x * state.cellSize + 1, state.endCell.y * state.cellSize + 1, state.cellSize - 2, state.cellSize - 2);
      }
      // draw the cell walls
      if (cell.walls.length > 0) {
        if (cell.walls.includes(CELL_WALL_NORTH)) {
          ctx.beginPath();
          ctx.moveTo(cell.x * state.cellSize, cell.y * state.cellSize);
          ctx.lineTo((cell.x + 1) * state.cellSize, cell.y * state.cellSize);
          ctx.stroke();
        }
        if (cell.walls.includes(CELL_WALL_EAST)) {
          ctx.beginPath();
          ctx.moveTo((cell.x + 1) * state.cellSize, cell.y * state.cellSize);
          ctx.lineTo((cell.x + 1) * state.cellSize, (cell.y + 1) * state.cellSize);
          ctx.stroke();
        }
        if (cell.walls.includes(CELL_WALL_SOUTH)) {
          ctx.beginPath();
          ctx.moveTo((cell.x + 1) * state.cellSize, (cell.y + 1) * state.cellSize);
          ctx.lineTo(cell.x * state.cellSize, (cell.y + 1) * state.cellSize);
          ctx.stroke();
        }
        if (cell.walls.includes(CELL_WALL_WEST)) {
          ctx.beginPath();
          ctx.moveTo(cell.x * state.cellSize, (cell.y + 1) * state.cellSize);
          ctx.lineTo(cell.x * state.cellSize, cell.y * state.cellSize);
          ctx.stroke();
        }
      }
    })
  });

  // If solving, show the path
  if (state.isSolving) {
    ctx.strokeStyle = 'black';
    ctx.fillStyle = '#229954';
    const radius = ~~(state.cellSize / 6);
    for (var idx = 0; idx < state.traveller.idx; idx++) {
      const place = state.solutionPath[idx];
      const currCenterX = place.x * state.cellSize + ~~(state.cellSize / 2);
      const currCenterY = place.y * state.cellSize + ~~(state.cellSize / 2);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(currCenterX, currCenterY, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // draw the connector
      if (idx > 0) {
        const prev = state.solutionPath[idx - 1];
        const prevCenterX = prev.x * state.cellSize + ~~(state.cellSize / 2);
        const prevCenterY = prev.y * state.cellSize + ~~(state.cellSize / 2);
        const isHorizontal = prevCenterY === currCenterY;
        if (isHorizontal)
          ctx.fillRect(prevCenterX, prevCenterY - radius, currCenterX - prevCenterX, radius * 2);
        else
          ctx.fillRect(prevCenterX - radius, prevCenterY, radius * 2, currCenterY - prevCenterY);
      }
    }
  }
};

const loop = (time) => {
  update(time);
  draw(time);
  requestAnimationFrame(loop);
};

const resize = () => {
  // determine canvas size, by taking 20% off the width, unless the width
  const pctCanvasCoverage = 0.8; // 80% of the screen is canvas
  const maxMazeWidth = window.innerWidth * 0.8; // 80% of the screen is canvas
  const maxMazeHeight = window.innerHeight * 0.7; // 50% of the screen is canvas
  state.cellSize = Math.min(~~(maxMazeWidth / state.numXCells), ~~(maxMazeHeight / state.numYCells))
  canvas.width = state.cellSize * state.numXCells;
  canvas.height = state.cellSize * state.numYCells;
};

const fetchMazeData = (numXCells, numYCells) =>
  fetch(`/api/v1/generate-maze/${numXCells}/${numYCells}`)
    .then(response => response.json());

const onChangeSize = () => {
  const numXCells = Number(document.getElementById('txtNumXCells').value)
  const numYCells = Number(document.getElementById('txtNumYCells').value)
  fetchMazeData(numXCells, numYCells)
    .then(mazeData => {
      state.mazeData = mazeData;
      state.numXCells = mazeData.length;
      state.numYCells = mazeData[0].length;
      state.startCell = { x: 0, y: 0 };
      state.endCell = { x: numXCells - 1, y: numYCells - 1 };
      state.solutionPath = [];
      state.isSolving = false;
      resize();
  });
};

const mouseEventHandler = (e) => {
  switch(e.type) {
    case 'mouseup':
    case 'mousedown':
      state.mouse.isDown = (e.type === 'mousedown');
      if (e.type === 'mouseup') {
        state.mouse.clicked = true;
      }
      break;
    case 'mousemove':
      state.mouse.x = e.offsetX;
      state.mouse.y = e.offsetY;
      break;
    default:
      break;
  }
};

const init = () => {
  canvas.addEventListener('mousemove', mouseEventHandler);
  canvas.addEventListener('mousedown', mouseEventHandler);
  canvas.addEventListener('mouseup', mouseEventHandler);
  onChangeSize();
  requestAnimationFrame(loop);
};
init();