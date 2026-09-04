ALTER TABLE orders
ADD COLUMN guest_access_token TEXT;

CREATE UNIQUE INDEX uq_orders_guest_access_token
ON orders (guest_access_token)
WHERE guest_access_token IS NOT NULL;