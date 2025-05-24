const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const notificationController = require("../controllers/notifications");

router.use(auth);
router.post("/", notificationController.createNotification);
router.get("/user/:userId", notificationController.getUserNotifications);
router.get("/group/:groupId", notificationController.getGroupNotifications);
router.patch("/:id/read", notificationController.markNotificationRead);
router.delete("/:id", notificationController.deleteNotification);

module.exports = router;
