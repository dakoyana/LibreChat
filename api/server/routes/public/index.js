const express = require('express');
const agents = require('./agents');

const router = express.Router();

// Public, read-only namespace
router.use('/agents', agents);

module.exports = router;
