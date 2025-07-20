import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { UserProvider } from './contexts/UserContext';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ParkingPage from './pages/ParkingPage';
import RidesPage from './pages/RidesPage';
import PaymentsPage from './pages/PaymentsPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import MonitoringPage from './pages/MonitoringPage';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    secondary: { main: '#ff9800' },
    background: { default: '#f4f6f8' },
  },
  shape: { borderRadius: 12 },
  typography: { fontFamily: 'Roboto, Arial, sans-serif' },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
        <UserProvider>
          <Router>
            <Routes>
              <Route path="/auth/*" element={<AuthPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/parking/*" element={<ParkingPage />} />
              <Route path="/rides/*" element={<RidesPage />} />
              <Route path="/payments/*" element={<PaymentsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/monitoring" element={<MonitoringPage />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
        </UserProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
