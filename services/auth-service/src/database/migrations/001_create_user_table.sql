-- Migration: 001_create_users_table
-- Created: 03 06 2026
-- Description: Creates the users table for authentication

-- UP
CREATE TABLE IF NOT EXISTS users(
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(255) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- DOWN
-- DROP TABLE IF EXISTS users;
-- DROP INDEX IF EXISTS idx_users_email;

