ALTER TABLE restaurants
  ADD COLUMN capacity INT NOT NULL DEFAULT 0,
  ADD COLUMN cuisine_type TEXT NOT NULL DEFAULT '',
  ADD COLUMN reservation_settings JSONB NOT NULL DEFAULT '{}';
