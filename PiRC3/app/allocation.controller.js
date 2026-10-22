'use strict';

const { PiRCAllocationEngine } = require('../../service/allocationEngine');
const repository = require('../../database/repository');

/** POST /api/allocations — register a new allocation config and return its pool summary. */
function createAllocation(req, res) {
  try {
    const config = req.body;
    const engine = new PiRCAllocationEngine(config); // throws on invalid config
    repository.saveAllocationConfig(config);
    res.status(201).json(engine.summarize());
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

/** GET /api/allocations — list allocation configs registered this session. */
function listAllocations(req, res) {
  res.json(repository.listAllocationConfigs().map((c) => ({
    allocationId: c.allocationId,
    totalSupply: c.totalSupply,
  })));
}

/** GET /api/allocations/:id — summary for one allocation. */
function getAllocation(req, res) {
  const config = repository.getAllocationConfig(req.params.id);
  if (!config) return res.status(404).json({ error: `Unknown allocationId: ${req.params.id}` });
  const engine = new PiRCAllocationEngine(config);
  res.json(engine.summarize());
}

/** GET /api/allocations/:id/price-curve?steps=10 */
function getPriceCurve(req, res) {
  const config = repository.getAllocationConfig(req.params.id);
  if (!config) return res.status(404).json({ error: `Unknown allocationId: ${req.params.id}` });
  const steps = Number(req.query.steps) || 10;
  const engine = new PiRCAllocationEngine(config);
  res.json(engine.computeEffectivePriceCurve(steps));
}

/** POST /api/allocations/:id/participant — compute one participant's allocation. */
function computeParticipant(req, res) {
  try {
    const config = repository.getAllocationConfig(req.params.id);
    if (!config) return res.status(404).json({ error: `Unknown allocationId: ${req.params.id}` });
    const engine = new PiRCAllocationEngine(config);
    const result = engine.computeParticipantAllocation(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

module.exports = { createAllocation, listAllocations, getAllocation, getPriceCurve, computeParticipant };
