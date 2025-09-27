"""
HL7 Data Unescaping and Normalization Utilities
"""

import re
from typing import Dict, Optional

class HL7DataProcessor:
    """Handles HL7 data unescaping and normalization"""
    
    def __init__(self):
        # Default HL7 encoding characters
        self.field_separator = "|"
        self.component_separator = "^"
        self.repetition_separator = "~"
        self.escape_character = "\\"
        self.subcomponent_separator = "&"
        
        # HL7 escape sequences mapping
        self.escape_sequences = {
            "\\F\\": self.field_separator,
            "\\S\\": self.component_separator,
            "\\T\\": self.subcomponent_separator,
            "\\R\\": self.repetition_separator,
            "\\E\\": self.escape_character,
            "\\.br\\": "\n",  # Line break
            "\\.sp\\": " ",   # Space
            "\\.fi\\": "",    # Form feed
            "\\.nf\\": "",    # No break
        }
    
    def extract_encoding_chars(self, msh_segment: str) -> None:
        """
        Extract encoding characters from MSH segment
        MSH|^~\\&|... format
        """
        if not msh_segment.startswith("MSH"):
            return
            
        try:
            # MSH segment structure: MSH|^~\&|...
            encoding_chars = msh_segment[4:8]  # Get ^~\&
            if len(encoding_chars) >= 4:
                self.component_separator = encoding_chars[0]
                self.repetition_separator = encoding_chars[1]
                self.escape_character = encoding_chars[2]
                self.subcomponent_separator = encoding_chars[3]
                
                # Update escape sequences with actual characters
                self.escape_sequences = {
                    f"{self.escape_character}F{self.escape_character}": self.field_separator,
                    f"{self.escape_character}S{self.escape_character}": self.component_separator,
                    f"{self.escape_character}T{self.escape_character}": self.subcomponent_separator,
                    f"{self.escape_character}R{self.escape_character}": self.repetition_separator,
                    f"{self.escape_character}E{self.escape_character}": self.escape_character,
                    f"{self.escape_character}.br{self.escape_character}": "\n",
                    f"{self.escape_character}.sp{self.escape_character}": " ",
                    f"{self.escape_character}.fi{self.escape_character}": "",
                    f"{self.escape_character}.nf{self.escape_character}": "",
                }
        except IndexError:
            # Use defaults if parsing fails
            pass
    
    def unescape_text(self, text: Optional[str]) -> Optional[str]:
        """
        Unescape HL7 encoded text
        """
        if not text:
            return text
            
        unescaped = text
        
        # Apply escape sequence replacements
        for escaped, unescaped_char in self.escape_sequences.items():
            unescaped = unescaped.replace(escaped, unescaped_char)
        
        return unescaped
    
    def normalize_field(self, field: Optional[str]) -> Optional[str]:
        """
        Normalize an HL7 field by unescaping and cleaning
        """
        if not field:
            return field
            
        # Unescape the field
        normalized = self.unescape_text(field)
        
        # Remove extra whitespace
        if normalized:
            normalized = normalized.strip()
            # Replace multiple spaces with single space
            normalized = re.sub(r'\s+', ' ', normalized)
        
        return normalized if normalized else None
    
    def split_field_components(self, field: str) -> list:
        """
        Split HL7 field into components using component separator
        """
        if not field:
            return []
        
        return field.split(self.component_separator)
    
    def split_field_repetitions(self, field: str) -> list:
        """
        Split HL7 field into repetitions using repetition separator
        """
        if not field:
            return []
        
        return field.split(self.repetition_separator)
    
    def extract_field_value(self, field: str, component_index: int = 0, 
                          subcomponent_index: int = 0) -> Optional[str]:
        """
        Extract specific component/subcomponent from HL7 field
        """
        if not field:
            return None
        
        try:
            # Split by components
            components = self.split_field_components(field)
            if component_index >= len(components):
                return None
            
            component = components[component_index]
            
            # Split by subcomponents if needed
            if subcomponent_index > 0:
                subcomponents = component.split(self.subcomponent_separator)
                if subcomponent_index >= len(subcomponents):
                    return None
                component = subcomponents[subcomponent_index]
            
            return self.normalize_field(component)
        
        except (IndexError, AttributeError):
            return None
    
    def clean_patient_name(self, name_field: str) -> Dict[str, Optional[str]]:
        """
        Parse and clean HL7 patient name field (PID.5)
        Format: LAST^FIRST^MIDDLE^SUFFIX^PREFIX^DEGREE
        """
        components = self.split_field_components(name_field)
        
        return {
            "last_name": self.normalize_field(components[0]) if len(components) > 0 else None,
            "first_name": self.normalize_field(components[1]) if len(components) > 1 else None,
            "middle_name": self.normalize_field(components[2]) if len(components) > 2 else None,
            "suffix": self.normalize_field(components[3]) if len(components) > 3 else None,
            "prefix": self.normalize_field(components[4]) if len(components) > 4 else None,
            "degree": self.normalize_field(components[5]) if len(components) > 5 else None
        }
    
    def clean_address(self, address_field: str) -> Dict[str, Optional[str]]:
        """
        Parse and clean HL7 address field (PID.11)
        Format: STREET^OTHER^CITY^STATE^ZIP^COUNTRY
        """
        components = self.split_field_components(address_field)
        
        return {
            "street_address": self.normalize_field(components[0]) if len(components) > 0 else None,
            "other_designation": self.normalize_field(components[1]) if len(components) > 1 else None,
            "city": self.normalize_field(components[2]) if len(components) > 2 else None,
            "state": self.normalize_field(components[3]) if len(components) > 3 else None,
            "zip_code": self.normalize_field(components[4]) if len(components) > 4 else None,
            "country": self.normalize_field(components[5]) if len(components) > 5 else None
        }
    
    def clean_phone_number(self, phone_field: str) -> Optional[str]:
        """
        Clean and format phone number
        """
        if not phone_field:
            return None
        
        # Remove HL7 encoding
        clean_phone = self.normalize_field(phone_field)
        
        if not clean_phone:
            return None
        
        # Remove non-digit characters except + for international
        import re
        clean_phone = re.sub(r'[^\d+\-\(\)\s]', '', clean_phone)
        
        # Basic phone number cleanup
        clean_phone = clean_phone.strip()
        
        return clean_phone if clean_phone else None
    
    def extract_identifier(self, id_field: str, authority: str = None) -> Optional[str]:
        """
        Extract identifier from HL7 ID field
        Format: ID^CHECK_DIGIT^CHECK_DIGIT_SCHEME^ASSIGNING_AUTHORITY
        """
        if not id_field:
            return None
        
        components = self.split_field_components(id_field)
        
        if not components:
            return None
        
        # If authority is specified, check if it matches
        if authority and len(components) > 3:
            assigning_authority = self.normalize_field(components[3])
            if assigning_authority != authority:
                return None
        
        return self.normalize_field(components[0])
    
    def format_for_xml(self, text: Optional[str]) -> Optional[str]:
        """
        Format text for XML output (escape XML characters)
        """
        if not text:
            return text
        
        # Unescape HL7 first
        clean_text = self.unescape_text(text)
        
        if not clean_text:
            return clean_text
        
        # Escape XML special characters
        xml_escapes = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&apos;"
        }
        
        for char, escape in xml_escapes.items():
            clean_text = clean_text.replace(char, escape)
        
        return clean_text
    
    def format_for_json(self, text: Optional[str]) -> Optional[str]:
        """
        Format text for JSON output
        """
        if not text:
            return text
        
        # Unescape HL7 and normalize
        return self.normalize_field(text)


# Global processor instance
hl7_processor = HL7DataProcessor()