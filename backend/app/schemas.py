from pydantic import BaseModel
from typing import List, Optional

class SpecItem(BaseModel):
    label: str
    value: str

class ComponentBase(BaseModel):
    name: str
    category: str
    vendor: str
    price: int
    description: Optional[str] = None
    image: Optional[str] = None
    specs: List[SpecItem] = []

class ComponentCreate(ComponentBase):
    pass

class ComponentResponse(ComponentBase):
    id: int
