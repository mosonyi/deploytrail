
from fastapi import FastAPI, HTTPException, status
from sqlmodel import SQLModel, Field, Session, create_engine, select
from typing import Optional, List
from datetime import datetime
import os

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add this right after `app = FastAPI()`
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:3000"] for stricter policy
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///app.db")
engine = create_engine(DATABASE_URL, echo=False)

class Deployment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    app: str
    environment: str
    version: str
    note: Optional[str] = None
    deployed_at: datetime = Field(default_factory=datetime.utcnow)

@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)

@app.post("/deployments", response_model=Deployment)
def create_deployment(deployment: Deployment):
    with Session(engine) as session:
        session.add(deployment)
        session.commit()
        session.refresh(deployment)
        return deployment

@app.get("/deployments", response_model=List[Deployment])
def read_deployments():
    with Session(engine) as session:
        statement = select(Deployment).order_by(Deployment.deployed_at.desc())
        results = session.exec(statement).all()
        return results

@app.delete("/deployments/{deployment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_deployment(deployment_id: int):
    with Session(engine) as session:
        deployment = session.get(Deployment, deployment_id)
        if not deployment:
            raise HTTPException(status_code=404, detail="Deployment not found")
        session.delete(deployment)
        session.commit()
        return