Supabase SQL snippets for OpenScope

Paste the following SQL into the Supabase SQL editor to create minimal tables and sample data used by the site.

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
id uuid PRIMARY KEY,
name text,
email text UNIQUE,
bio text,
avatar_url text,
created_at timestamptz DEFAULT now()
);

-- Writers table (emails for writer permissions)
CREATE TABLE IF NOT EXISTS writers (
id serial PRIMARY KEY,
email text UNIQUE NOT NULL,
name text,
role text,
created_at timestamptz DEFAULT now()
);

-- Articles table
CREATE TABLE IF NOT EXISTS articles (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
title text NOT NULL,
summary text,
content text NOT NULL,
image_url text,
category text,
tags text[],
author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
is_featured boolean DEFAULT false,
published boolean DEFAULT false,
created_at timestamptz DEFAULT now()
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
article_id uuid REFERENCES articles(id) ON DELETE CASCADE,
user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
content text NOT NULL,
created_at timestamptz DEFAULT now()
);

-- Newsletter subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
id serial PRIMARY KEY,
email text UNIQUE NOT NULL,
subscribed_at timestamptz DEFAULT now()
);

-- Sample data (replace emails with real contributor addresses as needed)
INSERT INTO writers (email, name, role) VALUES
('writer1@openscope.team','Alex Johnson','Writer'),
('writer2@openscope.team','Maya Rodriguez','Writer'),
('writer3@openscope.team','Jordan Lee','Writer')
ON CONFLICT (email) DO NOTHING;

-- Note: run `SELECT * FROM writers;` to verify sample writers were inserted.

-- If gen_random_uuid() is not available, enable pgcrypto in Supabase SQL:
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- End of OpenScope Supabase helper SQL
