from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Routes 
from routes import users, appointments, permit_applications, vendors, reports, reviews

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
api_app.include_router(vendors.router, prefix="/vendors", tags=["Vendors"])
api_app.include_router(reports.router, prefix="/reports", tags=["Reports"])
api_app.include_router(reviews.router, prefix="/reviews", tags=["Reviews"])

# For Localhost
# if __name__ == "__main__":
#     uvicorn.run("server:app", reload=True)

#For Mobile
# if __name__ == "__main__":
#     uvicorn.run("server:app", host="192.168.227.221", port=8000, reload=True)

# For Deployment
if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
    


