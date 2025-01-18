from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from jose import JWTError, jwt
from .config import JWT_SECRET

async def authenticate_token(request: Request, call_next):
    if request.method == "OPTIONS":
        return await call_next(request)

    auth_header = request.headers.get('Authorization')
    token = auth_header.split(' ')[1] if auth_header else None

    if not token:
        print("No token provided")
        return JSONResponse(status_code=401, content={"message": "No token provided"})

    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        request.state.user = decoded
        print(f"Token decoded successfully: {decoded}")
    except JWTError as e:
        print(f"Token verification failed: {e}")
        return JSONResponse(status_code=403, content={"message": "Invalid token"})

    response = await call_next(request)
    return response