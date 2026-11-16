#!/usr/bin/env python3
import json

products = [
    {
        "name": "Custom seat covers",
        "description": "Custom-fit tailored leather and fabric seat covers designed specifically for your vehicle model and interior theme.",
        "price": 35000.00,
    },
    {
        "name": "universal seat covers",
        "description": "High-quality universal fit seat covers with easy installation, durable material, and modern styling.",
        "price": 18500.00,
    },
    {
        "name": "3D carpets",
        "description": "Precision-molded 3D floor mats providing all-weather protection and anti-slip backing.",
        "price": 16500.00,
    },
    {
        "name": "Android players",
        "description": "High-definition IPS touchscreen Android multimedia player with Apple CarPlay, Android Auto, GPS, and Bluetooth.",
        "price": 38000.00,
    },
    {
        "name": "360 System",
        "description": "360-degree panoramic bird-view camera monitoring system with real-time 3D surround view for safe driving and parking.",
        "price": 85000.00,
    },
    {
        "name": "DVR/Dash camera",
        "description": "Dual front and rear full HD dash cam with night vision, wide-angle lens, parking monitoring, and loop recording.",
        "price": 22000.00,
    },
    {
        "name": "Door visors",
        "description": "Aerodynamic weather guards and door visors with custom fit chrome or smoke finish for rain and sun protection.",
        "price": 6500.00,
    },
    {
        "name": "Welcome light / Scuff light",
        "description": "LED illuminated door sill scuff plates and under-door puddle welcome logo lights with custom branding.",
        "price": 12500.00,
    },
    {
        "name": "Plastic protection",
        "description": "Interior and exterior plastic trim protection film and ceramic coating against UV damage, fading, and scratches.",
        "price": 15000.00,
    },
    {
        "name": "Tinted",
        "description": "High heat-rejection nano-ceramic solar control window tinting film for UV block and cabin privacy.",
        "price": 28000.00,
    },
    {
        "name": "Spoilers",
        "description": "Sporty rear boot lid and roof spoilers with aerodynamic styling and custom color-match paint or gloss black.",
        "price": 25000.00,
    },
    {
        "name": "Key covers",
        "description": "Premium TPU and carbon-fiber pattern smart remote key case covers for all automotive key fobs.",
        "price": 3500.00,
    },
    {
        "name": "Side step",
        "description": "Heavy-duty aluminum and steel running boards/side steps for SUVs and pickup trucks with non-slip stepping surface.",
        "price": 68000.00,
    },
    {
        "name": "Subwoofers",
        "description": "High-power active under-seat or trunk-mounted bass subwoofers with built-in amplifier for deep punchy audio.",
        "price": 42000.00,
    },
    {
        "name": "Android frames",
        "description": "OEM-fit dashboard fascia panels and replacement frames for Android player installation tailored to your car model.",
        "price": 7500.00,
    },
    {
        "name": "Fog light",
        "description": "High-intensity LED projector fog lamps with dual-color switch (white/yellow) and daytime running lights.",
        "price": 18000.00,
    },
    {
        "name": "Head lights",
        "description": "Custom LED/bi-xenon projector headlight assemblies, dynamic sequential indicators, and angel eye DRL upgrades.",
        "price": 95000.00,
    },
    {
        "name": "GR steering wheels",
        "description": "Sporty GR Gazoo Racing style steering wheel with premium perforated leather, carbon fiber accents, and red stitching.",
        "price": 55000.00,
    },
    {
        "name": "Universal steering wheels",
        "description": "Universal aftermarket sports steering wheels with ergonomic grip, horn button, and alloy spokes.",
        "price": 28000.00,
    },
    {
        "name": "Car covers",
        "description": "All-weather waterproof, dustproof, and UV-reflective full car body covers with soft scratch-free cotton lining.",
        "price": 12000.00,
    },
    {
        "name": "Arm rest",
        "description": "Center console armrest box with dual-layer storage compartment, padded leather top, and integrated USB charging ports.",
        "price": 14500.00,
    },
    {
        "name": "Chrome items",
        "description": "Exterior chrome styling packages including door handle covers, side mirror caps, and tail lamp garnish.",
        "price": 16000.00,
    },
    {
        "name": "Stainless steel trim",
        "description": "Premium stainless steel sill guards, window frame moldings, and bumper scuff protection accents.",
        "price": 19000.00,
    },
    {
        "name": "carbon fiber trims",
        "description": "Interior and exterior genuine and hydro-dipped carbon fiber styling trims for dashboard, center console, and mirrors.",
        "price": 26000.00,
    },
    {
        "name": "Sound system",
        "description": "Complete audio enhancement package with component speakers, tweeters, multi-channel amplifier, and acoustic dampening.",
        "price": 110000.00,
    },
    {
        "name": "Air freshners",
        "description": "Long-lasting luxury automotive air fresheners, aroma diffusers, and AC vent fragrance clips.",
        "price": 2500.00,
    },
    {
        "name": "steering covers",
        "description": "Premium slip-on ergonomic leather steering wheel covers with anti-slip inner lining.",
        "price": 4500.00,
    },
    {
        "name": "stitch steering covers",
        "description": "Hand-stitched custom wrap steering wheel covers tailored on-site with perforated leather and contrast stitching.",
        "price": 9500.00,
    },
    {
        "name": "Vacuum cleaners",
        "description": "High-suction portable 12V/rechargeable car vacuum cleaner with wet/dry attachments for deep cabin cleaning.",
        "price": 8500.00,
    },
    {
        "name": "Battery jumper packs",
        "description": "Emergency portable 12V lithium jump starter power bank with smart jumper cables and LED torch.",
        "price": 24000.00,
    },
    {
        "name": "wireless charger",
        "description": "Fast-charging wireless car charger mount and console integration pad with automated sensor grip and Qi standard.",
        "price": 11500.00,
    },
    {
        "name": "body kit",
        "description": "Complete aerodynamic body styling kit including front bumper lip spoiler, side skirts, and rear diffuser.",
        "price": 145000.00,
    },
]

