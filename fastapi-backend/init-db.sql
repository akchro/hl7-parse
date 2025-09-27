-- Initialize HL7 LiteBoard Database
-- This script creates the database and user if they don't exist

-- Create user if not exists
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles 
      WHERE rolname = 'hl7user') THEN
      
      CREATE USER hl7user WITH ENCRYPTED PASSWORD 'hl7password';
   END IF;
END
$do$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE hl7_liteboard TO hl7user;
GRANT ALL ON SCHEMA public TO hl7user;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";