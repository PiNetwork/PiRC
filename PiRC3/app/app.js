/**
 * PiRC3 — app bootstrap
 *
 * Wires up the Express application: middleware, routes, error handling.
 * Kept separate from index.js (the thing that actually listens on a port)
 * so it can be imported directly in tests without binding a socket.
 */

'use strict';

const express = require('express');
const allocationRoutes = require('../Api/routes/allocation.routes');
const stablecoinRoutes = require('../Api/routes/stablecoin.routes');
const errorHandler = require('../Api/middleware/errorHandler');

function createApp() {
  const app = express();
  app.use(express.json());

  app.get('/health', (req, res) => res.json({ status: 'ok' }));

  app.use('/api/allocations', allocationRoutes);
  app.use('/api/stablecoins', stablecoinRoutes);

  app.use((req, res) => res.status(404).json({ error: 'Not found' }));
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