sql_parts = [
    "-- SQL script to insert 32 AutoSpace products for the 2 business accounts in \"AutoSpace\" schema ONLY",
    "DO $$",
    "DECLARE",
    "  account RECORD;",
    "BEGIN",
    "  -- Iterate over all non-superadmin accounts in AutoSpace.profiles",
    "  FOR account IN ",
    "    SELECT user_id, email FROM \"AutoSpace\".profiles ",
    "    WHERE email != 'superadmin-autospace@buildstart.io'",
    "  LOOP",
    "    RAISE NOTICE 'Adding products for user: % (%)', account.email, account.user_id;",
]

for p in products:
    name_escaped = p["name"].replace("'", "''")
    desc_escaped = p["description"].replace("'", "''")
    price = p["price"]
    sql_parts.append(f"""
    IF NOT EXISTS (
      SELECT 1 FROM "AutoSpace".products 
      WHERE user_id = account.user_id AND lower(name) = lower('{name_escaped}')
    ) THEN
      INSERT INTO "AutoSpace".products (
        user_id, name, description, price, product_type, is_active, variations, images, delivery_price
      ) VALUES (
        account.user_id, '{name_escaped}', '{desc_escaped}', {price:.2f}, 'physical', true, '[]'::jsonb, '{{}}'::text[], 0
      );
    END IF;
    """)

sql_parts.append("""
  END LOOP;
END $$;
""")

output_sql = "\n".join(sql_parts)

with open("/home/kapi/Documents/AutoSpace/buildstart-selfhosted/db/04_insert_autospace_products.sql", "w") as f:
    f.write(output_sql)

print(f"Generated /home/kapi/Documents/AutoSpace/buildstart-selfhosted/db/04_insert_autospace_products.sql with {len(products)} products.")
