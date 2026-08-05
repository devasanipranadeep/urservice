from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import List

class NotificationResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    message: str
    is_read: bool
    created_at: datetime

class NotificationFeedResponse(BaseModel):
    items: List[NotificationResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

class UnreadCountResponse(BaseModel):
    count: int
