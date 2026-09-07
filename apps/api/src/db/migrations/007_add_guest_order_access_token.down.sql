DROP INDEX IF EXISTS uq_orders_guest_access_token;

ALTER TABLE orders
DROP COLUMN IF EXISTS guest_access_token;