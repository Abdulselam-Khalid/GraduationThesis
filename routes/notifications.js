const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notifications');

router.post('/', notificationController.createNotification);
router.get('/user/:userId', notificationController.getUserNotifications);
router.patch('/:id/read', notificationController.markNotificationRead);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
