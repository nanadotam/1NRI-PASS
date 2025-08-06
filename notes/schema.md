create table kairos_passes (
  id uuid primary key default uuid_generate_v4(),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone_number text,
  heard_about text,
  verse_reference text,
  verse_text text,
  message_text text,
  theme text default 'dark-green',
  pass_id text unique, -- KAIROS-#### format eg: KAIROS-0011
  created_at timestamp with time zone default now()
);

-- Add pass_id column to existing table if it doesn't exist
-- ALTER TABLE kairos_passes ADD COLUMN IF NOT EXISTS pass_id text unique;

-- Create index on pass_id for faster lookups
-- CREATE INDEX IF NOT EXISTS idx_kairos_passes_pass_id ON kairos_passes(pass_id);

