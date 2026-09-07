ALTER TABLE "menu_items"
ADD CONSTRAINT "uq_menu_items_category_name"
UNIQUE ("category_id", "name");