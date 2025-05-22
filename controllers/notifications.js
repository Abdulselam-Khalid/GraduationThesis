const Notification = require('../models/Notification');

// ✅ Create a new notification
const createNotification = async (req, res) => {
  try {
    const data = req.body;
    const notification = new Notification(data);
    const savedNotification = await notification.save();
    res.status(201).json(savedNotification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Failed to create notification', error: error.message });
  }
};

// ✅ Get all notifications for a user, sorted by newest first
const getUserNotifications = async (req, res) => {
  const userId = req.userID;
  try {
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
  }
};

// ✅ Mark a notification as read (set isRead=true and readAt=current date)
const markNotificationRead = async (req, res) => {
  const notificationId = req.params.id;
  try {
    const updatedNotification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!updatedNotification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json(updatedNotification);
  } catch (error) {
    console.error('Error marking notification read:', error);
    res.status(500).json({ message: 'Failed to mark notification as read', error: error.message });
  }
};

// ✅ Delete a notification by ID
const deleteNotification = async (req, res) => {
  const notificationId = req.params.id;
  try {
    const deletedNotification = await Notification.findByIdAndDelete(notificationId);

    if (!deletedNotification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Failed to delete notification', error: error.message });
  }
};

module.exports = {
  createNotification,
  getUserNotifications,
  markNotificationRead,
  deleteNotification,
};
