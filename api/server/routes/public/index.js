const express = require('express');
const agents = require('./agents');

const router = express.Router();

// Sanity endpoint to confirm router is mounted
router.get('/ping', (_req, res) => res.json({ ok: true }));

// Public, read-only namespace
router.use('/agents', agents);

module.exports = router;
