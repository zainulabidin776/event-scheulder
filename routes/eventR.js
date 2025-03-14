const express = require('express');
const router = express.Router();
const { createEvent, getEvents } = require('../controllers/eventC');


router.post('/', createEvent);
router.get('/', getEvents);

module.exports = router;