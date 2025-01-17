import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import pool from './db.js';
import { JWT_SECRET } from './config.js';
import { authenticateToken } from './middleware.js';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// Sign up route
router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the email is already in use
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Email is already in use' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
      [email, hashedPassword]
    );
    
    const user = result.rows[0];
    
    // Create a JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ user, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error });
  }
});

// Sign in route
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid password' });
    }
    
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ user: { id: user.id, email: user.email }, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error });
  }
});

// Token verification route
router.get('/verify', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ userId: decoded.userId });
  } catch (error) {
    console.error(error);
    res.status(403).json({ message: 'Invalid token' });
  }
});

// Check Strava connection
router.get('/connection', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT strava_access_token FROM profiles WHERE user_id = $1',
      [req.user.userId]
    );
    res.json({ connected: result.rows[0] && result.rows[0].strava_access_token ? true : false });
  } catch (error) {
    console.error('Error checking Strava connection:', error);
    res.status(500).json({ message: 'Error checking Strava connection' });
  }
});

// Strava callback
router.post('/callback', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  let tokenResponse;
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: 'Authorization code is required' });
    }

    // Step 1: Exchange the code for tokens from Strava API
    try {
      tokenResponse = await axios.post('https://www.strava.com/oauth/token', {
        client_id: process.env.VITE_STRAVA_CLIENT_ID?.trim(),
        client_secret: process.env.VITE_STRAVA_CLIENT_SECRET?.trim(),
        code: code,
        grant_type: 'authorization_code',
      });
      console.log('Token response received:', tokenResponse.data);
    } catch (error) {
      console.error('Error making request to Strava API:', error.response?.data || error.message);
      if (error.response?.data?.errors?.[0]?.code === 'invalid') {
        return res.status(400).json({
          message: 'Invalid or expired authorization code. Please reconnect to Strava.',
        });
      }
      return res.status(400).json({
        message: 'Failed to exchange authorization code for tokens',
        error: error.response?.data || error.message,
      });
    }
    
    const tokenData = tokenResponse.data;
    console.log('Token data received:', tokenData);

    await client.query('BEGIN');

    // Step 2: Save Strava tokens to the database
    await client.query(
      `INSERT INTO profiles (user_id, strava_athlete_id, strava_access_token, 
        strava_refresh_token, strava_token_expires_at) 
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) DO UPDATE SET
         strava_athlete_id = EXCLUDED.strava_athlete_id,
         strava_access_token = EXCLUDED.strava_access_token,
         strava_refresh_token = EXCLUDED.strava_refresh_token,
         strava_token_expires_at = EXCLUDED.strava_token_expires_at`,
      [
        req.user.userId,
        tokenData.athlete.id,
        tokenData.access_token,
        tokenData.refresh_token,
        new Date(tokenData.expires_at * 1000)
      ]
    );


    // Step 3: Fetch Activities from Strava API using the new token
    const activitiesResponse = await axios.get('https://www.strava.com/api/v3/athlete/activities', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`
      },
      params: {
        per_page: 200 // Maximum allowed per page
      }
    });

    const activities = activitiesResponse.data;

    // Step 4: Insert Activities into the Database
    for (const activity of activities) {
      await client.query(
        `INSERT INTO activities (
          id, user_id, name, type, start_date, distance, moving_time, elapsed_time,
          total_elevation_gain, average_speed, max_speed, average_watts, kilojoules,
          average_heartrate, max_heartrate
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          type = EXCLUDED.type,
          start_date = EXCLUDED.start_date,
          distance = EXCLUDED.distance,
          moving_time = EXCLUDED.moving_time,
          elapsed_time = EXCLUDED.elapsed_time,
          total_elevation_gain = EXCLUDED.total_elevation_gain,
          average_speed = EXCLUDED.average_speed,
          max_speed = EXCLUDED.max_speed,
          average_watts = EXCLUDED.average_watts,
          kilojoules = EXCLUDED.kilojoules,
          average_heartrate = EXCLUDED.average_heartrate,
          max_heartrate = EXCLUDED.max_heartrate`,
        [
          activity.id,
          req.user.userId,
          activity.name,
          activity.type,
          activity.start_date,
          activity.distance,
          activity.moving_time,
          activity.elapsed_time,
          activity.total_elevation_gain,
          activity.average_speed,
          activity.max_speed,
          activity.average_watts,
          activity.kilojoules,
          activity.average_heartrate,
          activity.max_heartrate
        ]
      );
    }

    await client.query('COMMIT');
    res.json({ message: 'Strava data saved successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error saving Strava data:', error);
    res.status(500).json({ message: 'Error saving Strava data' });
  } finally {
    client.release();
  }
});

export default router;
