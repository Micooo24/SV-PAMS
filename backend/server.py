from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import sys
import traceback
import time
from datetime import datetime

# Declaration
app = FastAPI()

# Try importing routes with error handling
try:
    print("Importing routes...")
    from routes import users, appointments, permit_applications, vendors, reports, reviews, base_documents, document_submissions, vendor_carts
    print("Routes imported successfully!")
except ImportError as e:
    print(f"ERROR importing routes: {e}")
    traceback.print_exc()
    sys.exit(1)

# CORS
origins = [
    "http://localhost:5173",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "http://192.168.1.7:8000",
    "http://192.168.1.182:8000",
    "http://192.168.27.41:8000",
    "http://192.168.27.70:8000",
    "http://10.218.241.95:8000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request logging middleware
@app.middleware("http")
async def log_requests(request, call_next):
    start_time = time.time()
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Log incoming request
    print(f"\n{'='*60}")
    print(f"[{timestamp}] Incoming Request")
    print(f"Method: {request.method}")
    print(f"Path: {request.url.path}")
    print(f"Client: {request.client.host if request.client else 'Unknown'}")
    print(f"{'='*60}")
    
    # Process request
    response = await call_next(request)
    
    # Calculate execution time
    process_time = time.time() - start_time
    print(f"Status: {response.status_code}")
    print(f"Execution time: {process_time:.4f}s")
    print(f"{'='*60}\n")
    
    return response

# For API versioning
api_app = FastAPI()

# Mount all `/api` routes
app.mount("/api", api_app)

# Include routers with error handling
try:
    print("Registering routes...")
    
    # users api
    api_app.include_router(users.router, prefix="/users", tags=["Users"])
    print("✓ Users routes registered")
    
    api_app.include_router(document_submissions.router, prefix="/users/document-submissions", tags=["User Document Submissions"])
    print("✓ Document submissions routes registered")
    
    # admin api
    api_app.include_router(base_documents.router, prefix="/admin/base-documents", tags=["Admin Base Documents"])
    print("✓ Base documents routes registered")
    
    # models api
    api_app.include_router(vendor_carts.router, prefix="/vendor/carts", tags=["Vendor Carts Detection"])
    print("✓ Vendor carts routes registered")
    
    # disregard muna -----------------
    api_app.include_router(appointments.router, prefix="/appointments", tags=["Appointments"])
    api_app.include_router(permit_applications.router, prefix="/permit-applications", tags=["Permit Applications"])
    api_app.include_router(vendors.router, prefix="/vendors", tags=["Vendors"])
    api_app.include_router(reports.router, prefix="/reports", tags=["Reports"])
    api_app.include_router(reviews.router, prefix="/reviews", tags=["Reviews"])
    print("✓ Additional routes registered")
    
    print(f"\nTotal routes registered: {len(api_app.routes)}")
    
except Exception as e:
    print(f"ERROR registering routes: {e}")
    traceback.print_exc()

# Add a test endpoint to verify server is working
@app.get("/")
async def root():
    return {"message": "SV-PAMS Backend API is running", "status": "ok"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "routes_count": len(api_app.routes)}

#For Mobile Development
if __name__ == "__main__":
    import socket
    hostname = socket.gethostname()
    local_ip = socket.gethostbyname(hostname)
    print(f"\n{'='*50}")
    print(f"Backend server starting...")
    print(f"Your computer's IP: {local_ip}")
    print(f"Mobile devices should use: http://{local_ip}:8000")
    print(f"Web frontend should use: http://localhost:8000")
    print(f"API Documentation: http://localhost:8000/docs")
    print(f"Alternative docs: http://{local_ip}:8000/docs")
    print(f"{'='*50}\n")
    
    # Log all registered routes
    print("Registered API Routes:")
    for route in api_app.routes:
        print(f"  {route.methods} {route.path}")
    print(f"{'='*50}\n")
    
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)


