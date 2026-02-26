const express = require('express');
const router = express.Router();
const clubController = require('../controllers/clubController');
const combinedAuth = require('../middleware/combinedAuth');
const organizerAuth = require('../middleware/organizerAuth');

// Get all clubs (with optional search)
router.get('/', combinedAuth, clubController.getClubs);

// Get club by ID
router.get('/:clubId', combinedAuth, clubController.getClubById);

// Join a club
router.post('/join', combinedAuth, clubController.joinClub);

// Exit a club
router.post('/exit', combinedAuth, clubController.exitClub);

// Get chat history for a club
router.get('/:clubId/chat', combinedAuth, clubController.getClubChat);

// Get club members
router.get('/:clubId/members', combinedAuth, clubController.getClubMembers);

// Organizer: Delete a chat message by ID
router.delete('/:clubId/chat/:messageId', organizerAuth, clubController.deleteClubChatMessage);

module.exports = router; 