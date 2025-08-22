from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Routes 
from routes import users, appointments, permit_applications

# Declaration
app = FastAPI()

# CORS
origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# For API versioning
api_app = FastAPI()


# Mount all `/api` routes
app.mount("/api", api_app)

api_app.include_router(users.router, prefix="/users", tags=["Users"])
api_app.include_router(appointments.router, prefix="/appointments", tags=["Appointments"])
api_app.include_router(permit_applications.router, prefix="/permit-applications", tags=["Permit Applications"])


# For Localhost
if __name__ == "__main__":
    uvicorn.run("server:app", reload=True)


# For Deployment
# if __name__ == "__main__":
#     uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
    


