// maze-gen-server index.js

const compression = require('compression');
const express = require('express');
const url = require('url');
const mazeGen = require('../lib/maze-gen');

// TODO: add CORS?
const app = express();
app.use(compression());

// Routing constants
const API_BASE = '/api/v1';
const GENERATE_MAZE_BASE_ROUTE = `${API_BASE}/generate-maze`;

////////////////////////////////////////////////////////////////////////////////////////
// Route
const GENERATE_MAZE_WITH_DIMENSIONS_ROUTE = `${GENERATE_MAZE_BASE_ROUTE}/:width/:height`;
app.get(GENERATE_MAZE_WITH_DIMENSIONS_ROUTE, (req, res) => {
  console.log(`generateMaze() - ${req.url}`);
  const start = Date.now();
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
  const timeTaken = Date.now() - start;
  console.log(`  time taken: ${timeTaken} ms  size: ${result.length/1000} KB` );
  return res
    .status(200)
    .send(result);
});

////////////////////////////////////////////////////////////////////////////////////////
// Route
app.get(GENERATE_MAZE_BASE_ROUTE, (req, res) => {
  return res
    .status(200)
    .sendFile(`${__dirname}/generate-maze-help.html`)
});


////////////////////////////////////////////////////////////////////////////////////////
// Route
app.use('/', express.static(`${__dirname}/../client`))
app.use('/sample', express.static(`${__dirname}/../sample`))

////////////////////////////////////////////////////////////////////////////////////////
// Server start
app.listen(3000, () => {
  console.log('----------------------------------------------------------------------------');
  console.log('Server running at http://localhost:3000/');
});