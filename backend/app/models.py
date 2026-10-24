from sqlalchemy import Column, Integer, String, Text
from .database import Base

class Component(Base):
    __tablename__ = "components"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    category = Column(String(50), nullable=False)
    vendor = Column(String(50), nullable=False)
    price = Column(Integer, nullable=False)
    description = Column(Text, nullable=True)
    image = Column(String(500), nullable=True)
    specs = Column(Text, nullable=True) 
