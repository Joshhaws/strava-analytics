import express from 'express';
import cors from 'cors';
import authRoutes from './auth.js';
import stravaRoutes from './strava.js';
import activitiesRoutes from './activities.js';

const app = express();
const port = 3001;

// Apply CORS Middleware before defining routes
app.use(cors({
    origin: ['http://127.0.0.1:5173', 'http://localhost:5173'],
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
