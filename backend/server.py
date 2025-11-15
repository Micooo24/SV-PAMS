from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Routes 
from routes import users, appointments, permit_applications, vendors, reports, reviews, base_documents, document_submissions  # , vendor_carts

# Declaration
app = FastAPI()

# CORS
origins = [
    "http://localhost:5173",
    "http://192.168.27.41:8000",
    "http://192.168.27.70:8000"
    
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

# users api
api_app.include_router(users.router, prefix="/users", tags=["Users"])
api_app.include_router(document_submissions.router, prefix="/users/document-submissions", tags=["User Document Submissions"])


# admin api
api_app.include_router(base_documents.router, prefix="/admin/base-documents", tags=["Admin Base Documents"])

# models api - temporarily disabled
# api_app.include_router(vendor_carts.router, prefix="/vendor/carts", tags=["Vendor Carts Detection"])

# disregard muna -----------------
api_app.include_router(appointments.router, prefix="/appointments", tags=["Appointments"])
api_app.include_router(permit_applications.router, prefix="/permit-applications", tags=["Permit Applications"])
api_app.include_router(vendors.router, prefix="/vendors", tags=["Vendors"])
api_app.include_router(reports.router, prefix="/reports", tags=["Reports"])
api_app.include_router(reviews.router, prefix="/reviews", tags=["Reviews"])
# disregard muna -----------------



# For Localhost
# if __name__ == "__main__":
#     uvicorn.run("server:app", reload=True)

#For Mobile
# if __name__ == "__main__":
#     uvicorn.run("server:app", host="192.168.227.221", port=8000, reload=True)

# For Deployment
if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)



