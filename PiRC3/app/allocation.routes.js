'use strict';

const express = require('express');
const controller = require('../controllers/allocation.controller');

const router = express.Router();

router.post('/', controller.createAllocation);
router.get('/', controller.listAllocations);
router.get('/:id', controller.getAllocation);
router.get('/:id/price-curve', controller.getPriceCurve);
router.post('/:id/participant', controller.computeParticipant);

module.exports = router;
