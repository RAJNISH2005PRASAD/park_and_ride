import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider
} from '@mui/material';
import {
  LocalParking,
  DirectionsCar,
  Payment,
  TrendingUp,
  AccessTime,
  LocationOn,
  Star
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const stats = [
    {
      title: 'Active Reservations',
      value: '3',
      icon: <LocalParking color="primary" />,
      color: '#1976d2'
    },
    {
      title: 'Total Rides',
      value: '12',
      icon: <DirectionsCar color="secondary" />,
      color: '#ff9800'
    },
    {
      title: 'Loyalty Points',
      value: '450',
      icon: <Star color="warning" />,
      color: '#ff9800'
    },
    {
      title: 'Monthly Spend',
      value: '$89.50',
      icon: <Payment color="success" />,
      color: '#4caf50'
    }
  ];

  const recentActivities = [
    {
      type: 'parking',
      title: 'Parking reservation confirmed',
      time: '2 hours ago',
      location: 'Central Metro Station'
    },
    {
      type: 'ride',
      title: 'Ride completed',
      time: '1 day ago',
      location: 'Downtown Office'
    },
    {
      type: 'payment',
      title: 'Payment processed',
      time: '2 days ago',
      location: 'Monthly subscription'
    }
  ];

  return (
    <Layout>
      <Box>
        {/* Welcome Section */}
        <Box mb={4}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Welcome back, {user?.firstName || user?.lastName ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim() : 'User'}! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's what's happening with your smart commute today.
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Box display="flex" flexWrap="wrap" gap={3} mb={4}>
          {(stats || []).map((stat, index) => (
            <Box key={index} sx={{ flex: '1 1 250px', minWidth: 0 }}>
              <Card elevation={2} sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" fontWeight="bold" color={stat.color}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.title}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: `${stat.color}20`, color: stat.color }}>
                      {stat.icon}
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>

        {/* Quick Actions */}
        <Box display="flex" flexWrap="wrap" gap={3} mb={4}>
          <Box sx={{ flex: '1 1 600px', minWidth: 0 }}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={2}>
                  <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<LocalParking />}
                      sx={{ py: 2, mb: 2 }}
                      onClick={() => navigate('/parking')}
                    >
                      Book Parking
                    </Button>
                  </Box>
                  <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<DirectionsCar />}
                      sx={{ py: 2, mb: 2 }}
                      onClick={() => navigate('/rides')}
                    >
                      Book Ride
                    </Button>
                  </Box>
                  <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<Payment />}
                      sx={{ py: 2 }}
                      onClick={() => navigate('/payments')}
                    >
                      View Payments
                    </Button>
                  </Box>
                  <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<TrendingUp />}
                      sx={{ py: 2 }}
                      onClick={() => navigate('/monitoring')}
                    >
                      View Analytics
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Current Status
                </Typography>
                <Box mb={2}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Parking Utilization</Typography>
                    <Typography variant="body2">75%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={75} sx={{ height: 8, borderRadius: 4 }} />
                </Box>
                <Box mb={2}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Ride Availability</Typography>
                    <Typography variant="body2">90%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={90} sx={{ height: 8, borderRadius: 4 }} />
                </Box>
                <Chip
                  label="All systems operational"
                  color="success"
                  size="small"
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Recent Activities */}
        <Box display="flex" flexWrap="wrap" gap={3}>
          <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Activities
                </Typography>
                <List>
                  {(recentActivities || []).map((activity, index) => (
                    <React.Fragment key={index}>
                      <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.light' }}>
                            {activity.type === 'parking' && <LocalParking />}
                            {activity.type === 'ride' && <DirectionsCar />}
                            {activity.type === 'payment' && <Payment />}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={activity.title}
                          secondary={
                            <Box component="span">
                              <Box display="flex" alignItems="center" gap={1} component="span">
                                <LocationOn fontSize="small" color="action" />
                                <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                                  {activity.location}
                                </Box>
                              </Box>
                              <Box display="flex" alignItems="center" gap={1} component="span" sx={{ mt: 0.5 }}>
                                <AccessTime fontSize="small" color="action" />
                                <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                                  {activity.time}
                                </Box>
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < (recentActivities || []).length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Upcoming Reservations
                </Typography>
                <Box textAlign="center" py={4}>
                  <LocalParking sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    No upcoming reservations
                  </Typography>
                  <Button variant="contained" startIcon={<LocalParking />} onClick={() => navigate('/parking')}>
                    Book Now
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </Layout>
  );
};

export default DashboardPage; 