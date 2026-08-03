ALTER TABLE order_items
DROP CONSTRAINT IF EXISTS chk_order_items_base_price,
DROP CONSTRAINT IF EXISTS chk_order_items_modifier_total,
DROP CONSTRAINT IF EXISTS chk_order_items_line_total;

ALTER TABLE order_items
DROP COLUMN IF EXISTS base_price,
DROP COLUMN IF EXISTS modifier_total,
DROP COLUMN IF EXISTS line_total,
DROP COLUMN IF EXISTS additional_instructions;