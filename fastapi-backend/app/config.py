"""
Configuration settings for HL7 LiteBoard FastAPI backend
"""

import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Application settings"""
    
    # Application
    APP_NAME: str = "HL7 LiteBoard"
    DEBUG: bool = True
    SECRET_KEY: str = "your-secret-key-change-in-production"
    
    # Database
    DATABASE_URL: str = "postgresql://hl7user:hl7password@localhost:5432/hl7_liteboard"
    
    # CORS and Security
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080"
    ]
    ALLOWED_HOSTS: List[str] = ["*"]
    
    # File Upload
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    UPLOAD_DIR: str = "uploads"
    SAMPLE_FILES_DIR: str = "sample_files"
    
    # AI/Mastra Configuration
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
    MASTRA_ENDPOINT: str = "http://localhost:3001"  # Mastra service endpoint
    
    # Processing
    MAX_CONCURRENT_PROCESSES: int = 5
    PROCESS_TIMEOUT: int = 300  # 5 minutes
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Create settings instance
settings = Settings()