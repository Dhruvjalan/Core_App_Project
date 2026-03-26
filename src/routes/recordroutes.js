const express = require('express');
const router = express.Router();
const { searchRecords } = require('../controllers/recordController');

// POST request because we are sending a complex 'filters' object in the body
router.post('/search', searchRecords);

module.exports = router;