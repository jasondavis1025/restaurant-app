ALTER TABLE "menus"
DROP CONSTRAINT "chk_menus_order_ahead_days";

ALTER TABLE "menus"
DROP COLUMN "order_ahead_days";

ALTER TABLE "menus"
DROP COLUMN "allows_preorder";

ALTER TABLE "menu_categories"
DROP CONSTRAINT "uq_menu_categories_menu_name";

ALTER TABLE "menu_categories"
ADD CONSTRAINT "menu_categories_name_key" 
UNIQUE ("name");