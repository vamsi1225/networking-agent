CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  event_name TEXT,
  met_at DATE,
  company TEXT,
  transcript TEXT,
  narrative TEXT,
  spark_strength INT,
  commitment_signals JSONB DEFAULT '[]',
  warmth_score INT DEFAULT 100,
  last_contacted TIMESTAMP DEFAULT now(),
  embedding VECTOR(1536),

  created_at TIMESTAMP DEFAULT now()
);