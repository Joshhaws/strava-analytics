const express = require('express');
const cors = require('cors'); // Import CORS middleware
const authRoutes = require('./auth');
const stravaRoutes = require('./strava');
const activitiesRoutes = require('./activities');

const app = express();
const port = 3001;

// Apply CORS Middleware before defining routes
app.use(cors({
    origin: ['http://127.0.0.1:5173', 'http://localhost:5173'], // Allow requests from this origin
    credentials: true // Allow cookies and authentication headers
}));

app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/strava', stravaRoutes);
app.use('/api/activities', activitiesRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
