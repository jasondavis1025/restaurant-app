ALTER TABLE order_items
ADD COLUMN base_price numeric(10, 2) NOT NULL,
ADD COLUMN modifier_total numeric(10, 2) NOT NULL,
ADD COLUMN line_total numeric(10, 2) NOT NULL,
ADD COLUMN additional_instructions text;

ALTER TABLE order_items
ADD CONSTRAINT chk_order_items_base_price
CHECK (base_price >= 0),
ADD CONSTRAINT chk_order_items_modifier_total
CHECK (modifier_total >= 0),
ADD CONSTRAINT chk_order_items_line_total
CHECK (line_total >= 0);