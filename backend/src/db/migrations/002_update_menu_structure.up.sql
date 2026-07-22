ALTER TABLE "menu_categories"
DROP CONSTRAINT "menu_categories_name_key";

ALTER TABLE "menu_categories"
ADD CONSTRAINT "uq_menu_categories_menu_name" 
UNIQUE ("menu_id", "name");

ALTER TABLE "menus"
ADD COLUMN "allows_preorder" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "menus"
ADD COLUMN "order_ahead_days" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "menus"
ADD CONSTRAINT "chk_menus_order_ahead_days" 
CHECK ("order_ahead_days" >= 0);