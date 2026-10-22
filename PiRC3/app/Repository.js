/**
 * PiRC3 — repository layer
 *
 * The allocation engine and stablecoin mechanism (service/) are plain
 * in-memory classes. This repository gives the API layer a single place
 * to keep instances alive across requests.
 *
 * Design-stage: this is process-memory only and resets on restart. Swap
 * for real persistence (the sqlite exchange log in db.js, or another
 * store) before this is anything other than a demo/API prototype.
 */

'use strict';

const allocationConfigs = new Map(); // allocationId -> raw config object
const stablecoinInstances = new Map(); // instanceId -> StablecoinMechanism

function saveAllocationConfig(config) {
  allocationConfigs.set(config.allocationId, config);
  return config;
}

function getAllocationConfig(allocationId) {
  return allocationConfigs.get(allocationId);
}

function listAllocationConfigs() {
  return [...allocationConfigs.values()];
}

function saveStablecoinInstance(instanceId, instance) {
  stablecoinInstances.set(instanceId, instance);
  return instance;
}

function getStablecoinInstance(instanceId) {
  return stablecoinInstances.get(instanceId);
}

function listStablecoinInstanceIds() {
  return [...stablecoinInstances.keys()];
}

module.exports = {
  saveAllocationConfig,
  getAllocationConfig,
  listAllocationConfigs,
  saveStablecoinInstance,
  getStablecoinInstance,
  listStablecoinInstanceIds,
};
