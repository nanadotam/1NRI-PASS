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
  created_at timestamp with time zone default now()
);
