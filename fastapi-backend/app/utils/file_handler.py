"""
File handling utilities for HL7 LiteBoard
"""

import os
import aiofiles
from typing import List, Optional, Tuple
from pathlib import Path
from datetime import datetime

from app.config import settings

class FileHandler:
    """Handles file operations for HL7 files"""
    
    def __init__(self):
        self.upload_dir = Path(settings.UPLOAD_DIR)
        self.sample_files_dir = Path(settings.SAMPLE_FILES_DIR)
        
        # Create directories if they don't exist
        self.upload_dir.mkdir(exist_ok=True)
        self.sample_files_dir.mkdir(exist_ok=True)
    
    async def save_uploaded_file(self, filename: str, content: bytes) -> str:
        """
        Save uploaded file and return the file path
        """
        # Generate unique filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_filename = self._sanitize_filename(filename)
        unique_filename = f"{timestamp}_{safe_filename}"
        
        file_path = self.upload_dir / unique_filename
        
        async with aiofiles.open(file_path, "wb") as f:
            await f.write(content)
        
        return str(file_path)
    
    async def read_file(self, file_path: str) -> str:
        """
        Read file content as text
        """
        try:
            async with aiofiles.open(file_path, "r", encoding="utf-8") as f:
                return await f.read()
        except UnicodeDecodeError:
            # Try with different encoding
            async with aiofiles.open(file_path, "r", encoding="latin-1") as f:
                return await f.read()
    
    async def read_sample_file(self, filename: str) -> Tuple[str, str]:
        """
        Read sample file content and return (filename, content)
        """
        file_path = self.sample_files_dir / filename
        
        if not file_path.exists():
            raise FileNotFoundError(f"Sample file '{filename}' not found")
        
        content = await self.read_file(str(file_path))
        return filename, content
    
    def list_sample_files(self) -> List[dict]:
        """
        List all available sample files with metadata
        """
        sample_files = []
        
        for file_path in self.sample_files_dir.glob("*.hl7"):
            if file_path.is_file():
                stat = file_path.stat()
                
                # Determine message type from filename
                message_type = self._determine_message_type(file_path.name)
                
                sample_files.append({
                    "filename": file_path.name,
                    "description": self._get_file_description(file_path.name),
                    "message_type": message_type,
                    "file_size": stat.st_size,
                    "last_modified": datetime.fromtimestamp(stat.st_mtime)
                })
        
        return sorted(sample_files, key=lambda x: x["filename"])
    
    def _sanitize_filename(self, filename: str) -> str:
        """
        Sanitize filename to prevent path traversal and invalid characters
        """
        # Remove path components
        filename = os.path.basename(filename)
        
        # Replace invalid characters
        invalid_chars = '<>:"/\\|?*'
        for char in invalid_chars:
            filename = filename.replace(char, "_")
        
        # Limit length
        if len(filename) > 100:
            name, ext = os.path.splitext(filename)
            filename = name[:90] + ext
        
        return filename
    
    def _determine_message_type(self, filename: str) -> str:
        """
        Determine HL7 message type from filename
        """
        filename_lower = filename.lower()
        
        if "adt" in filename_lower:
            return "ADT"
        elif "oru" in filename_lower:
            return "ORU"
        elif "orm" in filename_lower:
            return "ORM"
        elif "siu" in filename_lower:
            return "SIU"
        elif "mdm" in filename_lower:
            return "MDM"
        else:
            return "Unknown"
    
    def _get_file_description(self, filename: str) -> str:
        """
        Get human-readable description of sample file
        """
        descriptions = {
            "adt_admission.hl7": "Patient admission to ICU with allergies and demographics",
            "adt_discharge.hl7": "Patient discharge with diagnoses and procedures",
            "oru_lab_results.hl7": "Laboratory results including CBC and metabolic panel",
            "orm_medication_order.hl7": "Medication orders including cardiac medications"
        }
        
        return descriptions.get(filename, "HL7 message sample file")
    
    async def delete_file(self, file_path: str) -> bool:
        """
        Delete a file safely
        """
        try:
            path = Path(file_path)
            if path.exists() and path.is_file():
                path.unlink()
                return True
            return False
        except Exception:
            return False
    
    def get_file_size(self, file_path: str) -> int:
        """
        Get file size in bytes
        """
        try:
            return Path(file_path).stat().st_size
        except (OSError, FileNotFoundError):
            return 0
    
    def is_valid_hl7_file(self, content: str) -> bool:
        """
        Basic validation to check if content looks like HL7
        """
        if not content or len(content.strip()) < 10:
            return False
        
        # Check if it starts with MSH segment
        lines = content.strip().split('\n')
        first_line = lines[0].strip()
        
        return first_line.startswith("MSH|")


# Global file handler instance
file_handler = FileHandler()