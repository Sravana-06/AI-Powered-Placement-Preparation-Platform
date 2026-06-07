from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.resume import router as resume_router
from routes.ats import router as ats_router
from routes.interview import router as interview_router
from routes.coding import router as coding_router
from routes.code_runner import router as code_runner_router

app = FastAPI(title="PrepAI Python Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:3000",
    "https://your-frontend-url.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "PrepAI Python backend is running successfully"}


app.include_router(resume_router, prefix="/api/resume", tags=["Resume"])
app.include_router(ats_router, prefix="/api/ats", tags=["ATS"])
app.include_router(interview_router, prefix="/api/interview", tags=["Interview"])
app.include_router(coding_router, prefix="/api/coding", tags=["Coding"])
app.include_router(code_runner_router, prefix="/api/code", tags=["Code Runner"])