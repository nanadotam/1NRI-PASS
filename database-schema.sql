-- Kairos Pass Database Schema
-- Run this in your Supabase SQL editor to create the required tables

-- Create attendees table
CREATE TABLE IF NOT EXISTS attendees (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  hear_about TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  pass_color TEXT DEFAULT 'green',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create an index on email for faster queries
CREATE INDEX IF NOT EXISTS idx_attendees_email ON attendees(email);

-- Create an index on timestamp for faster ordering
CREATE INDEX IF NOT EXISTS idx_attendees_timestamp ON attendees(timestamp);

-- Enable Row Level Security (RLS)
ALTER TABLE attendees ENABLE ROW LEVEL SECURITY;

-- Create policies for the attendees table
-- Allow anyone to insert new attendees (for registration)
CREATE POLICY "Allow public insert" ON attendees
FOR INSERT TO public
WITH CHECK (true);

-- Allow anyone to read attendee data (for verification)
CREATE POLICY "Allow public read" ON attendees
FOR SELECT TO public
USING (true);

-- Only authenticated users can update or delete
CREATE POLICY "Allow authenticated update" ON attendees
FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated delete" ON attendees
FOR DELETE TO authenticated
USING (true); 