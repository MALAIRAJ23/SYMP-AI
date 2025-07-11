const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const router = express.Router();
router.use(cors());
router.use(express.json());

// Removed /chatbot route to prevent conflicts with main backend

module.exports = router; 