ALTER TABLE restaurants
  ALTER COLUMN capacity DROP DEFAULT,
  ALTER COLUMN cuisine_type DROP DEFAULT,
  ALTER COLUMN reservation_settings DROP DEFAULT;
