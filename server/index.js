// maze-gen-server index.js

const compression = require('compression');
const express = require('express');
const url = require('url');
const mazeGen = require('../lib/maze-gen');

const app = express();
app.use(compression());

// Routing constants
const API_BASE = '/api/v1';
const GENERATE_MAZE_BASE_ROUTE = `${API_BASE}/generateMaze`;
const GENERATE_MAZE_WITH_DIMENSIONS_ROUTE = `${GENERATE_MAZE_BASE_ROUTE}/:width/:height`;

////////////////////////////////////////////////////////////////////////////////////////
// Route
app.get('/', (req, res) =>
  res
    .status(200)
    .sendFile(`${__dirname}/index.html`)
);

////////////////////////////////////////////////////////////////////////////////////////
// Route
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

  // Check the query string for pretty=true
  const query = url.parse(req.url, true).query;
  const isPretty = query.pretty === 'true';
  const result = isPretty ? JSON.stringify(mazeData, undefined, 2) : JSON.stringify(mazeData);
  res.setHeader('Content-Type', 'application/json');
  // NOTE: this is rather aggressive on avoiding caching; investigate later if needed
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Content-Length', result.length);

  return res
    .status(200)
    .send(result);
});

////////////////////////////////////////////////////////////////////////////////////////
// Route
app.get(GENERATE_MAZE_BASE_ROUTE, (req, res) => {
  return res
    .status(200)
    .sendFile(`${__dirname}/generateMazeHelp.html`)
});

////////////////////////////////////////////////////////////////////////////////////////
// Server start
app.listen(3000, () => {
  console.log('----------------------------------------------------------------------------');
  console.log('Server running at http://localhost:3000/');
});