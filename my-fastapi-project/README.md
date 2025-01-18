# My FastAPI Project

This project is a FastAPI application that implements JWT token authentication middleware. It serves as a basic template for building secure APIs using FastAPI.

## Project Structure

```
my-fastapi-project
├── app
│   ├── main.py          # Entry point of the FastAPI application
│   ├── middleware.py    # Middleware for JWT token authentication
│   ├── config.py        # Configuration settings, including JWT_SECRET
│   ├── db.py            # Database connection setup
│   ├── auth.py          # Authentication routes
│   ├── strava.py        # Strava routes
│   ├── activities.py    # Activities routes
├── requirements.txt     # Project dependencies
└── README.md            # Project documentation
```

## Installation

To get started, clone the repository and install the required dependencies:

```bash
git clone <repository-url>
cd my-fastapi-project
pip install -r requirements.txt
```

## Usage

To run the FastAPI application, execute the following command:

```bash
uvicorn app.main:app --reload
```

Visit `http://127.0.0.1:8000` in your browser to access the API.

## Middleware

The project includes a middleware function for authenticating JWT tokens. The `authenticate_token` function verifies the token and attaches the decoded user information to the request.

## Routers

The project includes routers for authentication, Strava, and activities. These routers are included in the FastAPI application with the following prefixes:

- Authentication routes: `/api/auth`
- Strava routes: `/api/strava`
- Activities routes: `/api/activities`

## License

This project is licensed under the MIT License.