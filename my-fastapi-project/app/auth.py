from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import jwt
from .db import get_db_pool
from .config import JWT_SECRET

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthRequest(BaseModel):
    email: str
    password: str

@router.post("/signup")
async def signup(auth_request: AuthRequest):
    pool = await get_db_pool()
    async with pool.acquire() as connection:
        existing_user = await connection.fetchrow('SELECT * FROM users WHERE email = $1', auth_request.email)
        if existing_user:
            raise HTTPException(status_code=400, detail="Email is already in use")

        hashed_password = pwd_context.hash(auth_request.password)
        user = await connection.fetchrow(
            'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
            auth_request.email, hashed_password
        )
        token = jwt.encode({"userId": user['id']}, JWT_SECRET, algorithm="HS256")
        return {"user": dict(user), "token": token}

@router.post("/signin")
async def signin(auth_request: AuthRequest):
    pool = await get_db_pool()
    async with pool.acquire() as connection:
        user = await connection.fetchrow('SELECT * FROM users WHERE email = $1', auth_request.email)
        if not user or not pwd_context.verify(auth_request.password, user['password']):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        token = jwt.encode({"userId": user['id']}, JWT_SECRET, algorithm="HS256")
        return {"user": {"id": user['id'], "email": user['email']}, "token": token}

@router.get("/verify")
async def verify_token(request: Request):
    auth_header = request.headers.get('Authorization')
    token = auth_header.split(' ')[1] if auth_header else None

    if not token:
        raise HTTPException(status_code=401, detail="No token provided")

    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return {"user": decoded}
    except JWTError as e:
        raise HTTPException(status_code=403, detail="Invalid token")