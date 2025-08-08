-- Database setup for Radius Captive Portal
-- Run this script in your PostgreSQL database

-- Create user_registrations table for storing user data
CREATE TABLE IF NOT EXISTS user_registrations (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_registrations_email ON user_registrations(email);
CREATE INDEX IF NOT EXISTS idx_user_registrations_created_at ON user_registrations(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_registrations_updated_at 
    BEFORE UPDATE ON user_registrations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Note: The radcheck table should already exist in your FreeRADIUS database
-- This table is used by FreeRADIUS for authentication
-- The web app will insert records into this table when users register

-- Optional: Create a view for easy reporting
CREATE OR REPLACE VIEW user_report AS
SELECT 
    ur.id,
    ur.full_name,
    ur.company_name,
    ur.email,
    ur.phone_number,
    ur.created_at,
    rc.username as radius_username,
    rc.attribute as radius_attribute,
    rc.value as radius_value
FROM user_registrations ur
LEFT JOIN radcheck rc ON ur.email = rc.username
ORDER BY ur.created_at DESC;

-- Grant necessary permissions (adjust as needed)
-- GRANT SELECT, INSERT, UPDATE ON user_registrations TO your_app_user;
-- GRANT SELECT, INSERT ON radcheck TO your_app_user;
