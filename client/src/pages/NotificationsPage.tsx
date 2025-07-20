import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Badge,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Notifications,
  NotificationsActive,
  NotificationsOff,
  LocalParking,
  DirectionsCar,
  Payment,
  Warning,
  Info,
  CheckCircle,
  Delete,
  Settings,
  MarkEmailRead,
  MarkEmailUnread,
  FilterList,
  Refresh
} from '@mui/icons-material';
import Layout from '../components/Layout';
import api from '../services/api';

interface Notification {
  id: string;
  type: 'parking' | 'ride' | 'payment' | 'system' | 'promo';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  metadata?: any;
}

interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  parking: boolean;
  rides: boolean;
  payments: boolean;
  system: boolean;
  promos: boolean;
}

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    email: true,
    push: true,
    sms: false,
    parking: true,
    rides: true,
    payments: true,
    system: true,
    promos: false
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [settingsDialog, setSettingsDialog] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchNotifications();
    fetchSettings();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (err) {
      setError('Failed to fetch notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await api.get('/notifications/settings');
      setSettings(response.data);
    } catch (err) {
      console.error('Error fetching notification settings:', err);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (err) {
      setError('Failed to mark notification as read');
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch('/notifications/mark-all-read');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setSuccess('All notifications marked as read');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to mark all notifications as read');
      console.error('Error marking all notifications as read:', err);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      setNotifications(notifications.filter(n => n.id !== notificationId));
      setSuccess('Notification deleted');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete notification');
      console.error('Error deleting notification:', err);
    }
  };

  const handleUpdateSettings = async (newSettings: NotificationSettings) => {
    try {
      await api.put('/notifications/settings', newSettings);
      setSettings(newSettings);
      setSettingsDialog(false);
      setSuccess('Notification settings updated');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update notification settings');
      console.error('Error updating notification settings:', err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'parking': return <LocalParking />;
      case 'ride': return <DirectionsCar />;
      case 'payment': return <Payment />;
      case 'system': return <Info />;
      case 'promo': return <CheckCircle />;
      default: return <Notifications />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'parking': return 'primary';
      case 'ride': return 'secondary';
      case 'payment': return 'success';
      case 'system': return 'info';
      case 'promo': return 'warning';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 0) return !notification.read; // Unread
    if (activeTab === 1) return notification.read; // Read
    if (activeTab === 2) return notification.priority === 'high'; // High Priority
    return true; // All
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const highPriorityCount = notifications.filter(n => n.priority === 'high').length;

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Notifications
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Stay updated with your parking and ride activities
            </Typography>
          </Box>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<Settings />}
              onClick={() => setSettingsDialog(true)}
            >
              Settings
            </Button>
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={fetchNotifications}
            >
              Refresh
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Stats */}
        <Box display="flex" flexWrap="wrap" gap={3} mb={4}>
          <Card sx={{ flex: '1 1 200px' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Badge badgeContent={unreadCount} color="error">
                  <Avatar sx={{ bgcolor: 'primary.light' }}>
                    <Notifications />
                  </Avatar>
                </Badge>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {notifications.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Notifications
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ flex: '1 1 200px' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'warning.light' }}>
                  <Warning />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {highPriorityCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    High Priority
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ flex: '1 1 200px' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'success.light' }}>
                  <MarkEmailRead />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {notifications.filter(n => n.read).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Read
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Tabs and Notifications */}
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
                <Tab 
                  label={
                    <Badge badgeContent={unreadCount} color="error">
                      Unread
                    </Badge>
                  } 
                />
                <Tab label="Read" />
                <Tab 
                  label={
                    <Badge badgeContent={highPriorityCount} color="error">
                      High Priority
                    </Badge>
                  } 
                />
                <Tab label="All" />
              </Tabs>
              
              {activeTab === 0 && unreadCount > 0 && (
                <Button
                  variant="outlined"
                  startIcon={<MarkEmailRead />}
                  onClick={handleMarkAllAsRead}
                >
                  Mark All as Read
                </Button>
              )}
            </Box>

            {filteredNotifications.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Notifications sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  {activeTab === 0 ? 'No unread notifications' : 
                   activeTab === 1 ? 'No read notifications' :
                   activeTab === 2 ? 'No high priority notifications' :
                   'No notifications'}
                </Typography>
              </Box>
            ) : (
              <List>
                {(filteredNotifications || []).map((notification, index) => (
                  <React.Fragment key={notification.id}>
                    <ListItem
                      sx={{
                        bgcolor: notification.read ? 'transparent' : 'action.hover',
                        borderRadius: 1,
                        mb: 1
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: `${getNotificationColor(notification.type)}.light` }}>
                          {getNotificationIcon(notification.type)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body1" fontWeight={notification.read ? 'normal' : 'bold'}>
                              {notification.title}
                            </Typography>
                            <Chip
                              label={notification.priority}
                              color={getPriorityColor(notification.priority) as any}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {notification.message}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : 'N/A'}
                            </Typography>
                          </Box>
                        }
                      />
                      <Box display="flex" gap={1}>
                        {!notification.read && (
                          <Tooltip title="Mark as Read">
                            <IconButton
                              size="small"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              <MarkEmailRead />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteNotification(notification.id)}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </ListItem>
                    {index < (filteredNotifications || []).length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </CardContent>
        </Card>

        {/* Settings Dialog */}
        <Dialog open={settingsDialog} onClose={() => setSettingsDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            Notification Settings
          </DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={4} mt={2}>
              {/* Delivery Methods */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Delivery Methods
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.email}
                        onChange={(e) => setSettings({ ...settings, email: e.target.checked })}
                      />
                    }
                    label="Email Notifications"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.push}
                        onChange={(e) => setSettings({ ...settings, push: e.target.checked })}
                      />
                    }
                    label="Push Notifications"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.sms}
                        onChange={(e) => setSettings({ ...settings, sms: e.target.checked })}
                      />
                    }
                    label="SMS Notifications"
                  />
                </Box>
              </Box>

              {/* Notification Types */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Notification Types
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.parking}
                        onChange={(e) => setSettings({ ...settings, parking: e.target.checked })}
                      />
                    }
                    label="Parking Notifications"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.rides}
                        onChange={(e) => setSettings({ ...settings, rides: e.target.checked })}
                      />
                    }
                    label="Ride Notifications"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.payments}
                        onChange={(e) => setSettings({ ...settings, payments: e.target.checked })}
                      />
                    }
                    label="Payment Notifications"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.system}
                        onChange={(e) => setSettings({ ...settings, system: e.target.checked })}
                      />
                    }
                    label="System Notifications"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.promos}
                        onChange={(e) => setSettings({ ...settings, promos: e.target.checked })}
                      />
                    }
                    label="Promotional Notifications"
                  />
                </Box>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSettingsDialog(false)}>Cancel</Button>
            <Button 
              onClick={() => handleUpdateSettings(settings)} 
              variant="contained"
            >
              Save Settings
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default NotificationsPage; 