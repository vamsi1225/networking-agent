CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  event_name TEXT,
  met_at TIMESTAMP DEFAULT now(),
  transcript TEXT,
  narrative TEXT,
  company TEXT,
  topics TEXT[],
  warmth_score INT DEFAULT 100,
  last_contacted TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now()
);