  // maze-render.js

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const state = {
  numXCells: 0,
  numYCells: 0,
  cellSize: 0
};

const update = (time) => {};

const draw = (time) => {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.lineWidth = 2;
  ctx.strokeStyle = 'white';
  state.mazeData.forEach((cellColumn, x) => {
    cellColumn.forEach((cell, y) => {
      // TODO: check if walls.length > 0
      if (cell.walls.includes('north')) {
        ctx.beginPath();
        ctx.moveTo(cell.x * state.cellSize, cell.y * state.cellSize);
        ctx.lineTo((cell.x + 1) * state.cellSize, cell.y * state.cellSize);
        ctx.stroke();
      }
      if (cell.walls.includes('east')) {
        ctx.beginPath();
        ctx.moveTo((cell.x + 1) * state.cellSize, cell.y * state.cellSize);
        ctx.lineTo((cell.x + 1) * state.cellSize, (cell.y + 1) * state.cellSize);
        ctx.stroke();
      }
      if (cell.walls.includes('south')) {
        ctx.beginPath();
        ctx.moveTo((cell.x + 1) * state.cellSize, (cell.y + 1) * state.cellSize);
        ctx.lineTo(cell.x * state.cellSize, (cell.y + 1) * state.cellSize);
        ctx.stroke();
      }
      if (cell.walls.includes('west')) {
        ctx.beginPath();
        ctx.moveTo(cell.x * state.cellSize, (cell.y + 1) * state.cellSize);
        ctx.lineTo(cell.x * state.cellSize, cell.y * state.cellSize);
        ctx.stroke();
      }
    })
  })
};

const loop = (time) => {
  update(time);
  draw(time);
  requestAnimationFrame(loop);
};

const resize = () => {
  // determine canvas size, by taking 20% off the width, unless the width
  const maxMazeWidth = window.innerWidth * 0.8;
  state.cellSize = ~~(maxMazeWidth / state.numXCells);
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
      resize();
  });
}

const init = () => {
  const numXCells = Number(document.getElementById('txtNumXCells').value)
  const numYCells = Number(document.getElementById('txtNumYCells').value)
  fetchMazeData(numXCells, numYCells).then((mazeData) => {
    state.mazeData = mazeData;
    state.numXCells = mazeData.length;
    state.numYCells = mazeData[0].length;
    resize();
    requestAnimationFrame(loop);
  })
};
init();