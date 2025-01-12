import pool from './db';

export async function createProfile(userId: number, stravaData: any) {
  const result = await pool.query(
    `INSERT INTO profiles (user_id, strava_athlete_id, strava_access_token, 
      strava_refresh_token, strava_token_expires_at) 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING *`,
    [
      userId,
      stravaData.athlete.id,
      stravaData.access_token,
      stravaData.refresh_token,
      new Date(stravaData.expires_at * 1000)
    ]
  );
  return result.rows[0];
}

export async function saveActivities(userId: number, activities: any[]) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const activity of activities) {
      await client.query(
        `INSERT INTO activities (
          id, user_id, name, type, started_at, distance, moving_time, elapsed_time,
          total_elevation_gain, average_speed, max_speed, average_watts, kilojoules,
          average_heartrate, max_heartrate
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          type = EXCLUDED.type,
          started_at = EXCLUDED.started_at,
          distance = EXCLUDED.distance,
          moving_time = EXCLUDED.moving_time,
          elapsed_time = EXCLUDED.elapsed_time,
          total_elevation_gain = EXCLUDED.total_elevation_gain,
          average_speed = EXCLUDED.average_speed,
          max_speed = EXCLUDED.max_speed,
          average_watts = EXCLUDED.average_watts,
          kilojoules = EXCLUDED.kilojoules,
          average_heartrate = EXCLUDED.average_heartrate,
          max_heartrate = EXCLUDED.max_heartrate,
          updated_at = CURRENT_TIMESTAMP`,
        [
          activity.id,
          userId,
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
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}