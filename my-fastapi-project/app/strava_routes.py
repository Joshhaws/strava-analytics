from fastapi import APIRouter, Depends, HTTPException, Request
from .middleware import authenticate_token
from .db import get_db_pool
import httpx
import os
import logging

router = APIRouter()

# Get the logger
logger = logging.getLogger(__name__)

@router.get("/connection")
async def check_strava_connection(request: Request):
    logger.info("Checking Strava connection for user")
    pool = await get_db_pool()
    async with pool.acquire() as connection:
        try:
            result = await connection.fetchrow(
                'SELECT strava_access_token FROM profiles WHERE user_id = $1',
                request.state.user["userId"]
            )
            logger.info(f"Database query result: {result}")
            connected = bool(result and result["strava_access_token"])
            logger.info(f"Strava connected: {connected}")
            return {"connected": connected}
        except Exception as e:
            logger.error(f"Error checking Strava connection: {e}")
            raise HTTPException(status_code=500, detail="Internal Server Error")

@router.post("/callback")
async def strava_callback(code: str, request: Request):
    pool = await get_db_pool()
    async with pool.acquire() as connection:
        async with httpx.AsyncClient() as client:
            response = await client.post('https://www.strava.com/oauth/token', json={
                'client_id': os.getenv("VITE_STRAVA_CLIENT_ID"),
                'client_secret': os.getenv("VITE_STRAVA_CLIENT_SECRET"),
                'code': code,
                'grant_type': 'authorization_code'
            })
            token_data = response.json()

            await connection.execute(
                '''INSERT INTO profiles (user_id, strava_athlete_id, strava_access_token, 
                strava_refresh_token, strava_token_expires_at) 
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (user_id) DO UPDATE SET
                strava_athlete_id = EXCLUDED.strava_athlete_id,
                strava_access_token = EXCLUDED.strava_access_token,
                strava_refresh_token = EXCLUDED.strava_refresh_token,
                strava_token_expires_at = EXCLUDED.strava_token_expires_at''',
                request.state.user["userId"],
                token_data["athlete"]["id"],
                token_data["access_token"],
                token_data["refresh_token"],
                token_data["expires_at"]
            )

            activities_response = await client.get('https://www.strava.com/api/v3/athlete/activities', headers={
                'Authorization': f'Bearer {token_data["access_token"]}'
            }, params={'per_page': 200})

            activities = activities_response.json()
            for activity in activities:
                await connection.execute(
                    '''INSERT INTO activities (
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
                    max_heartrate = EXCLUDED.max_heartrate''',
                    activity["id"],
                    request.state.user["userId"],
                    activity["name"],
                    activity["type"],
                    activity["start_date"],
                    activity["distance"],
                    activity["moving_time"],
                    activity["elapsed_time"],
                    activity["total_elevation_gain"],
                    activity["average_speed"],
                    activity["max_speed"],
                    activity["average_watts"],
                    activity["kilojoules"],
                    activity["average_heartrate"],
                    activity["max_heartrate"]
                )

            return {"message": "Strava data saved successfully"}