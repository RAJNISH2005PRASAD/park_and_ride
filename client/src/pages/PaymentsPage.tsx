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
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  Payment,
  CreditCard,
  AccountBalance,
  Receipt,
  Add,
  Download,
  FilterList,
  Refresh,
  CheckCircle,
  Error,
  Pending,
  TrendingUp,
  TrendingDown,
  Wallet,
  QrCode,
  ReceiptLong,
  Delete
} from '@mui/icons-material';
import Layout from '../components/Layout';
import api from '../services/api';

interface Transaction {
  id: string;
  type: 'parking' | 'ride' | 'subscription' | 'refund';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  method: string;
  description: string;
  createdAt: string;
  reference: string;
  metadata?: any;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'wallet' | 'bank';
  name: string;
  lastFour?: string;
  isDefault: boolean;
  isActive: boolean;
}

interface PaymentStats {
  totalSpent: number;
  monthlySpent: number;
  totalTransactions: number;
  averageTransaction: number;
  pendingAmount: number;
}

const PaymentsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [addMethodDialog, setAddMethodDialog] = useState(false);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      const [transactionsResponse, methodsResponse, statsResponse] = await Promise.all([
        api.get('/payments/transactions'),
        api.get('/payments/methods'),
        api.get('/payments/stats')
      ]);
      
      setTransactions(transactionsResponse.data);
      setPaymentMethods(methodsResponse.data);
      setStats(statsResponse.data);
    } catch (err) {
      setError('Failed to fetch payment data');
      console.error('Error fetching payment data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = async (methodData: Omit<PaymentMethod, 'id'>) => {
    try {
      const response = await api.post('/payments/methods', methodData);
      setPaymentMethods([...paymentMethods, response.data]);
      setAddMethodDialog(false);
      setSuccess('Payment method added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to add payment method');
      console.error('Error adding payment method:', err);
    }
  };

  const handleDeletePaymentMethod = async (methodId: string) => {
    try {
      await api.delete(`/payments/methods/${methodId}`);
      setPaymentMethods(paymentMethods.filter(m => m.id !== methodId));
      setSuccess('Payment method deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete payment method');
      console.error('Error deleting payment method:', err);
    }
  };

  const handleSetDefaultMethod = async (methodId: string) => {
    try {
      await api.patch(`/payments/methods/${methodId}/default`);
      setPaymentMethods(paymentMethods.map(m => ({ ...m, isDefault: m.id === methodId })));
      setSuccess('Default payment method updated!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update default payment method');
      console.error('Error updating default payment method:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      case 'refunded': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle />;
      case 'pending': return <Pending />;
      case 'failed': return <Error />;
      case 'refunded': return <Receipt />;
      default: return <Pending />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'parking': return <Receipt />;
      case 'ride': return <Receipt />;
      case 'subscription': return <ReceiptLong />;
      case 'refund': return <Receipt />;
      default: return <Payment />;
    }
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'card': return <CreditCard />;
      case 'upi': return <QrCode />;
      case 'wallet': return <Wallet />;
      case 'bank': return <AccountBalance />;
      default: return <Payment />;
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    if (filter === 'parking') return transaction.type === 'parking';
    if (filter === 'ride') return transaction.type === 'ride';
    if (filter === 'completed') return transaction.status === 'completed';
    if (filter === 'pending') return transaction.status === 'pending';
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
              Payments & Transactions
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your payment methods and view transaction history
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={fetchPaymentData}
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
        {stats && (
          <Box display="flex" flexWrap="wrap" gap={3} mb={4}>
            <Card sx={{ flex: '1 1 200px' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: 'primary.light' }}>
                    <TrendingUp />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {typeof stats.totalSpent === 'number' ? stats.totalSpent.toLocaleString() : 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Spent
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ flex: '1 1 200px' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: 'success.light' }}>
                    <Payment />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {typeof stats.monthlySpent === 'number' ? stats.monthlySpent.toLocaleString() : 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      This Month
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ flex: '1 1 200px' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: 'secondary.light' }}>
                    <Receipt />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.totalTransactions}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Transactions
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ flex: '1 1 200px' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: 'warning.light' }}>
                    <Pending />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {typeof stats.pendingAmount === 'number' ? stats.pendingAmount.toLocaleString() : 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending Amount
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Tabs */}
        <Card>
          <CardContent>
            <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
              <Tab label="Transactions" />
              <Tab label="Payment Methods" />
            </Tabs>

            {/* Transactions Tab */}
            {activeTab === 0 && (
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Box display="flex" gap={1}>
                    <Chip
                      label="All"
                      color={filter === 'all' ? 'primary' : 'default'}
                      onClick={() => setFilter('all')}
                      clickable
                    />
                    <Chip
                      label="Parking"
                      color={filter === 'parking' ? 'primary' : 'default'}
                      onClick={() => setFilter('parking')}
                      clickable
                    />
                    <Chip
                      label="Rides"
                      color={filter === 'ride' ? 'primary' : 'default'}
                      onClick={() => setFilter('ride')}
                      clickable
                    />
                    <Chip
                      label="Completed"
                      color={filter === 'completed' ? 'primary' : 'default'}
                      onClick={() => setFilter('completed')}
                      clickable
                    />
                    <Chip
                      label="Pending"
                      color={filter === 'pending' ? 'primary' : 'default'}
                      onClick={() => setFilter('pending')}
                      clickable
                    />
                  </Box>
                  <Button
                    variant="outlined"
                    startIcon={<Download />}
                  >
                    Export
                  </Button>
                </Box>

                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Transaction</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Method</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Reference</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={2}>
                              <Avatar sx={{ bgcolor: 'primary.light', width: 32, height: 32 }}>
                                {getTypeIcon(transaction.type)}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight="bold">
                                  {transaction.description}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={transaction.type}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              ${transaction.amount.toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={getStatusIcon(transaction.status)}
                              label={transaction.status}
                              color={getStatusColor(transaction.status) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {transaction.method}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString() : 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {transaction.reference}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {filteredTransactions.length === 0 && (
                  <Box textAlign="center" py={4}>
                    <Payment sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      No transactions found
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            {/* Payment Methods Tab */}
            {activeTab === 1 && (
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h6">Payment Methods</Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setAddMethodDialog(true)}
                  >
                    Add Payment Method
                  </Button>
                </Box>

                {paymentMethods.length === 0 ? (
                  <Box textAlign="center" py={4}>
                    <CreditCard sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      No payment methods added yet
                    </Typography>
                    <Button variant="contained" startIcon={<Add />}>
                      Add Your First Payment Method
                    </Button>
                  </Box>
                ) : (
                  <List>
                    {(paymentMethods || []).map((method, index) => (
                      <React.Fragment key={method.id}>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'primary.light' }}>
                              {getMethodIcon(method.type)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="body1" fontWeight="bold">
                                  {method.name}
                                </Typography>
                                {method.isDefault && (
                                  <Chip label="Default" color="primary" size="small" />
                                )}
                                {!method.isActive && (
                                  <Chip label="Inactive" color="error" size="small" />
                                )}
                              </Box>
                            }
                            secondary={
                              <Typography variant="body2" color="text.secondary">
                                {method.type.toUpperCase()}
                                {method.lastFour && ` • ****${method.lastFour}`}
                              </Typography>
                            }
                          />
                          <Box display="flex" gap={1}>
                            {!method.isDefault && method.isActive && (
                              <Tooltip title="Set as Default">
                                <IconButton
                                  size="small"
                                  onClick={() => handleSetDefaultMethod(method.id)}
                                >
                                  <CheckCircle />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeletePaymentMethod(method.id)}
                              >
                                <Delete />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </ListItem>
                        {index < (paymentMethods || []).length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Add Payment Method Dialog */}
        <Dialog open={addMethodDialog} onClose={() => setAddMethodDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Add Payment Method
          </DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={3} mt={2}>
              <FormControl fullWidth>
                <InputLabel>Payment Method Type</InputLabel>
                <Select
                  label="Payment Method Type"
                  defaultValue="card"
                >
                  <MenuItem value="card">Credit/Debit Card</MenuItem>
                  <MenuItem value="upi">UPI</MenuItem>
                  <MenuItem value="wallet">Digital Wallet</MenuItem>
                  <MenuItem value="bank">Bank Transfer</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                label="Card Number"
                fullWidth
                placeholder="1234 5678 9012 3456"
              />
              
              <Box display="flex" gap={2}>
                <TextField
                  label="Expiry Date"
                  fullWidth
                  placeholder="MM/YY"
                />
                <TextField
                  label="CVV"
                  fullWidth
                  placeholder="123"
                />
              </Box>
              
              <TextField
                label="Cardholder Name"
                fullWidth
                placeholder="John Doe"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddMethodDialog(false)}>Cancel</Button>
            <Button onClick={() => setAddMethodDialog(false)} variant="contained">
              Add Method
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default PaymentsPage; 