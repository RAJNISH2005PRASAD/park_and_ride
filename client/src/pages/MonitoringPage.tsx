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
  LinearProgress,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
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
  Monitor,
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Error,
  Refresh,
  Settings,
  Speed,
  Storage,
  Memory,
  NetworkCheck,
  People,
  DirectionsCar,
  LocalParking,
  Payment,
  Timeline,
  Analytics,
  BugReport,
  Security,
  Info
} from '@mui/icons-material';
import Layout from '../components/Layout';
import api from '../services/api';

interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  uptime: number;
  activeConnections: number;
}

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'warning' | 'error' | 'offline';
  responseTime: number;
  lastCheck: string;
  uptime: number;
}

interface PerformanceMetrics {
  totalUsers: number;
  activeUsers: number;
  totalRides: number;
  totalParking: number;
  totalRevenue: number;
  averageResponseTime: number;
  errorRate: number;
}

interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
}

const MonitoringPage: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [settingsDialog, setSettingsDialog] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMonitoringData();
    const interval = setInterval(fetchMonitoringData, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const fetchMonitoringData = async () => {
    try {
      setLoading(true);
      const [metricsResponse, servicesResponse, performanceResponse, alertsResponse] = await Promise.all([
        api.get('/monitoring/metrics'),
        api.get('/monitoring/services'),
        api.get('/monitoring/performance'),
        api.get('/monitoring/alerts')
      ]);
      
      setMetrics(metricsResponse.data);
      setServices(servicesResponse.data);
      setPerformance(performanceResponse.data);
      setAlerts(alertsResponse.data);
    } catch (err) {
      setError('Failed to fetch monitoring data');
      console.error('Error fetching monitoring data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await api.patch(`/monitoring/alerts/${alertId}/resolve`);
      setAlerts(alerts.map(a => a.id === alertId ? { ...a, resolved: true } : a));
    } catch (err) {
      setError('Failed to resolve alert');
      console.error('Error resolving alert:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      case 'offline': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle />;
      case 'warning': return <Warning />;
      case 'error': return <Error />;
      case 'offline': return <Error />;
      default: return <CheckCircle />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'info': return 'info';
      case 'warning': return 'warning';
      case 'error': return 'error';
      case 'critical': return 'error';
      default: return 'info';
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  if (loading && !metrics) {
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
              System Monitoring
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Real-time system performance and health monitoring
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
              onClick={fetchMonitoringData}
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

        {/* System Metrics */}
        {metrics && (
          <Box display="flex" flexWrap="wrap" gap={3} mb={4}>
            <Card sx={{ flex: '1 1 200px' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar sx={{ bgcolor: 'primary.light' }}>
                    <Speed />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {metrics.cpu}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      CPU Usage
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={metrics.cpu} 
                  sx={{ height: 8, borderRadius: 4 }}
                  color={metrics.cpu > 80 ? 'error' : metrics.cpu > 60 ? 'warning' : 'primary'}
                />
              </CardContent>
            </Card>

            <Card sx={{ flex: '1 1 200px' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar sx={{ bgcolor: 'secondary.light' }}>
                    <Memory />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {metrics.memory}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Memory Usage
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={metrics.memory} 
                  sx={{ height: 8, borderRadius: 4 }}
                  color={metrics.memory > 80 ? 'error' : metrics.memory > 60 ? 'warning' : 'secondary'}
                />
              </CardContent>
            </Card>

            <Card sx={{ flex: '1 1 200px' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar sx={{ bgcolor: 'success.light' }}>
                    <Storage />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {metrics.disk}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Disk Usage
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={metrics.disk} 
                  sx={{ height: 8, borderRadius: 4 }}
                  color={metrics.disk > 80 ? 'error' : metrics.disk > 60 ? 'warning' : 'success'}
                />
              </CardContent>
            </Card>

            <Card sx={{ flex: '1 1 200px' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar sx={{ bgcolor: 'warning.light' }}>
                    <NetworkCheck />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {metrics.network}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Network Usage
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={metrics.network} 
                  sx={{ height: 8, borderRadius: 4 }}
                  color={metrics.network > 80 ? 'error' : metrics.network > 60 ? 'warning' : 'warning'}
                />
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Performance Metrics */}
        {performance && (
          <Box display="flex" flexWrap="wrap" gap={3} mb={4}>
            <Card sx={{ flex: '1 1 200px' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: 'primary.light' }}>
                    <People />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {typeof performance.totalUsers === 'number' ? performance.totalUsers.toLocaleString() : 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Users
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ flex: '1 1 200px' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: 'success.light' }}>
                    <DirectionsCar />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {typeof performance.totalRides === 'number' ? performance.totalRides.toLocaleString() : 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Rides
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ flex: '1 1 200px' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: 'secondary.light' }}>
                    <LocalParking />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {typeof performance.totalParking === 'number' ? performance.totalParking.toLocaleString() : 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Parking
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ flex: '1 1 200px' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: 'warning.light' }}>
                    <Payment />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      ${typeof performance.totalRevenue === 'number' ? performance.totalRevenue.toLocaleString() : 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Revenue
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Services and Alerts */}
        <Box display="flex" flexWrap="wrap" gap={3}>
          {/* Service Status */}
          <Box sx={{ flex: '1 1 600px', minWidth: 0 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Service Status
                </Typography>
                
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Service</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Response Time</TableCell>
                        <TableCell>Uptime</TableCell>
                        <TableCell>Last Check</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(services || []).map((service) => (
                        <TableRow key={service.name}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {service.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={getStatusIcon(service.status)}
                              label={service.status}
                              color={getStatusColor(service.status) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {service.responseTime}ms
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatUptime(service.uptime)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {service.lastCheck ? new Date(service.lastCheck).toLocaleString() : 'N/A'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Box>

          {/* Alerts */}
          <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Alerts
                </Typography>
                
                {alerts.length === 0 ? (
                  <Box textAlign="center" py={4}>
                    <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      No active alerts
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      All systems are running smoothly
                    </Typography>
                  </Box>
                ) : (
                  <List>
                    {(alerts || []).slice(0, 5).map((alert, index) => (
                      <React.Fragment key={alert.id}>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: `${getAlertColor(alert.type)}.light` }}>
                              {alert.type === 'info' && <Info />}
                              {alert.type === 'warning' && <Warning />}
                              {alert.type === 'error' && <Error />}
                              {alert.type === 'critical' && <Error />}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={alert.message}
                            secondary={
                              <Typography variant="body2" color="text.secondary">
                                {alert.timestamp ? new Date(alert.timestamp).toLocaleString() : 'N/A'}
                              </Typography>
                            }
                          />
                          {!alert.resolved && (
                            <Tooltip title="Mark as Resolved">
                              <IconButton
                                size="small"
                                onClick={() => handleResolveAlert(alert.id)}
                              >
                                <CheckCircle />
                              </IconButton>
                            </Tooltip>
                          )}
                        </ListItem>
                        {index < Math.min(alerts.length, 5) - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Settings Dialog */}
        <Dialog open={settingsDialog} onClose={() => setSettingsDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Monitoring Settings
          </DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={3} mt={2}>
              <FormControl fullWidth>
                <InputLabel>Refresh Interval</InputLabel>
                <Select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(e.target.value as number)}
                  label="Refresh Interval"
                >
                  <MenuItem value={10}>10 seconds</MenuItem>
                  <MenuItem value={30}>30 seconds</MenuItem>
                  <MenuItem value={60}>1 minute</MenuItem>
                  <MenuItem value={300}>5 minutes</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSettingsDialog(false)}>Cancel</Button>
            <Button onClick={() => setSettingsDialog(false)} variant="contained">
              Save Settings
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default MonitoringPage; 