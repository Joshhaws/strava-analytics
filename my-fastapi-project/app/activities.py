from fastapi import APIRouter, Depends, Request
from .middleware import authenticate_token
from .db import get_db_pool

router = APIRouter()

@router.get("/")
async def get_activities(request: Request, page: int = 1, limit: int = 10):
    offset = (page - 1) * limit
    pool = await get_db_pool()
    async with pool.acquire() as connection:
        activities = await connection.fetch(
            'SELECT * FROM activities WHERE user_id = $1 ORDER BY start_date DESC LIMIT $2 OFFSET $3',
            request.state.user["userId"], limit, offset
        )
        return activities