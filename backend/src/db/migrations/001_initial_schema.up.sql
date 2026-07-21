CREATE TABLE "users" (
  "id" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "email" varchar UNIQUE NOT NULL,
  "password_hash" varchar NOT NULL,
  "role" varchar NOT NULL,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now()),
  CONSTRAINT "chk_users_role" CHECK (role in ('customer', 'employee', 'admin'))
);

CREATE TABLE "customers" (
  "id" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "user_id" bigint UNIQUE NOT NULL,
  "first_name" varchar NOT NULL,
  "last_name" varchar NOT NULL,
  "phone" varchar
);

CREATE TABLE "employees" (
  "id" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "user_id" bigint UNIQUE NOT NULL,
  "first_name" varchar NOT NULL,
  "last_name" varchar NOT NULL,
  "phone" varchar
);

CREATE TABLE "employee_locations" (
  "employee_id" bigint NOT NULL,
  "location_id" bigint NOT NULL,
  PRIMARY KEY ("employee_id", "location_id")
);

CREATE TABLE "locations" (
  "id" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "name" varchar NOT NULL,
  "phone" varchar,
  "street" varchar,
  "city" varchar,
  "state" varchar,
  "zip" varchar,
  "is_active" boolean NOT NULL DEFAULT true
);

CREATE TABLE "menus" (
  "id" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "name" VARCHAR NOT NULL,
  "slug" VARCHAR NOT NULL UNIQUE,
  "start_time" TIME,
  "end_time" TIME
);

CREATE TABLE "menu_categories" (
  "id" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "menu_id" BIGINT NOT NULL,
  "name" varchar UNIQUE NOT NULL
);

CREATE TABLE "menu_items" (
  "id" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "category_id" bigint NOT NULL,
  "name" varchar NOT NULL,
  "description" text,
  "item_type" varchar NOT NULL,
  "base_price" numeric(10,2) NOT NULL,
  "image_url" varchar,
  CONSTRAINT "chk_menu_items_type" CHECK (item_type in ('dish', 'drink', 'combo')),
  CONSTRAINT "chk_menu_items_base_price" CHECK (base_price >= 0)
);

CREATE TABLE "location_menu_items" (
  "location_id" bigint NOT NULL,
  "menu_item_id" bigint NOT NULL,
  "price" numeric(10,2),
  "is_available" boolean NOT NULL DEFAULT true,
  CONSTRAINT "chk_location_menu_items_price" CHECK (price is null or price >= 0),
  PRIMARY KEY ("location_id", "menu_item_id")
);

CREATE TABLE "ingredients" (
  "id" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "name" varchar UNIQUE NOT NULL
);

CREATE TABLE "menu_item_ingredients" (
  "menu_item_id" bigint NOT NULL,
  "ingredient_id" bigint NOT NULL,
  PRIMARY KEY ("menu_item_id", "ingredient_id")
);

CREATE TABLE "combo_items" (
  "combo_id" bigint NOT NULL,
  "menu_item_id" bigint NOT NULL,
  "quantity" int NOT NULL DEFAULT 1,
  CONSTRAINT "chk_combo_items_quantity" CHECK (quantity > 0),
  PRIMARY KEY ("combo_id", "menu_item_id")
);

CREATE TABLE "spice_levels" (
  "id" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "name" varchar UNIQUE NOT NULL
);

CREATE TABLE "customer_menu_item_preferences" (
  "id" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "customer_id" bigint NOT NULL,
  "menu_item_id" bigint NOT NULL,
  "spice_level_id" bigint
);

CREATE TABLE "customer_menu_item_ingredient_preferences" (
  "id" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "customer_menu_item_preference_id" bigint NOT NULL,
  "ingredient_id" bigint NOT NULL,
  "modifier_type" varchar NOT NULL,
  CONSTRAINT "chk_customer_preferences_modifier_type" CHECK (modifier_type in ('remove', 'add', 'extra', 'light'))
);

CREATE TABLE "customer_addresses" (
  "id" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "customer_id" bigint NOT NULL,
  "street" varchar NOT NULL,
  "city" varchar NOT NULL,
  "state" varchar NOT NULL,
  "zip" varchar NOT NULL,
  "is_default" boolean NOT NULL DEFAULT false
);

CREATE TABLE "orders" (
  "id" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "location_id" bigint NOT NULL,
  "customer_id" bigint,
  "address_id" bigint,
  "customer_name" varchar NOT NULL,
  "customer_phone" varchar NOT NULL,
  "customer_email" varchar NOT NULL,
  "delivery_name" varchar,
  "delivery_phone" varchar,
  "delivery_street" varchar,
  "delivery_city" varchar,
  "delivery_state" varchar,
  "delivery_zip" varchar,
  "status" varchar NOT NULL,
  "order_type" varchar NOT NULL,
  "subtotal" numeric(10,2) NOT NULL,
  "tax" numeric(10,2) NOT NULL,
  "tip" numeric(10,2) NOT NULL DEFAULT 0,
  "total" numeric(10,2) NOT NULL,
  "scheduled_for" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now()),
  CONSTRAINT "chk_orders_status" CHECK (status in ('cart', 'pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')),
  CONSTRAINT "chk_orders_type" CHECK (order_type in ('pickup', 'delivery')),
  CONSTRAINT "chk_orders_subtotal" CHECK (subtotal >= 0),
  CONSTRAINT "chk_orders_tax" CHECK (tax >= 0),
  CONSTRAINT "chk_orders_tip" CHECK (tip >= 0),
  CONSTRAINT "chk_orders_total" CHECK (total >= 0)
);

