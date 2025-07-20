import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Tooltip,
  Chip,
  Grid,
  Rating,
  LinearProgress
} from '@mui/material';
import {
  Person,
  Edit,
  Save,
  Cancel,
  DirectionsCar,
  Payment,
  Security,
  Notifications,
  Star,
  Delete,
  Add,
  Refresh,
  LocationOn,
  Phone,
  Email,
  CalendarToday,
  LocalParking,
  DirectionsWalk
} from '@mui/icons-material';
import Layout from '../components/Layout';
import api from '../services/api';
import { useUser } from '../contexts/UserContext';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  avatar?: string;
  rating: number;
  totalRides: number;
  totalParking: number;
  memberSince: string;
  preferences: UserPreferences;
  vehicles: Vehicle[];
  paymentMethods: PaymentMethod[];
}

interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    shareLocation: boolean;
    shareRideHistory: boolean;
    shareParkingHistory: boolean;
  };
  accessibility: {
    wheelchairAccessible: boolean;
    audioAnnouncements: boolean;
    largeText: boolean;
  };
}

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: string;
  licensePlate: string;
  color: string;
  isDefault: boolean;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'wallet';
  name: string;
  lastFour?: string;
  isDefault: boolean;
}

const ProfilePage: React.FC = () => {
  const { user, loading, error: userError, fetchUser } = useUser();
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [vehicleDialog, setVehicleDialog] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: ''
  });

  // Defensive fallback for vehicles and paymentMethods
  const vehicles = (user && Array.isArray(user.vehicles)) ? user.vehicles : [];
  const paymentMethods = (user && Array.isArray(user.paymentMethods)) ? user.paymentMethods : [];

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to view your profile');
      return;
    }
    
    // Update edit data when user data is available
    if (user) {
      setEditData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || '',
        address: user.address || ''
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      // Transform the data to match backend expectations
      const updateData = {
        name: `${editData.firstName} ${editData.lastName}`.trim(),
        phone: editData.phone
      };
      
      await api.put('/users/profile', updateData);
      
      // Refresh the profile data
      await fetchUser();
      setEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update profile');
      console.error('Error updating profile:', err);
    }
  };

  const handleCancelEdit = () => {
    setEditData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      dateOfBirth: user?.dateOfBirth || '',
      address: user?.address || ''
    });
    setEditing(false);
  };

  // Note: These functions are commented out as they're not currently implemented in the backend
  // They can be uncommented and implemented when the backend endpoints are ready
  
  /*
  const handleUpdatePreferences = async (newPreferences: UserPreferences) => {
    if (!user) return;

    try {
      const response = await api.put('/users/preferences', newPreferences);
      // Update user context instead of local state
      setSuccess('Preferences updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update preferences');
      console.error('Error updating preferences:', err);
    }
  };

  const handleAddVehicle = async (vehicleData: Omit<Vehicle, 'id'>) => {
    if (!user) return;

    try {
      const response = await api.post('/users/vehicles', vehicleData);
      setVehicleDialog(false);
      setSuccess('Vehicle added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to add vehicle');
      console.error('Error adding vehicle:', err);
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (!user) return;

    try {
      await api.delete(`/users/vehicles/${vehicleId}`);
      setSuccess('Vehicle deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete vehicle');
      console.error('Error deleting vehicle:', err);
    }
  };

  const handleSetDefaultVehicle = async (vehicleId: string) => {
    if (!user) return;

    try {
      await api.patch(`/users/vehicles/${vehicleId}/default`);
      setSuccess('Default vehicle updated!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update default vehicle');
      console.error('Error updating default vehicle:', err);
    }
  };
  */

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (!user) {
    // Show a more helpful error if the user is not found or unauthorized
    return (
      <Layout>
        <Box>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error === 'Failed to fetch user data'
              ? (
                <>
                  Failed to load user profile. This can happen if your session expired or your account was changed.<br />
                  Please try logging in again.
                </>
              )
              : error || 'Failed to load user profile. Please try refreshing the page or logging in again.'}
          </Alert>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/auth';
            }}
          >
            Log In Again
          </Button>
          <Button variant="outlined" onClick={fetchUser} sx={{ ml: 2 }}>
            Retry Loading Profile
          </Button>
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
              Profile
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your account settings and preferences
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={fetchUser}
          >
            Refresh
          </Button>
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



        {/* Profile Overview */}
        <Box display="flex" flexWrap="wrap" gap={3} mb={4}>
          <Card sx={{ flex: '1 1 300px' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={3} mb={3}>
                <Avatar
                  sx={{ width: 80, height: 80, bgcolor: 'primary.light' }}
                  src={user.avatar}
                >
                  <Person sx={{ fontSize: 40 }} />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {(user.firstName || 'N/A')} {(user.lastName || '')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Member since {user.memberSince ? new Date(user.memberSince).toLocaleDateString() : 'N/A'}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} mt={1}>
                    <Rating value={typeof user.rating === 'number' ? user.rating : 0} readOnly size="small" />
                    <Typography variant="body2" color="text.secondary">
                      ({typeof user.rating === 'number' ? user.rating : 'N/A'})
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box display="flex" gap={2}>
                {editing ? (
                  <>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleSaveProfile}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Cancel />}
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={() => setEditing(true)}
                  >
                    Edit Profile
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ flex: '1 1 200px' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Avatar sx={{ bgcolor: 'primary.light' }}>
                  <LocalParking />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {typeof user.totalParking === 'number' ? user.totalParking : 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Parking Sessions
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ flex: '1 1 200px' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Avatar sx={{ bgcolor: 'secondary.light' }}>
                  <DirectionsCar />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {typeof user.totalRides === 'number' ? user.totalRides : 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Rides
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Tabs */}
        <Card>
          <CardContent>
            <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
              <Tab label="Personal Info" />
              <Tab label="Vehicles" />
              <Tab label="Payment Methods" />
              <Tab label="Preferences" />
            </Tabs>

            {/* Personal Info Tab */}
            {activeTab === 0 && (
              <Box>
                <Box display="flex" flexWrap="wrap" gap={3} mb={4}>
                  <Box flex="1 1 45%">
                    <TextField
                      label="First Name"
                      value={editData.firstName}
                      onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                      fullWidth
                      disabled={!editing}
                    />
                  </Box>
                  <Box flex="1 1 45%">
                    <TextField
                      label="Last Name"
                      value={editData.lastName}
                      onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                      fullWidth
                      disabled={!editing}
                    />
                  </Box>
                  <Box flex="1 1 45%">
                    <TextField
                      label="Email"
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      fullWidth
                      disabled={!editing}
                      type="email"
                    />
                  </Box>
                  <Box flex="1 1 45%">
                    <TextField
                      label="Phone"
                      value={editData.phone}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      fullWidth
                      disabled={!editing}
                    />
                  </Box>
                  <Box flex="1 1 45%">
                    <TextField
                      label="Date of Birth"
                      value={editData.dateOfBirth}
                      onChange={(e) => setEditData({ ...editData, dateOfBirth: e.target.value })}
                      fullWidth
                      disabled={!editing}
                      type="date"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Box>
                  <Box flex="1 1 100%">
                    <TextField
                      label="Address"
                      value={editData.address}
                      onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                      fullWidth
                      disabled={!editing}
                      multiline
                      rows={3}
                    />
                  </Box>
                </Box>
              </Box>
            )}

            {/* Vehicles Tab */}
            {activeTab === 1 && (
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h6">Your Vehicles</Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setVehicleDialog(true)}
                  >
                    Add Vehicle
                  </Button>
                </Box>

                {vehicles.length === 0 ? (
                  <Box textAlign="center" py={4}>
                    <DirectionsCar sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      No vehicles added yet
                    </Typography>
                    <Button variant="contained" startIcon={<Add />}>
                      Add Your First Vehicle
                    </Button>
                  </Box>
                ) : (
                  <List>
                    {vehicles.map((vehicle) => (
                      <ListItem key={vehicle.id}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.light' }}>
                            <DirectionsCar />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="body1" fontWeight="bold">
                                {vehicle.year || 'N/A'} {vehicle.make || ''} {vehicle.model || ''}
                              </Typography>
                              {vehicle.isDefault && (
                                <Chip label="Default" color="primary" size="small" />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                License: {vehicle.licensePlate || 'N/A'} • Color: {vehicle.color || 'N/A'}
                              </Typography>
                            </Box>
                          }
                        />
                        <Box display="flex" gap={1}>
                          {!vehicle.isDefault && (
                            <Tooltip title="Set as Default">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  // TODO: Implement when backend is ready
                                  console.log('Set default vehicle:', vehicle.id);
                                }}
                              >
                                <Star />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Delete Vehicle">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                // TODO: Implement when backend is ready
                                console.log('Delete vehicle:', vehicle.id);
                              }}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            )}

            {/* Payment Methods Tab */}
            {activeTab === 2 && (
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h6">Payment Methods</Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setPaymentDialog(true)}
                  >
                    Add Payment Method
                  </Button>
                </Box>

                {paymentMethods.length === 0 ? (
                  <Box textAlign="center" py={4}>
                    <Payment sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      No payment methods added yet
                    </Typography>
                    <Button variant="contained" startIcon={<Add />}>
                      Add Payment Method
                    </Button>
                  </Box>
                ) : (
                  <List>
                    {paymentMethods.map((method) => (
                      <ListItem key={method.id}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'success.light' }}>
                            <Payment />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="body1" fontWeight="bold">
                                {method.name || 'N/A'}
                              </Typography>
                              {method.isDefault && (
                                <Chip label="Default" color="primary" size="small" />
                              )}
                            </Box>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary">
                              {method.type ? method.type.toUpperCase() : 'N/A'}
                              {method.lastFour ? ` • ****${method.lastFour}` : ''}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            )}

            {/* Preferences Tab */}
            {activeTab === 3 && (
              <Box>
                {/* Implementation of Preferences Tab */}
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Layout>
  );
};

export default ProfilePage;