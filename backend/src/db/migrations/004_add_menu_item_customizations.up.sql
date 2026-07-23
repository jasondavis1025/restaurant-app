CREATE TABLE "menu_item_customizations" (
    "id" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "menu_item_id" BIGINT NOT NULL,
    "ingredient_id" BIGINT NOT NULL,
    "modifier_type" VARCHAR NOT NULL,
    "price_adjustment"  NUMERIC(10,2) NOT NULL DEFAULT 0,

    CONSTRAINT "chk_menu_item_customizations_modifier_type"
        CHECK ("modifier_type" IN ('remove', 'add', 'extra', 'light')),

    CONSTRAINT "chk_menu_item_customizations_price"
        CHECK ("price_adjustment" >= 0),

    CONSTRAINT "uq_menu_item_customizations"
        UNIQUE ("menu_item_id", "ingredient_id", "modifier_type"),

    CONSTRAINT "fk_menu_item_customizations_menu_item"
        FOREIGN KEY ("menu_item_id")
        REFERENCES "menu_items" ("id")
        ON DELETE CASCADE,
    
    CONSTRAINT "fk_menu_item_customizations_ingredient"
        FOREIGN KEY ("ingredient_id")
        REFERENCES "ingredients" ("id")
        ON DELETE CASCADE
);