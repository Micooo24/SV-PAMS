from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Routes 
from routes import users

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

app.include_router(users.router, prefix="/users")

# if __name__ == "__main__":
#     uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
    


