import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .auth import router as auth_router
from .strava_routes import router as strava_router
from .activities import router as activities_router
from .middleware import authenticate_token

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://127.0.0.1:5173', 'http://localhost:5173'],  # Adjust this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add authentication middleware, but exclude the auth routes
@app.middleware("http")
async def auth_middleware(request, call_next):
    if request.url.path.startswith("/api/auth"):
        return await call_next(request)
    return await authenticate_token(request, call_next)

# Include routers
app.include_router(auth_router, prefix="/api/auth")
app.include_router(strava_router, prefix="/api/strava")
app.include_router(activities_router, prefix="/api/activities")

@app.get("/")
async def read_root():
    return {"message": "Welcome to the FastAPI application!"}