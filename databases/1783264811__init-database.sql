CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE restaurants (
    id UUID PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    address TEXT NOT NULL,
    image_url TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    rating FLOAT NOT NULL,
    comments_count INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_restaurants_updated_at
BEFORE UPDATE ON restaurants
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE reservations (
    id UUID PRIMARY KEY NOT NULL,
    restaurant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    party_size INT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('confirmed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_reservations_updated_at
BEFORE UPDATE ON reservations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
