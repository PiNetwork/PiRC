/**
 * PiRC3 — server entry point
 *
 * Run with: node app/index.js
 * (or `npm start` from the project root)
 */

'use strict';

const createApp = require('./app');

const PORT = process.env.PORT || 3000;
const app = createApp();

app.listen(PORT, () => {
  console.log(`PiRC3 API listening on port ${PORT}`);
  console.log('Design-stage code — see README.md before using this with real funds.');
});
