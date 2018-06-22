// maze-gen-server index.js

const express = require('express');
const app = express();
const mazeGen = require('../lib/maze-gen');

// const mazeGen = require('./maze-gen');

const API_BASE = '/api/v1';
const GENERATE_MAZE_BASE_ROUTE = `${API_BASE}/generateMaze`;
const GENERATE_MAZE_WITH_DIMENSIONS_ROUTE = `${GENERATE_MAZE_BASE_ROUTE}/:width/:height`;

app.get('/', (req, res) =>
  res
    .status(200)
    .sendFile(`${__dirname}/index.html`)
);

app.get(GENERATE_MAZE_WITH_DIMENSIONS_ROUTE, (req, res) => {
  console.log(`generateMaze() - ${req.url}`);
  const { width, height } = req.params;
  const areDimensionsValid = (
    Number(width) !== NaN && Number(height) !== NaN &&
    Number.isInteger(Number(width)) && Number.isInteger(Number(height))
  );
  if (!areDimensionsValid) {
    return res.redirect(GENERATE_MAZE_BASE_ROUTE);
  }
  const iWidth = ~~Number(width);
  const iHeight = ~~Number(height);
  const mazeData = mazeGen.generateMaze(iWidth, iHeight);
  return res
    .status(200)
    .contentType("application/json")
    .send(JSON.stringify(mazeData));
});

app.get(GENERATE_MAZE_BASE_ROUTE, (req, res) => {
  return res
    .status(200)
    .sendFile(`${__dirname}/generateMazeHelp.html`)
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});