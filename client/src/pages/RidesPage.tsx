import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Rating,
  Badge
} from '@mui/material';
import {
  DirectionsCar,
  DirectionsWalk,
  DirectionsBike,
  LocalTaxi,
  LocationOn,
  AccessTime,
  Payment,
  Star,
  Cancel,
  Refresh,
  CheckCircle,
  Schedule,
  Speed,
  Person
} from '@mui/icons-material';
import Layout from '../components/Layout';
import api from '../services/api';

interface RideType {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  basePrice: number;
  pricePerKm: number;
  estimatedTime: string;
  capacity: number;
  features: string[];
}

interface RideBooking {
  id: string;
  rideType: string;
  pickupLocation: string;
  dropoffLocation: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  driver?: {
    id: string;
    name: string;
    rating: number;
    vehicle: string;
    phone: string;
  };
  estimatedPrice: number;
  actualPrice?: number;
  estimatedTime: string;
  createdAt: string;
  scheduledTime?: string;
}

interface Driver {
  id: string;
  name: string;
  rating: number;
  vehicle: string;
  phone: string;
  location: string;
  eta: string;
}

const RidesPage: React.FC = () => {
  const [rideTypes, setRideTypes] = useState<RideType[]>([]);
  const [bookings, setBookings] = useState<RideBooking[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingDialog, setBookingDialog] = useState(false);
  const [selectedRideType, setSelectedRideType] = useState<RideType | null>(null);
  const [bookingData, setBookingData] = useState({
    pickupLocation: '',
    dropoffLocation: '',
    scheduledTime: '',
    passengers: 1
  });
  const [activeStep, setActiveStep] = useState(0);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const rideTypeIcons = {
    taxi: <LocalTaxi />,
    shuttle: <DirectionsCar />,
    erickshaw: <DirectionsBike />,
    walk: <DirectionsWalk />
  };

  useEffect(() => {
    fetchRideData();
  }, []);

  const fetchRideData = async () => {
    try {
      setLoading(true);
      const [typesResponse, bookingsResponse, driversResponse] = await Promise.all([
        api.get('/rides/types'),
        api.get('/rides/bookings'),
        api.get('/rides/drivers')
      ]);
      
      setRideTypes(typesResponse.data);
      setBookings(bookingsResponse.data);
      setDrivers(driversResponse.data);
    } catch (err) {
      setError('Failed to fetch ride data');
      console.error('Error fetching ride data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookRide = (rideType: RideType) => {
    setSelectedRideType(rideType);
    setBookingDialog(true);
    setActiveStep(0);
  };

  const handleNext = () => {
    if (activeStep === 0 && (!bookingData.pickupLocation || !bookingData.dropoffLocation)) {
      setError('Please fill in pickup and dropoff locations');
      return;
    }
    setActiveStep((prev) => prev + 1);
    setError('');
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleBookingSubmit = async () => {
    if (!selectedRideType || !selectedDriver) {
      setError('Please select a ride type and driver');
      return;
    }

    try {
      const response = await api.post('/rides/bookings', {
        rideTypeId: selectedRideType.id,
        driverId: selectedDriver.id,
        pickupLocation: bookingData.pickupLocation,
        dropoffLocation: bookingData.dropoffLocation,
        scheduledTime: bookingData.scheduledTime,
        passengers: bookingData.passengers
      });

      setBookings([...bookings, response.data]);
      setBookingDialog(false);
      setSelectedRideType(null);
      setSelectedDriver(null);
      setBookingData({ pickupLocation: '', dropoffLocation: '', scheduledTime: '', passengers: 1 });
      setActiveStep(0);
      setSuccess('Ride booked successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchRideData();
    } catch (err) {
      setError('Failed to book ride');
      console.error('Error booking ride:', err);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await api.delete(`/rides/bookings/${bookingId}`);
      setBookings(bookings.filter(b => b.id !== bookingId));
      setSuccess('Booking cancelled successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchRideData();
    } catch (err) {
      setError('Failed to cancel booking');
      console.error('Error cancelling booking:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'info';
      case 'in_progress': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Schedule />;
      case 'confirmed': return <CheckCircle />;
      case 'in_progress': return <Speed />;
      case 'completed': return <CheckCircle />;
      case 'cancelled': return <Cancel />;
      default: return <Schedule />;
    }
  };

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
              Last-Mile Rides
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Book your ride from parking to destination
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={fetchRideData}
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

        {/* Stats */}
        <Box display="flex" flexWrap="wrap" gap={3} mb={4}>
          <Card sx={{ flex: '1 1 200px' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'primary.light' }}>
                  <DirectionsCar />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {bookings.filter(b => b.status === 'in_progress').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Rides
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ flex: '1 1 200px' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'success.light' }}>
                  <Person />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {drivers.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Available Drivers
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ flex: '1 1 200px' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'warning.light' }}>
                  <Star />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    4.8
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Average Rating
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Ride Types and Bookings */}
        <Box display="flex" flexWrap="wrap" gap={3}>
          {/* Ride Types */}
          <Box sx={{ flex: '1 1 600px', minWidth: 0 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Available Ride Types
                </Typography>
                
                <Box display="flex" flexWrap="wrap" gap={2}>
                  {(rideTypes || []).map((rideType) => (
                    <Card
                      key={rideType.id}
                      sx={{
                        flex: '1 1 250px',
                        minWidth: 0,
                        cursor: 'pointer',
                        '&:hover': {
                          boxShadow: 4,
                          transform: 'translateY(-2px)'
                        }
                      }}
                      onClick={() => handleBookRide(rideType)}
                    >
                      <CardContent>
                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                          <Avatar sx={{ bgcolor: 'primary.light' }}>
                            {rideType.icon}
                          </Avatar>
                          <Box>
                            <Typography variant="h6" fontWeight="bold">
                              {rideType.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {rideType.description}
                            </Typography>
                          </Box>
                        </Box>

                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Typography variant="h6" color="primary" fontWeight="bold">
                            ${rideType.basePrice}
                          </Typography>
                          <Chip
                            label={`${rideType.capacity} seats`}
                            size="small"
                            color="primary"
                          />
                        </Box>

                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                          <AccessTime fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {rideType.estimatedTime}
                          </Typography>
                        </Box>

                        <Box display="flex" flexWrap="wrap" gap={1}>
                          {rideType.features ? rideType.features.map((feature, index) => (
                            <Chip
                              key={index}
                              label={feature}
                              size="small"
                              variant="outlined"
                            />
                          )) : null}
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Active Bookings */}
          <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Your Rides
                </Typography>
                
                {Array.isArray(bookings) && bookings.length === 0 ? (
                  <Box textAlign="center" py={4}>
                    <DirectionsCar sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      No active rides
                    </Typography>
                    <Button variant="contained" startIcon={<DirectionsCar />}>
                      Book a Ride
                    </Button>
                  </Box>
                ) : (
                  <List>
                    {(bookings || []).map((booking) => (
                      <ListItem key={booking.id}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.light' }}>
                            {getStatusIcon(booking.status)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={booking.rideType}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {booking.pickupLocation} → {booking.dropoffLocation}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {booking.createdAt ? new Date(booking.createdAt).toLocaleString() : 'N/A'}
                              </Typography>
                              <Typography variant="body2" fontWeight="bold">
                                ${typeof booking.estimatedPrice === 'number' ? booking.estimatedPrice : 'N/A'}
                              </Typography>
                            </Box>
                          }
                        />
                        <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
                          <Chip
                            label={booking.status.replace('_', ' ')}
                            color={getStatusColor(booking.status) as any}
                            size="small"
                          />
                          {booking.status === 'pending' && (
                            <Button
                              size="small"
                              color="error"
                              onClick={() => handleCancelBooking(booking.id)}
                            >
                              Cancel
                            </Button>
                          )}
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Booking Dialog */}
        <Dialog open={bookingDialog} onClose={() => setBookingDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            Book a Ride - {selectedRideType?.name}
          </DialogTitle>
          <DialogContent>
            <Stepper activeStep={activeStep} orientation="vertical">
              <Step>
                <StepLabel>Ride Details</StepLabel>
                <StepContent>
                  <Box display="flex" flexDirection="column" gap={3} mt={2}>
                    <TextField
                      label="Pickup Location"
                      value={bookingData.pickupLocation}
                      onChange={(e) => setBookingData({ ...bookingData, pickupLocation: e.target.value })}
                      fullWidth
                      required
                    />
                    <TextField
                      label="Dropoff Location"
                      value={bookingData.dropoffLocation}
                      onChange={(e) => setBookingData({ ...bookingData, dropoffLocation: e.target.value })}
                      fullWidth
                      required
                    />
                    <TextField
                      label="Scheduled Time (Optional)"
                      type="datetime-local"
                      value={bookingData.scheduledTime}
                      onChange={(e) => setBookingData({ ...bookingData, scheduledTime: e.target.value })}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                      label="Number of Passengers"
                      type="number"
                      value={bookingData.passengers}
                      onChange={(e) => setBookingData({ ...bookingData, passengers: parseInt(e.target.value) })}
                      fullWidth
                      inputProps={{ min: 1, max: selectedRideType?.capacity || 4 }}
                    />
                  </Box>
                  <Box mt={2}>
                    <Button variant="contained" onClick={handleNext}>
                      Next
                    </Button>
                  </Box>
                </StepContent>
              </Step>

              <Step>
                <StepLabel>Select Driver</StepLabel>
                <StepContent>
                  <Box mt={2}>
                    <FormControl component="fieldset">
                      <FormLabel component="legend">Available Drivers</FormLabel>
                      <RadioGroup
                        value={selectedDriver?.id || ''}
                        onChange={(e) => setSelectedDriver(drivers.find(d => d.id === e.target.value) || null)}
                      >
                        {(drivers || []).map((driver) => (
                          <FormControlLabel
                            key={driver.id}
                            value={driver.id}
                            control={<Radio />}
                            label={
                              <Box display="flex" alignItems="center" gap={2}>
                                <Avatar sx={{ width: 32, height: 32 }}>
                                  <Person />
                                </Avatar>
                                <Box>
                                  <Typography variant="body1" fontWeight="bold">
                                    {driver.name}
                                  </Typography>
                                  <Box display="flex" alignItems="center" gap={1}>
                                    <Rating value={typeof driver.rating === 'number' ? driver.rating : 0} readOnly size="small" />
                                    <Typography variant="body2" color="text.secondary">
                                      {driver.vehicle || 'N/A'}
                                    </Typography>
                                  </Box>
                                  <Typography variant="body2" color="text.secondary">
                                    ETA: {driver.eta || 'N/A'}
                                  </Typography>
                                </Box>
                              </Box>
                            }
                          />
                        ))}
                      </RadioGroup>
                    </FormControl>
                  </Box>
                  <Box mt={2}>
                    <Button onClick={handleBack}>Back</Button>
                    <Button
                      variant="contained"
                      onClick={handleBookingSubmit}
                      disabled={!selectedDriver}
                      sx={{ ml: 1 }}
                    >
                      Book Ride
                    </Button>
                  </Box>
                </StepContent>
              </Step>
            </Stepper>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBookingDialog(false)}>Cancel</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default RidesPage; 