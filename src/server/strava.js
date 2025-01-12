const express = require('express');
const pool = require('./db.js');
const { authenticateToken } = require('./middleware.js');

const router = express.Router();

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

router.post('/callback', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const { tokenData, activities } = req.body;
    console.log(tokenData)
    await client.query('BEGIN');

    // Update profile with Strava tokens
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

    // Insert activities
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

module.exports = router;
