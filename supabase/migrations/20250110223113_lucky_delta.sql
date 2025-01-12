/*
  # Initial Schema Setup

  1. New Tables
    - `users`
      - `id` (serial, primary key)
      - `email` (varchar, unique)
      - `password` (varchar)
      - `created_at` (timestamptz)
    
    - `profiles`
      - `id` (serial, primary key)
      - `user_id` (integer, references users)
      - `strava_athlete_id` (varchar)
      - `strava_access_token` (varchar)
      - `strava_refresh_token` (varchar)
      - `strava_token_expires_at` (timestamptz)
      - `last_sync` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `activities`
      - `id` (bigint, primary key)
      - `user_id` (integer, references users)
      - `name` (varchar)
      - `type` (varchar)
      - `start_date` (timestamptz)
      - `distance` (float)
      - `moving_time` (integer)
      - `elapsed_time` (integer)
      - `total_elevation_gain` (float)
      - `average_speed` (float)
      - `max_speed` (float)
      - `average_watts` (float)
      - `kilojoules` (float)
      - `average_heartrate` (float)
      - `max_heartrate` (float)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Indexes
    - Email index on users table
    - Start date index on activities table
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  strava_athlete_id VARCHAR(255),
  strava_access_token VARCHAR(255),
  strava_refresh_token VARCHAR(255),
  strava_token_expires_at TIMESTAMP WITH TIME ZONE,
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id BIGINT PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  distance FLOAT NOT NULL,
  moving_time INTEGER NOT NULL,
  elapsed_time INTEGER NOT NULL,
  total_elevation_gain FLOAT,
  average_speed FLOAT,
  max_speed FLOAT,
  average_watts FLOAT,
  kilojoules FLOAT,
  average_heartrate FLOAT,
  max_heartrate FLOAT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_activities_start_date ON activities(start_date);