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
  Grid,
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
  Tooltip
} from '@mui/material';
import {
  LocalParking,
  QrCode,
  AccessTime,
  LocationOn,
  DirectionsCar,
  CheckCircle,
  Cancel,
  Refresh,
  FilterList
} from '@mui/icons-material';
import Layout from '../components/Layout';
import api from '../services/api';

interface ParkingSlot {
  id: string;
  number: string;
  location: string;
  type: 'standard' | 'premium' | 'disabled';
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  price: number;
  features: string[];
}

interface Reservation {
  id: string;
  slotId: string;
  slotNumber: string;
  startTime: string;
  endTime: string;
  status: 'active' | 'completed' | 'cancelled';
  qrCode: string;
  totalPrice: number;
}

const ParkingPage: React.FC = () => {
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingDialog, setBookingDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [bookingData, setBookingData] = useState({
    startTime: '',
    endTime: '',
    vehicleNumber: ''
  });
  const [qrDialog, setQrDialog] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchParkingData();
  }, []);

  const fetchParkingData = async () => {
    try {
      setLoading(true);
      const [slotsResponse, reservationsResponse] = await Promise.all([
        api.get('/parking/slots'),
        api.get('/parking/reservations')
      ]);
      
      setSlots(slotsResponse.data);
      setReservations(reservationsResponse.data);
    } catch (err) {
      setError('Failed to fetch parking data');
      console.error('Error fetching parking data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookSlot = (slot: ParkingSlot) => {
    setSelectedSlot(slot);
    setBookingDialog(true);
  };

  const handleBookingSubmit = async () => {
    if (!selectedSlot || !bookingData.startTime || !bookingData.endTime || !bookingData.vehicleNumber) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const response = await api.post('/parking/reservations', {
        slotId: selectedSlot.id,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
        vehicleNumber: bookingData.vehicleNumber
      });

      setReservations([...reservations, response.data]);
      setBookingDialog(false);
      setSelectedSlot(null);
      setBookingData({ startTime: '', endTime: '', vehicleNumber: '' });
      fetchParkingData(); // Refresh data
    } catch (err) {
      setError('Failed to book parking slot');
      console.error('Error booking slot:', err);
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    try {
      await api.delete(`/parking/reservations/${reservationId}`);
      setReservations(reservations.filter(r => r.id !== reservationId));
      fetchParkingData();
    } catch (err) {
      setError('Failed to cancel reservation');
      console.error('Error cancelling reservation:', err);
    }
  };

  const showQRCode = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setQrDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'success';
      case 'occupied': return 'error';
      case 'reserved': return 'warning';
      case 'maintenance': return 'default';
      default: return 'default';
    }
  };

  const getSlotTypeColor = (type: string) => {
    switch (type) {
      case 'premium': return 'warning';
      case 'disabled': return 'default';
      default: return 'primary';
    }
  };

  const filteredSlots = slots.filter(slot => {
    if (filter === 'all') return true;
    if (filter === 'available') return slot.status === 'available';
    if (filter === 'premium') return slot.type === 'premium';
    return true;
  });

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
              Smart Parking
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Book your parking slot and get instant QR code access
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={fetchParkingData}
          >
            Refresh
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Stats */}
        <Box display="flex" flexWrap="wrap" gap={3} mb={4}>
          <Card sx={{ flex: '1 1 200px' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'success.light' }}>
                  <LocalParking />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {slots.filter(s => s.status === 'available').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Available Slots
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ flex: '1 1 200px' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'primary.light' }}>
                  <DirectionsCar />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {reservations.filter(r => r.status === 'active').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Reservations
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ flex: '1 1 200px' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'warning.light' }}>
                  <QrCode />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {slots.filter(s => s.type === 'premium').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Premium Slots
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Filter and Parking Slots */}
        <Box display="flex" flexWrap="wrap" gap={3}>
          <Box sx={{ flex: '1 1 600px', minWidth: 0 }}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h6">Available Parking Slots</Typography>
                  <Box display="flex" gap={1}>
                    <Chip
                      label="All"
                      color={filter === 'all' ? 'primary' : 'default'}
                      onClick={() => setFilter('all')}
                      clickable
                    />
                    <Chip
                      label="Available"
                      color={filter === 'available' ? 'primary' : 'default'}
                      onClick={() => setFilter('available')}
                      clickable
                    />
                    <Chip
                      label="Premium"
                      color={filter === 'premium' ? 'primary' : 'default'}
                      onClick={() => setFilter('premium')}
                      clickable
                    />
                  </Box>
                </Box>

                <Box display="flex" flexWrap="wrap" gap={2}>
                  {(filteredSlots || []).map((slot) => (
                    <Card
                      key={slot.id}
                      sx={{
                        flex: '1 1 200px',
                        minWidth: 0,
                        cursor: slot.status === 'available' ? 'pointer' : 'default',
                        opacity: slot.status === 'available' ? 1 : 0.6,
                        '&:hover': slot.status === 'available' ? {
                          boxShadow: 4,
                          transform: 'translateY(-2px)'
                        } : {}
                      }}
                      onClick={() => slot.status === 'available' && handleBookSlot(slot)}
                    >
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Typography variant="h6" fontWeight="bold">
                            Slot {slot.number}
                          </Typography>
                          <Chip
                            label={slot.status}
                            color={getStatusColor(slot.status) as any}
                            size="small"
                          />
                        </Box>
                        
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <LocationOn fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {slot.location}
                          </Typography>
                        </Box>

                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                          <Chip
                            label={slot.type}
                            color={getSlotTypeColor(slot.type) as any}
                            size="small"
                          />
                          <Typography variant="body2" fontWeight="bold">
                            ${slot.price}/hr
                          </Typography>
                        </Box>

                        {slot.status === 'available' && (
                          <Button
                            variant="contained"
                            fullWidth
                            startIcon={<LocalParking />}
                            size="small"
                          >
                            Book Now
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Active Reservations */}
          <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Your Reservations
                </Typography>
                
                {reservations.length === 0 ? (
                  <Box textAlign="center" py={4}>
                    <LocalParking sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      No active reservations
                    </Typography>
                    <Button variant="contained" startIcon={<LocalParking />}>
                      Book Parking
                    </Button>
                  </Box>
                ) : (
                  <List>
                    {(reservations || []).map((reservation) => (
                      <ListItem key={reservation.id}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.light' }}>
                            <LocalParking />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`Slot ${reservation.slotNumber}`}
                          secondary={
                            <Box component="span">
                              <Box component="span" sx={{ display: 'block', color: 'text.secondary', fontSize: '0.875rem' }}>
                                {(reservation.startTime ? new Date(reservation.startTime).toLocaleString() : 'N/A')} - {(reservation.endTime ? new Date(reservation.endTime).toLocaleString() : 'N/A')}
                              </Box>
                              <Box component="span" sx={{ display: 'block', fontWeight: 'bold', fontSize: '0.875rem' }}>
                                ${reservation.totalPrice}
                              </Box>
                            </Box>
                          }
                        />
                        <Box display="flex" gap={1}>
                          <Tooltip title="Show QR Code">
                            <IconButton
                              size="small"
                              onClick={() => showQRCode(reservation)}
                            >
                              <QrCode />
                            </IconButton>
                          </Tooltip>
                          {reservation.status === 'active' && (
                            <Tooltip title="Cancel Reservation">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleCancelReservation(reservation.id)}
                              >
                                <Cancel />
                              </IconButton>
                            </Tooltip>
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
        <Dialog open={bookingDialog} onClose={() => setBookingDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Book Parking Slot {selectedSlot?.number}
          </DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={3} mt={2}>
              <TextField
                label="Vehicle Number"
                value={bookingData.vehicleNumber}
                onChange={(e) => setBookingData({ ...bookingData, vehicleNumber: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label="Start Time"
                type="datetime-local"
                value={bookingData.startTime}
                onChange={(e) => setBookingData({ ...bookingData, startTime: e.target.value })}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="End Time"
                type="datetime-local"
                value={bookingData.endTime}
                onChange={(e) => setBookingData({ ...bookingData, endTime: e.target.value })}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
              
              {selectedSlot && (
                <Box p={2} bgcolor="grey.50" borderRadius={1}>
                  <Typography variant="body2" color="text.secondary">
                    Slot Type: {selectedSlot.type}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Price: ${selectedSlot.price}/hour
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Location: {selectedSlot.location}
                  </Typography>
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBookingDialog(false)}>Cancel</Button>
            <Button onClick={handleBookingSubmit} variant="contained">
              Book Slot
            </Button>
          </DialogActions>
        </Dialog>

        {/* QR Code Dialog */}
        <Dialog open={qrDialog} onClose={() => setQrDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            QR Code - Slot {selectedReservation?.slotNumber}
          </DialogTitle>
          <DialogContent>
            <Box textAlign="center" py={3}>
              <Box
                component="img"
                src={selectedReservation?.qrCode}
                alt="QR Code"
                sx={{ width: 200, height: 200, mb: 2 }}
              />
              <Typography variant="body1" gutterBottom>
                Scan this QR code at the parking entrance
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Valid until: {selectedReservation && selectedReservation.endTime ? new Date(selectedReservation.endTime).toLocaleString() : 'N/A'}
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setQrDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default ParkingPage; 