CREATE TABLE "order_items" (
  "id" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "order_id" bigint NOT NULL,
  "menu_item_id" bigint NOT NULL,
  "item_name" varchar NOT NULL,
  "item_description" text,
  "quantity" int NOT NULL,
  "unit_price" numeric(10,2) NOT NULL,
  "spice_level_id" bigint,
  CONSTRAINT "chk_order_items_quantity" CHECK (quantity > 0),
  CONSTRAINT "chk_order_items_unit_price" CHECK (unit_price >= 0)
);

CREATE TABLE "order_item_modifiers" (
  "id" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "order_item_id" bigint NOT NULL,
  "ingredient_id" bigint NOT NULL,
  "ingredient_name" varchar NOT NULL,
  "modifier_type" varchar NOT NULL,
  "price_adjustment" numeric(10,2) NOT NULL DEFAULT 0,
  CONSTRAINT "chk_order_item_modifiers_type" CHECK (modifier_type in ('remove', 'add', 'extra', 'light')),
  CONSTRAINT "chk_order_item_modifiers_price" CHECK (price_adjustment >= 0)
);

CREATE TABLE "payments" (
  "id" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "order_id" bigint NOT NULL,
  "amount" numeric(10,2) NOT NULL,
  "status" varchar NOT NULL,
  "provider" varchar,
  "provider_payment_id" varchar UNIQUE,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  CONSTRAINT "chk_payments_status" CHECK (status in ('pending', 'paid', 'failed', 'refunded')),
  CONSTRAINT "chk_payments_amount" CHECK (amount >= 0)
);

CREATE UNIQUE INDEX ON "customer_menu_item_preferences" ("customer_id", "menu_item_id");

ALTER TABLE "customers" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "employees" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "menu_items" ADD FOREIGN KEY ("category_id") REFERENCES "menu_categories" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "menu_categories" ADD FOREIGN KEY ("menu_id") REFERENCES "menus" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "location_menu_items" ADD FOREIGN KEY ("location_id") REFERENCES "locations" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "location_menu_items" ADD FOREIGN KEY ("menu_item_id") REFERENCES "menu_items" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "employee_locations" ADD FOREIGN KEY ("employee_id") REFERENCES "employees" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "employee_locations" ADD FOREIGN KEY ("location_id") REFERENCES "locations" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "menu_item_ingredients" ADD FOREIGN KEY ("menu_item_id") REFERENCES "menu_items" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "menu_item_ingredients" ADD FOREIGN KEY ("ingredient_id") REFERENCES "ingredients" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "combo_items" ADD FOREIGN KEY ("combo_id") REFERENCES "menu_items" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "combo_items" ADD FOREIGN KEY ("menu_item_id") REFERENCES "menu_items" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "combo_items" ADD CONSTRAINT "chk_combo_not_self" CHECK ("combo_id" <> "menu_item_id");

ALTER TABLE "customer_menu_item_preferences" ADD FOREIGN KEY ("customer_id") REFERENCES "customers" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "customer_menu_item_preferences" ADD FOREIGN KEY ("menu_item_id") REFERENCES "menu_items" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "customer_menu_item_preferences" ADD FOREIGN KEY ("spice_level_id") REFERENCES "spice_levels" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "customer_menu_item_ingredient_preferences" ADD FOREIGN KEY ("customer_menu_item_preference_id") REFERENCES "customer_menu_item_preferences" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "customer_menu_item_ingredient_preferences" ADD FOREIGN KEY ("ingredient_id") REFERENCES "ingredients" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "customer_addresses" ADD FOREIGN KEY ("customer_id") REFERENCES "customers" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "orders" ADD FOREIGN KEY ("location_id") REFERENCES "locations" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "orders" ADD FOREIGN KEY ("customer_id") REFERENCES "customers" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "orders" ADD FOREIGN KEY ("address_id") REFERENCES "customer_addresses" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "orders"
ADD CONSTRAINT "chk_orders_delivery_fields"
CHECK (
  "order_type" = 'pickup'
  OR (
    "delivery_name" IS NOT NULL
    AND length(trim("delivery_name")) > 0
    AND "delivery_phone" IS NOT NULL
    AND length(trim("delivery_phone")) > 0
    AND "delivery_street" IS NOT NULL
    AND length(trim("delivery_street")) > 0
    AND "delivery_city" IS NOT NULL
    AND length(trim("delivery_city")) > 0
    AND "delivery_state" IS NOT NULL
    AND length(trim("delivery_state")) > 0
    AND "delivery_zip" IS NOT NULL
    AND length(trim("delivery_zip")) > 0
  )
);

ALTER TABLE "order_items" ADD FOREIGN KEY ("order_id") REFERENCES "orders" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "order_items" ADD FOREIGN KEY ("menu_item_id") REFERENCES "menu_items" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "order_items" ADD FOREIGN KEY ("spice_level_id") REFERENCES "spice_levels" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "order_item_modifiers" ADD FOREIGN KEY ("order_item_id") REFERENCES "order_items" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "order_item_modifiers" ADD FOREIGN KEY ("ingredient_id") REFERENCES "ingredients" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "payments" ADD FOREIGN KEY ("order_id") REFERENCES "orders" ("id") DEFERRABLE INITIALLY IMMEDIATE;
