'use strict';

const express = require('express');
const controller = require('../controllers/stablecoin.controller');

const router = express.Router();

router.post('/', controller.createInstance);
router.get('/', controller.listInstances);
router.get('/:id', controller.getAuditTrail);
router.post('/:id/deposits', controller.addDeposit);
router.post('/:id/mint', controller.mint);
router.post('/:id/redeem', controller.redeem);
router.post('/:id/peg-check', controller.checkPeg);

module.exports = router;
