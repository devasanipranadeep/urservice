import time
from fastapi import Request, HTTPException, status
from collections import defaultdict
from typing import Dict, List

class RateLimiter:
    """
    Sliding window in-memory rate limiter dependency for FastAPI.
    """
    def __init__(self, requests_per_minute: int = 15):
        self.requests_per_minute = requests_per_minute
        self.store: Dict[str, List[float]] = defaultdict(list)

    def __call__(self, request: Request):
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        
        # Filter timestamps to keep only those within the last 60 seconds
        timestamps = self.store[client_ip]
        timestamps = [t for t in timestamps if now - t < 60]
        self.store[client_ip] = timestamps
        
        if len(timestamps) >= self.requests_per_minute:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Rate limit exceeded. Please try again in a minute."
            )
            
        # Log this request timestamp
        self.store[client_ip].append(now)

# Standard rate limiting instance for upload / registry endpoints
upload_rate_limiter = RateLimiter(requests_per_minute=10)
