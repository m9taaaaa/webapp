import json
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from . import models, schemas
from .database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="PC Parts API", description="API для каталога комплектующих")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/components", response_model=List[schemas.ComponentResponse])
def get_components(db: Session = Depends(get_db)):
    comps = db.query(models.Component).all()
    for c in comps:
        c.specs = json.loads(c.specs) if c.specs else []
    return comps

@app.post("/api/components", response_model=schemas.ComponentResponse, status_code=status.HTTP_201_CREATED)
def create_component(comp: schemas.ComponentCreate, db: Session = Depends(get_db)):
    specs_json = json.dumps([s.dict() for s in comp.specs], ensure_ascii=False)
    
    db_comp = models.Component(
        name=comp.name,
        category=comp.category,
        vendor=comp.vendor,
        price=comp.price,
        description=comp.description,
        image=comp.image,
        specs=specs_json
    )
    db.add(db_comp)
    db.commit()
    db.refresh(db_comp)
    db_comp.specs = comp.specs
    return db_comp

@app.get("/api/components/{comp_id}", response_model=schemas.ComponentResponse)
def get_component(comp_id: int, db: Session = Depends(get_db)):
    comp = db.query(models.Component).filter(models.Component.id == comp_id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Component not found")
    comp.specs = json.loads(comp.specs) if comp.specs else []
    return comp

@app.delete("/api/components/{comp_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_component(comp_id: int, db: Session = Depends(get_db)):
    comp = db.query(models.Component).filter(models.Component.id == comp_id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Component not found")
    db.delete(comp)
    db.commit()
    return None
