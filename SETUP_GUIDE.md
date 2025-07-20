# Park & Ride Application Setup Guide

## 🚀 Quick Start (Demo Mode)

The application is now configured to work in **demo mode** without requiring MongoDB installation. You can test all features using in-memory storage.

### 1. Start the Backend Server
```bash
cd server
npm start
```
The server will start on port 5000 with in-memory authentication.

### 2. Start the Frontend
```bash
cd client
npm start
```
The frontend will start on port 3000 (or another port if 3000 is busy).

### 3. Test Authentication
- Navigate to `http://localhost:3000/auth`
- Register a new account or login with any credentials
- All data will be stored in memory (resets when server restarts)

## 🗄️ Full Setup with MongoDB (Production)

### Option 1: Local MongoDB Installation

#### Windows:
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Install with default settings
3. MongoDB will run as a Windows service automatically

#### macOS:
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

#### Linux (Ubuntu):
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Create list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Option 2: MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/atlas
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Update the `.env` file in the server directory:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/park-and-ride
```

### 4. Update Environment Variables

Edit `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/park-and-ride
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CLIENT_URL=http://localhost:3000
```

### 5. Restart the Server
```bash
cd server
npm start
```

## 🔧 Features Available

### ✅ Working Features (Demo Mode)
- **User Authentication**: Register, Login, Logout
- **Dashboard**: Overview with statistics
- **Parking Management**: View slots, make reservations
- **Ride Booking**: Book last-mile rides
- **Payments**: View payment history
- **Notifications**: Real-time notifications
- **User Profile**: Update profile information
- **System Monitoring**: Health checks and analytics

### 🔄 Real-time Features
- Live parking slot availability
- Real-time notifications
- Dynamic pricing updates
- Live ride tracking

## 🛠️ Development

### Backend Structure
```
server/
├── config/          # Database and Redis configuration
├── middleware/      # Authentication and error handling
├── models/          # MongoDB schemas
├── routes/          # API endpoints
├── services/        # Business logic
└── index.js         # Main server file
```

### Frontend Structure
```
client/
├── components/      # Reusable UI components
├── pages/          # Page components
├── services/       # API integration
└── src/            # Main application files
```

## 🚨 Troubleshooting

### Port 3000 Already in Use
If you see the message "Something is already running on port 3000":
- Press `Y` to use a different port
- Or stop the process using port 3000:
  ```bash
  # Windows
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  
  # macOS/Linux
  lsof -ti:3000 | xargs kill -9
  ```

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod --version`
- Check if the service is running:
  ```bash
  # Windows
  services.msc  # Look for MongoDB
  
  # macOS
  brew services list | grep mongodb
  
  # Linux
  sudo systemctl status mongod
  ```

### Authentication Issues
- Clear browser localStorage: `localStorage.clear()`
- Check browser console for errors
- Verify JWT_SECRET is set in `.env`

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Parking
- `GET /api/parking/slots` - Get all parking slots
- `POST /api/parking/reserve` - Create reservation
- `GET /api/parking/reservations` - Get user reservations

### Rides
- `GET /api/rides/types` - Get ride types
- `POST /api/rides/book` - Book a ride
- `GET /api/rides/my-rides` - Get user rides

### Payments
- `GET /api/payments/history` - Get payment history
- `POST /api/payments/process` - Process payment

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Rate limiting
- Input validation
- Error handling middleware

## 🎨 UI/UX Features

- Material-UI components
- Responsive design
- Dark/Light theme support
- Real-time notifications
- Loading states
- Error handling
- Form validation

## 📊 Monitoring

- Health check endpoint: `GET /health`
- Real-time system metrics
- Error logging
- Performance monitoring

---

## 🎯 Next Steps

1. **Test the application** in demo mode
2. **Install MongoDB** for persistent data storage
3. **Customize the UI** to match your brand
4. **Add more features** like payment processing
5. **Deploy to production** with proper security measures

For support or questions, check the console logs and browser developer tools for detailed error messages. 