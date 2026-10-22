'use strict';

const { ReserveLedger, StablecoinMechanism } = require('../../service/stablecoinMechanism');
const repository = require('../../database/repository');

/** POST /api/stablecoins — create a new stablecoin instance (pegTarget, minCollateralizationRatio, ...). */
function createInstance(req, res) {
  try {
    const { instanceId, ...params } = req.body;
    if (!instanceId) return res.status(400).json({ error: 'instanceId is required' });
    const instance = new StablecoinMechanism({ ...params, reserveLedger: new ReserveLedger() });
    repository.saveStablecoinInstance(instanceId, instance);
    res.status(201).json({ instanceId, auditTrail: instance.getAuditTrail() });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

function listInstances(req, res) {
  res.json(repository.listStablecoinInstanceIds());
}

function _getInstanceOr404(req, res) {
  const instance = repository.getStablecoinInstance(req.params.id);
  if (!instance) {
    res.status(404).json({ error: `Unknown stablecoin instance: ${req.params.id}` });
    return null;
  }
  return instance;
}

/** GET /api/stablecoins/:id — full audit trail. */
function getAuditTrail(req, res) {
  const instance = _getInstanceOr404(req, res);
  if (!instance) return;
  res.json(instance.getAuditTrail());
}

/** POST /api/stablecoins/:id/deposits — add a reserve deposit. */
function addDeposit(req, res) {
  try {
    const instance = _getInstanceOr404(req, res);
    if (!instance) return;
    const entry = instance.reserveLedger.addDeposit(req.body);
    res.status(201).json(entry);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

/** POST /api/stablecoins/:id/mint */
function mint(req, res) {
  try {
    const instance = _getInstanceOr404(req, res);
    if (!instance) return;
    const entry = instance.mint(req.body);
    res.status(201).json(entry);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

/** POST /api/stablecoins/:id/redeem */
function redeem(req, res) {
  try {
    const instance = _getInstanceOr404(req, res);
    if (!instance) return;
    const result = instance.redeem(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

/** POST /api/stablecoins/:id/peg-check  body: { observedPrice, targetPrice? } */
function checkPeg(req, res) {
  try {
    const instance = _getInstanceOr404(req, res);
    if (!instance) return;
    const { observedPrice, targetPrice } = req.body;
    const record = instance.checkPeg(observedPrice, targetPrice);
    res.json(record);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

module.exports = { createInstance, listInstances, getAuditTrail, addDeposit, mint, redeem, checkPeg };
